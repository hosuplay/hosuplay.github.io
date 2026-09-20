/* Eight learning illustrations; track sizes are not to scale. */
const footprintAnimals=[{"id": "duck", "answer": "오리", "hint": "물에서 헤엄칠 때 쓰는 물갈퀴가 있어요.", "detail": "발가락 사이가 이어진 물갈퀴 모양을 찾아봐요."}, {"id": "horse", "answer": "말", "hint": "단단한 발굽으로 달려요. 발굽이 두 갈래로 나뉘지 않아요.", "detail": "한 덩어리의 발굽이 둥근 흔적을 남겨요."}, {"id": "deer", "answer": "사슴", "hint": "발굽이 두 갈래로 나뉘어 있어요. 머리에는 멋진 뿔이 자라요.", "detail": "가운데 틈이 있는 두 갈래 발굽 모양이에요."}, {"id": "bear", "answer": "곰", "hint": "발가락 다섯 개와 발톱 흔적이 보여요. 몸집이 크고 털이 많아요.", "detail": "넓은 발바닥 위로 발가락 다섯 개가 보여요."}, {"id": "cat", "answer": "고양이", "hint": "발톱을 숨기고 살금살금 걸어요. 야옹 하고 울어요.", "detail": "발가락 네 개와 둥근 발바닥이 보여요. 발톱 자국은 보통 잘 남지 않아요."}, {"id": "elephant", "answer": "코끼리", "hint": "아주 무거운 몸을 둥근 발이 받쳐 줘요. 긴 코도 있어요.", "detail": "넓고 둥근 발바닥이 커다란 흔적을 남겨요."}, {"id": "rabbit", "answer": "토끼", "hint": "긴 귀가 있어요. 깡충 뛸 때 큰 뒷발 두 개가 앞쪽에 찍혀요.", "detail": "큰 뒷발 두 개와 작은 앞발 두 개의 배열을 봐요."}, {"id": "kangaroo", "answer": "캥거루", "hint": "긴 뒷발로 껑충 뛰어요. 배의 주머니에서 아기를 길러요.", "detail": "길쭉한 뒷발 두 개가 나란히 찍힌 모양이에요."}];
let footprintRound=[],footprintIndex=0,footprintScore=0,footprintReady=false,footprintAnswered=false,footprintToken=0;
const footprintEl=id=>document.getElementById('footprint'+id);
const footprintPreloads=[];
function startFootprintQuiz(){
 speechSynthesis.cancel();footprintRound=shufflePhotos(footprintAnimals);footprintIndex=0;footprintScore=0;
 showScreen('footprintScreen');loadFootprintQuestion();
}
function loadFootprintQuestion(){
 const token=++footprintToken,q=footprintRound[footprintIndex];
 footprintReady=false;footprintAnswered=false;
 footprintEl('Count').innerText=`${footprintIndex+1} / 8`;
 footprintEl('Score').innerText=String(footprintScore);
 footprintEl('HintText').innerText='';footprintEl('Hint').disabled=false;footprintEl('Animal').hidden=true;
 footprintEl('Result').innerText='';footprintEl('Next').disabled=true;
 footprintEl('Next').innerText=footprintIndex===7?'결과 보기 🏆':'다음 동물 ➜';
 footprintEl('Stage').innerText='발자국만 보고 맞혀요!';
 footprintEl('Retry').hidden=true;footprintEl('Load').innerText='발자국을 불러오는 중이에요…';
 const box=footprintEl('Answers');box.innerHTML='';
 const names=shufflePhotos([q.answer,...shufflePhotos(footprintAnimals.filter(a=>a.id!==q.id && !(["rabbit","kangaroo"].includes(q.id) && ["rabbit","kangaroo"].includes(a.id))).map(a=>a.answer)).slice(0,3)]);
 names.forEach(name=>{
  const row=document.createElement('div');row.className='answer';
  const button=document.createElement('button');button.className='answer-name';button.innerText=name;button.disabled=true;button.onclick=()=>answerFootprint(name,row);
  const sound=document.createElement('button');sound.className='answer-sound';sound.innerText='🔊';sound.setAttribute('aria-label',`${name} 이름 듣기`);sound.onclick=()=>speak(name);
  row.appendChild(button);row.appendChild(sound);box.appendChild(row);
 });
 const img=footprintEl('Image');img.hidden=true;img.alt='동물의 발자국';
 img.onload=()=>{
  if(token!==footprintToken)return;
  img.hidden=false;footprintReady=true;footprintEl('Load').innerText='';
  box.querySelectorAll('.answer-name').forEach(b=>b.disabled=false);
  const next=footprintRound[footprintIndex+1];
  if(next){const preload=new Image();preload.src=`footprints/${next.id}.png`;footprintPreloads.push(preload);if(footprintPreloads.length>2)footprintPreloads.shift();}
  const full=new Image();full.src=`photos/${q.id}.webp`;footprintPreloads.push(full);if(footprintPreloads.length>3)footprintPreloads.shift();
 };
 img.onerror=()=>{if(token!==footprintToken)return;footprintEl('Load').innerText='발자국을 불러오지 못했어요. 다시 눌러 주세요.';footprintEl('Retry').hidden=false;};
 img.src=`footprints/${q.id}.png`;
}
function answerFootprint(name,row){
 if(!footprintReady||footprintAnswered)return;
 footprintAnswered=true;footprintEl('Hint').disabled=true;const q=footprintRound[footprintIndex];
 footprintEl('Answers').querySelectorAll('.answer').forEach(r=>{const b=r.querySelector('.answer-name');b.disabled=true;if(b.innerText===q.answer)r.classList.add('correct');});
 const correct=name===q.answer;if(correct)footprintScore+=5;else row.classList.add('wrong');
 footprintEl('Result').innerText=correct?`🎉 정답! ${q.answer}! +5점`:`😊 정답은 ${q.answer}입니다.`;
 footprintEl('Score').innerText=String(footprintScore);footprintEl('Next').disabled=false;
 footprintEl('Stage').innerText=q.detail;
 const animal=footprintEl('Animal'),token=footprintToken;
 animal.hidden=true;animal.alt=q.answer;
 animal.onload=()=>{if(token===footprintToken && footprintAnswered)animal.hidden=false;};
 animal.onerror=()=>{animal.hidden=true;};animal.src=`photos/${q.id}.webp`;
 speak(correct?`정답은 ${q.answer}, 5점`:`정답은 ${q.answer}입니다.`);
}
function nextFootprintQuestion(){
 if(!footprintAnswered)return;speechSynthesis.cancel();
 if(footprintIndex<7){footprintIndex++;loadFootprintQuestion();window.scrollTo(0,0);return;}
 ++footprintToken;footprintReady=false;showScreen('footprintFinishScreen');
 footprintEl('FinalScore').innerText=`40점 만점에 ${footprintScore}점!`;
 footprintEl('FinishMessage').innerText=footprintScore===40?'우와! 발자국 탐정이 되었어요! 🌟':'동물의 멋진 발자국을 만났어요! 🐾';
 launchConfetti();playApplause();speak(`발자국 퀴즈 끝! 40점 만점에 ${footprintScore}점이에요!`);
}

function showFootprintHint(){
 if(!footprintReady||footprintAnswered)return;
 const hint=footprintRound[footprintIndex].hint;
 footprintEl('HintText').innerText=hint;speak(hint);
}
