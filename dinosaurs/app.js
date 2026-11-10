/* Isolated dinosaur game: no changes to existing animal, math or insect games. */
(() => {
  'use strict';
  const dinos=globalThis.HOSU_DINOSAURS;
  const core=globalThis.HOSU_DINO_CORE;
  if(!Array.isArray(dinos)||!core){document.body.textContent='공룡 게임 자료를 불러오지 못했어요.';return;}
  const $=id=>document.getElementById(id);
  const screenNames=['modeScreen','quizScreen','finishScreen','puzzleScreen'];
  const titles={name:'공룡 이름',period:'살았던 시대',diet:'먹이'};
  let questions=[],questionIndex=0,score=0,missed=false,answered=false,mode='name',nextTimer=null;
  let puzzle=null,puzzleToken=0;
  const clearTimer=()=>{if(nextTimer!==null){clearTimeout(nextTimer);nextTimer=null;}};
  function stopVoice(){if('speechSynthesis' in window){try{window.speechSynthesis.cancel()}catch(e){}}}
  function speak(text){
    if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return;
    stopVoice();
    try{
      const utterance=new SpeechSynthesisUtterance(core.speechText(text));
      utterance.lang='ko-KR';utterance.rate=.88;
      const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ko'));
      if(voice)utterance.voice=voice;
      window.speechSynthesis.speak(utterance);
    }catch(e){/* Game remains usable without speech. */}
  }
  function showScreen(id){
    clearTimer();stopVoice();
    screenNames.forEach(name=>{$(name).hidden=name!==id;});
    if(id!=='puzzleScreen')++puzzleToken;
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showModes(){showScreen('modeScreen');}
  function startQuiz(selectedMode){
    mode=selectedMode;
    questions=core.createQuestions(dinos,mode,10);
    questionIndex=0;score=0;
    $('quizModeTitle').textContent=titles[mode]+' 맞히기';
    showScreen('quizScreen');
    renderQuestion();
  }
  function renderQuestion(){
    if(questionIndex>=questions.length){showFinish();return;}
    answered=false;missed=false;
    const q=questions[questionIndex];
    $('questionNumber').textContent=(questionIndex+1)+' / '+questions.length;
    $('score').textContent=String(score);
    $('questionPrompt').textContent=mode==='name'
      ?'이 공룡의 이름은 무엇일까요?'
      :mode==='period'?q.name+'는 어느 시대에 살았을까요?':q.name+'는 주로 무엇을 먹었을까요?';
    $('dinoClue').textContent=mode==='name'?q.clue:'공룡의 특징: '+q.clue;
    const photo=$('dinoPhoto'),fallback=$('photoFallback');
    photo.onload=()=>{if(questions[questionIndex]!==q)return;photo.hidden=false;fallback.hidden=true;};
    photo.onerror=()=>{if(questions[questionIndex]!==q)return;photo.hidden=true;fallback.hidden=false;};
    photo.hidden=true;fallback.hidden=false;
    fallback.textContent=mode==='name'?'공룡 사진을 불러오지 못했어요. 특징을 읽고 골라 봐!':'공룡 사진을 연결하고 있어요.';
    photo.alt=q.name+' 그림';
    photo.src=q.photo;
    $('quizFeedback').textContent='';
    const container=$('answerList');container.replaceChildren();
    q.choices.forEach(choice=>{
      const button=document.createElement('button');
      button.type='button';button.textContent=choice;
      button.addEventListener('click',()=>chooseAnswer(q,choice,button));
      container.append(button);
    });
  }
  function chooseAnswer(question,choice,button){
    if(answered||question!==questions[questionIndex])return;
    const grade=core.evaluate(question,choice,missed);
    if(!grade.correct){
      missed=true;
      button.classList.add('wrong');button.disabled=true;
      $('quizFeedback').textContent='아쉬워! 다른 답을 골라 봐.';
      return;
    }
    answered=true;score+=grade.award;
    $('score').textContent=String(score);
    button.classList.add('correct');
    $('answerList').querySelectorAll('button').forEach(el=>{el.disabled=true;});
    const message='정답! '+question.name+', '+grade.award+'점';
    $('quizFeedback').textContent=message+' · 다음 문제로 넘어가요.';
    speak(message);
    nextTimer=setTimeout(()=>{nextTimer=null;questionIndex++;renderQuestion();},1550);
  }
  function showFinish(){
    showScreen('finishScreen');
    $('finalScore').textContent=score+' / '+questions.length+'점';
    $('finishMessage').textContent='공룡 '+questions.length+'문제를 모두 풀었어!';
  }
  function showPuzzleMenu(){
    showScreen('puzzleScreen');
    $('puzzleDifficulty').hidden=false;
    $('puzzleGame').hidden=true;
  }
  function loadImage(src){
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>resolve(null);
      img.decoding='async';img.src=src;
    });
  }
  async function pickImage(token){
    for(const d of core.shuffle(dinos)){
      const src='images/'+d.id+'.webp';
      const img=await loadImage(src);
      if(token!==puzzleToken)return null;
      if(img)return {d,img,src};
    }
    return null;
  }
  function squareImage(img){
    const side=768,canvas=document.createElement('canvas');canvas.width=canvas.height=side;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fffdf4';ctx.fillRect(0,0,side,side);
    const scale=Math.min(side/img.naturalWidth,side/img.naturalHeight);
    const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
    ctx.drawImage(img,(side-width)/2,(side-height)/2,width,height);
    return canvas.toDataURL('image/webp',.83);
  }
  async function startPuzzle(size){
    const token=++puzzleToken;
    $('puzzleDifficulty').hidden=true;$('puzzleGame').hidden=false;
    $('puzzleName').textContent='그림을 확인하고 있어요…';$('puzzleCount').textContent='';
    $('puzzleMessage').textContent='공룡 그림을 불러오고 있어요…';
    $('puzzleBoard').replaceChildren();$('puzzleTray').replaceChildren();
    $('puzzleComplete').hidden=true;$('puzzleReference').hidden=true;
    $('togglePicture').textContent='👀 완성 그림 보기';
    const found=await pickImage(token);
    if(token!==puzzleToken)return;
    if(!found){
      $('puzzleMessage').textContent='공룡 이미지 파일이 아직 연결되지 않았어요. 그림이 올라오면 퍼즐을 할 수 있어요.';
      $('puzzleName').textContent='공룡 그림 준비중';
      return;
    }
    let url;
    try{url=squareImage(found.img)}catch(e){
      $('puzzleMessage').textContent='그림을 준비하지 못했어요. 다시 시작해 주세요.';return;
    }
    const count=size*size;
    puzzle={size,total:count,name:found.d.name,url,selected:null,placed:new Set(),token};
    $('puzzleName').textContent=found.d.name;
    $('puzzleCount').textContent='0 / '+count;
    $('puzzleReference').src=url;
    const board=$('puzzleBoard'),tray=$('puzzleTray');
    board.style.setProperty('--puzzle-size',size);
    for(let i=0;i<count;i++){
      const slot=document.createElement('button');slot.type='button';slot.className='puzzle-slot';
      slot.setAttribute('aria-label',(Math.floor(i/size)+1)+'번째 줄 '+(i%size+1)+'번째 빈칸');
      slot.addEventListener('click',()=>placePiece(i));
      slot.addEventListener('dragover',e=>e.preventDefault());
      slot.addEventListener('drop',e=>{e.preventDefault();const selected=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(selected)&&selected>=0&&selected<count){selectPiece(selected);placePiece(i);}});
      board.append(slot);
    }
    core.shuffle(Array.from({length:count},(_,i)=>i)).forEach(i=>{
      const piece=document.createElement('button');piece.type='button';piece.className='puzzle-piece';
      piece.dataset.index=String(i);piece.draggable=true;
      piece.setAttribute('aria-label','퍼즐 조각 '+(i+1));
      paintTile(piece,i,size,url);
      piece.addEventListener('click',()=>selectPiece(i));
      piece.addEventListener('dragstart',e=>{selectPiece(i);e.dataTransfer.setData('text/plain',String(i));});
      tray.append(piece);
    });
    $('puzzleMessage').textContent='조각을 먼저 누르고 알맞은 빈칸을 눌러 봐. 컴퓨터에서는 끌어다 놓아도 돼!';
  }
  function paintTile(el,i,size,url){
    el.style.backgroundImage='url("'+url+'")';
    el.style.backgroundSize=(size*100)+'% '+(size*100)+'%';
    el.style.backgroundPosition=((i%size)/(size-1)*100)+'% '+(Math.floor(i/size)/(size-1)*100)+'%';
  }
  function selectPiece(i){
    if(!puzzle||puzzle.placed.has(i))return;
    puzzle.selected=i;
    $('puzzleTray').querySelectorAll('button').forEach(btn=>{
      const yes=Number(btn.dataset.index)===i;
      btn.classList.toggle('selected',yes);btn.setAttribute('aria-pressed',String(yes));
    });
    $('puzzleMessage').textContent='알맞은 빈칸을 골라 봐!';
  }
  function placePiece(slot){
    if(!puzzle||puzzle.selected===null||puzzle.placed.has(slot))return;
    if(puzzle.selected!==slot){$('puzzleMessage').textContent='다른 자리 같아. 그림을 다시 살펴봐!';return;}
    const target=$('puzzleBoard').children[slot];
    paintTile(target,slot,puzzle.size,puzzle.url);
    target.classList.add('filled');target.disabled=true;
    const piece=$('puzzleTray').querySelector('[data-index="'+slot+'"]');
    if(piece)piece.hidden=true;
    puzzle.placed.add(slot);puzzle.selected=null;
    $('puzzleCount').textContent=puzzle.placed.size+' / '+puzzle.total;
    if(puzzle.placed.size===puzzle.total){
      $('puzzleMessage').textContent=puzzle.name+' 퍼즐 완성!';
      $('puzzleTray').hidden=true;$('puzzleComplete').hidden=false;
      speak(puzzle.name+' 퍼즐 완성! 잘했어!');
    }else{$('puzzleMessage').textContent='맞았어! 다음 조각도 찾아봐.';}
  }
  document.querySelectorAll('[data-start]').forEach(button=>button.addEventListener('click',()=>startQuiz(button.dataset.start)));
  document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',showModes));
  document.querySelectorAll('[data-pieces]').forEach(button=>button.addEventListener('click',()=>{
    $('puzzleTray').hidden=false;startPuzzle(Number(button.dataset.pieces));
  }));
  $('openPuzzle').addEventListener('click',showPuzzleMenu);
  $('retryQuiz').addEventListener('click',()=>startQuiz(mode));
  $('retryPuzzle').addEventListener('click',()=>{if(puzzle)startPuzzle(puzzle.size);});
  $('togglePicture').addEventListener('click',()=>{
    const img=$('puzzleReference');if(!img.src)return;
    img.hidden=!img.hidden;
    $('togglePicture').textContent=img.hidden?'👀 완성 그림 보기':'🙈 완성 그림 숨기기';
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice();});
})();
