let insectMode='hint',insectRound=[],insectIndex=0,insectScore=0,insectHints=0,insectAnswered=false;
const ie=id=>document.getElementById('insect'+id);
function openInsects(){speechSynthesis.cancel();showScreen('insectMenu');if(location.hash)history.replaceState(null,'','insects.html')}
function insectArt(el,q){el.style.backgroundImage=`url(insects/atlas.png)`;el.style.backgroundSize='400% 300%';el.style.backgroundPosition=`${q.col/3*100}% ${q.row/2*100}%`;el.setAttribute('aria-label',q.answer)}
function startInsectQuiz(mode){insectMode=mode;insectRound=shufflePhotos(insectAnimals);insectIndex=0;insectScore=0;showScreen('insectScreen');loadInsectQuestion()}
function loadInsectQuestion(){
 speechSynthesis.cancel();insectHints=0;insectAnswered=false;const q=insectRound[insectIndex];
 ie('Title').textContent={hint:'🌿 힌트로 맞히기',photo:'🔍 사진 일부 보고 맞히기',silhouette:'👤 실루엣 맞히기'}[insectMode];
 ie('Count').textContent=`${insectIndex+1} / ${insectRound.length}`;ie('Score').textContent=insectScore;
 ie('Clue').textContent=insectMode==='hint'?q.base:'어떤 곤충일까요?';ie('Clue').onclick=()=>speak(ie('Clue').textContent);
 ie('Hints').innerHTML='';ie('Hint').disabled=false;ie('Result').textContent='';ie('Next').disabled=true;
 ie('Next').textContent=insectIndex===insectRound.length-1?'결과 보기 🏆':'다음 곤충 ➜';
 const art=ie('Art');insectArt(art,q);art.setAttribute('aria-label',insectMode==='silhouette'?'곤충 그림자':'곤충 그림 조각');ie('Frame').hidden=insectMode==='hint';art.className='insect-art '+(insectMode==='silhouette'?'insect-shadow':'');art.style.clipPath='none';if(insectMode==='photo'){chooseInsectCrop(q);applyInsectCrop()}
 ie('Points').textContent='지금 맞히면 ⭐ 5점!';const box=ie('Answers');box.innerHTML='';
 shufflePhotos([q,...shufflePhotos(insectAnimals.filter(a=>a.id!==q.id)).slice(0,3)]).forEach(a=>{const row=document.createElement('div');row.className='answer';const b=document.createElement('button');b.className='answer-name';b.textContent=a.answer;b.onclick=()=>answerInsect(a.id,row);const voice=document.createElement('button');voice.className='answer-sound';voice.textContent='🔊';voice.setAttribute('aria-label',a.answer+' 이름 듣기');voice.onclick=()=>speak(a.answer);row.append(b,voice);box.append(row)})
}
function insectHint(){if(insectAnswered||insectHints===4)return;const q=insectRound[insectIndex],text=q.hints[insectHints++];const b=document.createElement('button');b.className='hint';b.textContent='🔊 '+text;b.onclick=()=>speak(text);ie('Hints').append(b);speak(text);ie('Hint').disabled=insectHints===4;ie('Points').textContent=`지금 맞히면 ⭐ ${5-insectHints}점!`;if(insectMode==='photo')applyInsectCrop()}
function answerInsect(id,row){if(insectAnswered)return;insectAnswered=true;const q=insectRound[insectIndex],correct=id===q.id,points=5-insectHints;if(correct)insectScore+=points;else row.classList.add('wrong');ie('Answers').querySelectorAll('.answer').forEach(r=>{const b=r.querySelector('.answer-name');b.disabled=true;if(b.textContent===q.answer)r.classList.add('correct')});ie('Score').textContent=insectScore;ie('Hint').disabled=true;ie('Next').disabled=false;ie('Frame').hidden=false;ie('Art').className='insect-art';ie('Art').style.clipPath='none';ie('Art').setAttribute('aria-label',q.answer);ie('Result').textContent=correct?`🎉 정답! ${q.answer}! +${points}점`:`정답은 ${q.answer}예요!`;speak(correct?`정답! ${q.answer}! ${points}점!`:`정답은 ${q.answer}예요!`)}
function nextInsect(){if(!insectAnswered)return;speechSynthesis.cancel();if(++insectIndex<insectRound.length){loadInsectQuestion();window.scrollTo(0,0);return}showScreen('insectFinish');ie('FinalScore').textContent=`${insectRound.length*5}점 만점에 ${insectScore}점!`;launchConfetti();playApplause();speak('곤충 퀴즈 완성! 정말 잘했어요!')}
function startInsectPuzzle(size){puzzleBag=shufflePhotos(insectAnimals.map(q=>({...q,src:'insects/atlas.png',atlas:q})));puzzleInsect=true;startPuzzle(3)}


// Small windows move among distinct body regions; consecutive repeats cycle.
const insectCropPoints={butterfly:[[.26,.35],[.74,.65],[.48,.5]],ladybug:[[.48,.3],[.3,.55],[.65,.6]],dragonfly:[[.5,.3],[.25,.42],[.5,.65]],bee:[[.3,.52],[.7,.62],[.6,.32]],mantis:[[.67,.3],[.45,.53],[.3,.73]],stag:[[.4,.25],[.5,.58],[.65,.74]],rhino:[[.27,.42],[.56,.57],[.73,.66]],ant:[[.3,.43],[.7,.54],[.48,.58]],cicada:[[.48,.3],[.35,.62],[.6,.7]],grasshopper:[[.3,.47],[.62,.6],[.68,.4]],cricket:[[.63,.4],[.3,.58],[.57,.72]],firefly:[[.48,.3],[.42,.57],[.55,.8]]};
let insectCropCenter=[.5,.5];const insectLastCrop={};
function chooseInsectCrop(q){const points=insectCropPoints[q.id];const n=insectLastCrop[q.id]===undefined?Math.floor(Math.random()*points.length):(insectLastCrop[q.id]+1)%points.length;insectLastCrop[q.id]=n;insectCropCenter=points[n]}
function applyInsectCrop(){const size=[.18,.26,.36,.52,1][insectHints];const x=Math.min(1-size,Math.max(0,insectCropCenter[0]-size/2)),y=Math.min(1-size,Math.max(0,insectCropCenter[1]-size/2));ie('Art').style.clipPath=`inset(${y*100}% ${(1-x-size)*100}% ${(1-y-size)*100}% ${x*100}%)`}

