/* Actual animal recordings; attribution and licenses: sound-credits.html. */
const soundAnimals=[{id:'dog',answer:'강아지'},{id:'cat',answer:'고양이'},{id:'cow',answer:'소'},{id:'sheep',answer:'양',ext:'wav'},{id:'rooster',answer:'닭',photo:'chicken'},{id:'duck',answer:'오리'}];
let soundRound=[],soundIndex=0,soundScore=0,soundAnswered=false,soundHeard=false,soundAudio=null,soundGeneration=0;
const soundEl=id=>document.getElementById('sound'+id);
function stopAnimalSound(){soundGeneration++;if(soundAudio){soundAudio.pause();soundAudio.currentTime=0;}soundEl('Play').textContent='▶ 소리 듣기';}
function startSoundQuiz(){stopAnimalSound();speechSynthesis.cancel();soundRound=shufflePhotos(soundAnimals);soundIndex=0;soundScore=0;showScreen('soundScreen');loadSoundQuestion();}
function loadSoundQuestion(){
 stopAnimalSound();soundAudio=null;soundAnswered=false;soundHeard=false;
 const q=soundRound[soundIndex];
 soundEl('Count').textContent=`${soundIndex+1} / ${soundRound.length}`;soundEl('Score').textContent=soundScore;
 soundEl('Result').textContent='';soundEl('Status').textContent='듣기 버튼을 누르고 동물을 찾아요.';soundEl('Reveal').hidden=true;
 soundEl('Next').disabled=true;soundEl('Next').textContent=soundIndex===soundRound.length-1?'결과 보기 🏆':'다음 소리 ➜';
 const box=soundEl('Answers');box.innerHTML='';
 shufflePhotos([q,...shufflePhotos(soundAnimals.filter(a=>a.id!==q.id)).slice(0,3)]).forEach(a=>{
  const row=document.createElement('div');row.className='answer';const button=document.createElement('button');button.className='answer-name';button.textContent=a.answer;button.disabled=true;button.onclick=()=>answerSound(a.id,row);
  const voice=document.createElement('button');voice.className='answer-sound';voice.textContent='🔊';voice.setAttribute('aria-label',a.answer+' 이름 듣기');voice.onclick=()=>{stopAnimalSound();speak(a.answer)};
  row.append(button,voice);box.append(row);
 });
 soundAudio=new Audio(`sounds/${q.id}.${q.ext||'mp3'}`);soundAudio.preload='auto';
 const active=soundAudio;
 active.onended=()=>{if(active===soundAudio){soundEl('Play').textContent='↻ 다시 듣기';soundEl('Status').textContent='한 번 더 들어도 괜찮아요!'}};
 active.onerror=()=>{if(active===soundAudio&&soundEl('Screen').classList.contains('active')){soundEl('Status').textContent='소리를 불러오지 못했어요. 듣기 버튼으로 다시 시도해 주세요.';soundEl('Play').textContent='↻ 다시 시도';}};
}
async function playAnimalSound(){
 if(!soundAudio)return;stopAnimalSound();speechSynthesis.cancel();const generation=soundGeneration,a=soundAudio;
 soundEl('Status').textContent='소리를 불러오고 있어요…';
 try{if(a.error)a.load();await a.play();if(generation!==soundGeneration)return;soundHeard=true;soundEl('Play').textContent='↻ 처음부터 다시 듣기';soundEl('Status').textContent='귀를 기울여 들어 봐요!';if(!soundAnswered)soundEl('Answers').querySelectorAll('.answer-name').forEach(b=>b.disabled=false);}
 catch(e){if(generation===soundGeneration){soundEl('Status').textContent='재생되지 않았어요. 소리 듣기를 다시 눌러 주세요.';soundEl('Play').textContent='↻ 다시 시도';}}
}
function answerSound(id,row){
 if(soundAnswered||!soundHeard)return;soundAnswered=true;stopAnimalSound();const q=soundRound[soundIndex],correct=id===q.id;
 if(correct)soundScore+=5;else row.classList.add('wrong');
 soundEl('Answers').querySelectorAll('.answer').forEach(r=>{const b=r.querySelector('.answer-name');b.disabled=true;if(b.textContent===q.answer)r.classList.add('correct')});
 soundEl('Score').textContent=soundScore;soundEl('Result').textContent=correct?`🎉 정답! ${q.answer}! +5점`:`😊 정답은 ${q.answer}예요!`;
 const img=soundEl('Reveal');img.alt=q.answer;img.src=`photos/${q.photo||q.id}.webp`;img.hidden=false;img.onerror=()=>{img.hidden=true};
 soundEl('Next').disabled=false;speak(correct?`정답! ${q.answer}, 5점!`:`정답은 ${q.answer}입니다.`);
}
function nextSoundQuestion(){
 if(!soundAnswered)return;stopAnimalSound();speechSynthesis.cancel();
 if(++soundIndex<soundRound.length){loadSoundQuestion();window.scrollTo(0,0);return;}
 showScreen('soundFinishScreen');soundEl('FinalScore').textContent=`30점 만점에 ${soundScore}점!`;launchConfetti();playApplause();speak(`동물 소리 퀴즈 끝! 30점 만점에 ${soundScore}점이에요!`);
}
new MutationObserver(()=>{if(!soundEl('Screen').classList.contains('active'))stopAnimalSound()}).observe(soundEl('Screen'),{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAnimalSound()});
window.addEventListener('pagehide',stopAnimalSound);
