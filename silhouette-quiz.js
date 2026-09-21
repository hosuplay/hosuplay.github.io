/* Existing photos, locally extracted outlines; no new animal artwork. */
const silhouetteIds=['elephant','giraffe','zebra','tiger','rabbit','lion','penguin','flamingo','dolphin','hippo','rhino','camel','kangaroo','gorilla','hedgehog','deer','squirrel','ostrich','crocodile','duck'];
const silhouetteAnimals=photoAnimals.filter(q=>silhouetteIds.includes(q.id));
let silhouetteRound=[],silhouetteIndex=0,silhouetteScore=0,silhouetteReady=false,silhouetteAnswered=false,silhouetteToken=0;
const silhouetteEl=id=>document.getElementById('silhouette'+id);
const silhouettePreloads=[];
function startSilhouetteQuiz(){
 speechSynthesis.cancel();silhouetteRound=shufflePhotos(silhouetteAnimals);silhouetteIndex=0;silhouetteScore=0;
 showScreen('silhouetteScreen');loadSilhouetteQuestion();
}
function loadSilhouetteQuestion(){
 const token=++silhouetteToken,q=silhouetteRound[silhouetteIndex];
 silhouetteReady=false;silhouetteAnswered=false;
 silhouetteEl('Count').innerText=`${silhouetteIndex+1} / 20`;
 silhouetteEl('Score').innerText=String(silhouetteScore);
 silhouetteEl('Result').innerText='';silhouetteEl('Next').disabled=true;
 silhouetteEl('Next').innerText=silhouetteIndex===19?'결과 보기 🏆':'다음 동물 ➜';
 silhouetteEl('Stage').innerText='그림자만 보고 맞혀요!';
 silhouetteEl('Retry').hidden=true;silhouetteEl('Load').innerText='그림자를 불러오는 중이에요…';
 const box=silhouetteEl('Answers');box.innerHTML='';
 const names=shufflePhotos([q.answer,...shufflePhotos(q.distractors).slice(0,3)]);
 names.forEach(name=>{
  const row=document.createElement('div');row.className='answer';
  const button=document.createElement('button');button.className='answer-name';button.innerText=name;button.disabled=true;button.onclick=()=>answerSilhouette(name,row);
  const sound=document.createElement('button');sound.className='answer-sound';sound.innerText='🔊';sound.setAttribute('aria-label',`${name} 이름 듣기`);sound.onclick=()=>speak(name);
  row.appendChild(button);row.appendChild(sound);box.appendChild(row);
 });
 const img=silhouetteEl('Image');img.fetchPriority='high';img.decoding='async';img.hidden=true;img.alt='동물의 검은 실루엣';
 img.onload=()=>{
  if(token!==silhouetteToken)return;
  img.hidden=false;silhouetteReady=true;silhouetteEl('Load').innerText='';
  box.querySelectorAll('.answer-name').forEach(b=>b.disabled=false);
  const next=silhouetteRound[silhouetteIndex+1];
  if(next){const preload=new Image();preload.fetchPriority='low';preload.decoding='async';preload.src=`silhouettes/${next.id}.png`;silhouettePreloads.push(preload);if(silhouettePreloads.length>2)silhouettePreloads.shift();}
  const full=new Image();full.fetchPriority='low';full.decoding='async';full.src=q.variants[0].src;silhouettePreloads.push(full);if(silhouettePreloads.length>3)silhouettePreloads.shift();
 };
 img.onerror=()=>{if(token!==silhouetteToken)return;silhouetteEl('Load').innerText='그림자를 불러오지 못했어요. 다시 눌러 주세요.';silhouetteEl('Retry').hidden=false;};
 img.src=`silhouettes/${q.id}.png`;
}
function answerSilhouette(name,row){
 if(!silhouetteReady||silhouetteAnswered)return;
 silhouetteAnswered=true;const q=silhouetteRound[silhouetteIndex];
 silhouetteEl('Answers').querySelectorAll('.answer').forEach(r=>{const b=r.querySelector('.answer-name');b.disabled=true;if(b.innerText===q.answer)r.classList.add('correct');});
 const correct=name===q.answer;if(correct)silhouetteScore+=5;else row.classList.add('wrong');
 silhouetteEl('Result').innerText=correct?`🎉 정답! ${q.answer}! +5점`:`😊 정답은 ${q.answer}예요.`;
 silhouetteEl('Score').innerText=String(silhouetteScore);silhouetteEl('Next').disabled=false;
 silhouetteEl('Stage').innerText='사진으로 확인해요!';
 const img=silhouetteEl('Image'),token=silhouetteToken;
 // Keep the outline visible if the optional full-photo reveal cannot load.
 const reveal=new Image();reveal.onload=()=>{if(token!==silhouetteToken||!silhouetteAnswered)return;img.onload=null;img.onerror=null;img.src=reveal.src;img.alt=`${q.answer} 전체 사진`;};reveal.src=q.variants[0].src;
 speak(correct?`정답은 ${q.answer}, 5점`:`정답은 ${q.answer}예요.`);
}
function nextSilhouetteQuestion(){
 if(!silhouetteAnswered)return;speechSynthesis.cancel();
 if(silhouetteIndex<19){silhouetteIndex++;loadSilhouetteQuestion();window.scrollTo(0,0);return;}
 ++silhouetteToken;silhouetteReady=false;showScreen('silhouetteFinishScreen');
 silhouetteEl('FinalScore').innerText=`100점 만점에 ${silhouetteScore}점!`;
 silhouetteEl('FinishMessage').innerText=silhouetteScore===100?'우와! 그림자 탐정이 되었어요! 🌟':'동물의 멋진 그림자를 만났어요! 🐾';
 launchConfetti();playApplause();speak(`실루엣 퀴즈 끝! 100점 만점에 ${silhouetteScore}점이에요!`);
}
