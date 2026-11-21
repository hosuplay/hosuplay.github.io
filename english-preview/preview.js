(()=>{
const alphabet='abcdefghijklmnopqrstuvwxyz'.split('');
const words=[['cat','🐱'],['dog','🐶'],['sun','☀️'],['pen','🖊️'],['hat','🎩'],['pig','🐷'],['map','🗺️'],['bed','🛏️'],['cup','🥤'],['bus','🚌'],['fan','🪭'],['red','🔴']];
const sounds=[['sh','ship','🚢'],['ch','chip','🍟'],['th','thin','👄'],['ng','sing','🎵'],['ee','see','👀'],['oo','moon','🌙'],['ai','rain','🌧️'],['oa','boat','⛵'],['ck','duck','🦆'],['ph','phone','📞'],['wh','whale','🐳'],['qu','queen','👑']];
const animals=[{id:'jump',name:'캥거루',emoji:'🦘',verb:'jump',ko:'뛰기'},{id:'run',name:'강아지',emoji:'🐕',verb:'run',ko:'달리기'},{id:'swim',name:'오리',emoji:'🦆',verb:'swim',ko:'수영하기'},{id:'fly',name:'앵무새',emoji:'🦜',verb:'fly',ko:'날기'},{id:'dance',name:'공작',emoji:'🦚',verb:'dance',ko:'춤추기'},{id:'crawl',name:'애벌레',emoji:'🐛',verb:'crawl',ko:'기어가기'}];
const titles={animals:'동물 행동 놀이',alphabet:'알파벳 놀이',phonics:'파닉스 소리',blend:'소리 합치기',read:'단어 읽기',listen:'듣고 맞히기'};
const $=id=>document.getElementById(id),pick=a=>a[Math.floor(Math.random()*a.length)],shuffle=a=>[...a].sort(()=>Math.random()-.5);
let mode='',index=0,question=null,wrong=[],used=new Set(),last='',locked=false,muted=false,timer=null,blendStep=0,completed=new Set(),missed=false;
const state={alphabet:[],phonics:[],blend:[],read:[],listen:[],animals:[]};
let currentAudio=null;
function audioNotice(message){const el=$('feedback');if(el)el.textContent=message}
function speak(t,rate=.62){
 if(muted){muted=false;$('sound').firstChild.textContent='🔊'}
 if(!('speechSynthesis' in window)){audioNotice('이 브라우저에서는 음성을 지원하지 않아. Safari에서 열어줘.');return}
 try{
  if(currentAudio){currentAudio.pause();currentAudio=null}
  speechSynthesis.cancel();
  speechSynthesis.resume();
  const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=rate;u.pitch=1;u.volume=1;
  const voices=speechSynthesis.getVoices();const en=voices.find(v=>v.lang==='en-US')||voices.find(v=>v.lang.startsWith('en'));if(en)u.voice=en;
  u.onerror=()=>audioNotice('소리가 안 들리면 화면의 🔊 다시 듣기를 눌러줘.');
  speechSynthesis.speak(u);
 }catch(e){audioNotice('소리를 재생할 수 없어. Safari에서 다시 시도해줘.')}
}
function phoneme(l){
 if(muted){muted=false;$('sound').firstChild.textContent='🔊'}
 try{
  if(currentAudio){currentAudio.pause();currentAudio=null}
  const a=new Audio('../english/audio/sound-'+l+'.wav?v=3');currentAudio=a;
  a.onerror=()=>speak(l,.55);
  a.play().catch(()=>speak(l,.55));
 }catch(e){speak(l,.55)}
}
function clear(){clearTimeout(timer);if(currentAudio){currentAudio.pause();currentAudio=null}try{speechSynthesis.cancel()}catch(e){}}
function start(m){clear();mode=m;index=0;wrong=[];used=new Set();last='';locked=false;state[m]=[];$('home').hidden=true;$('lesson').hidden=false;$('lesson-title').textContent=titles[m];next()}
function candidate(){
 if(wrong.length && (index>=5 || (index>1 && index%3===2)))return wrong.shift();
 let pool=mode==='alphabet'?alphabet:mode==='phonics'?sounds:mode==='animals'?animals:words;
 let remaining=pool.filter(x=>{let k=mode==='animals'?x.id:Array.isArray(x)?x[0]:x;return k!==last&&!used.has(k)});
 if(!remaining.length){used.clear();remaining=pool.filter(x=>(mode==='animals'?x.id:Array.isArray(x)?x[0]:x)!==last)}
 const v=pick(remaining);used.add(mode==='animals'?v.id:Array.isArray(v)?v[0]:v);return v;
}
function next(){clear();locked=false;missed=false;blendStep=0;question=candidate();last=mode==='animals'?question.id:Array.isArray(question)?question[0]:question;$('round').textContent=(index<5?(index+1)+' / 5':'복습 문제');$('track-fill').style.width=Math.min(index/5*100,100)+'%';$('feedback').textContent='';$('skip').textContent='다음 문제 →';render()}
function instruction(t){$('instruction').textContent=t}
function card(t,sub='',cls=''){return '<button class="answer '+cls+'" data-answer="'+t+'"><strong>'+t+'</strong><small>'+sub+'</small></button>'}
function render(){
const s=$('stage');let q=question;
if(mode==='alphabet'){instruction('글자를 듣고 같은 소문자를 찾아봐!');let other=shuffle(alphabet.filter(x=>x!==q)).slice(0,2);s.innerHTML='<div class="big-letter">'+q.toUpperCase()+'</div><button class="listen" data-say="'+q+'">🔊 글자 이름 듣기</button><div class="answers">'+shuffle([q,...other]).map(x=>card(x)).join('')+'</div>';}
if(mode==='phonics'){instruction('소리를 듣고 같은 소리가 나는 글자를 골라봐!');let other=shuffle(sounds.filter(x=>x[0]!==q[0])).slice(0,2);s.innerHTML='<div class="big-emoji">'+q[2]+'</div><button class="listen" data-say="'+q[1]+'">🔊 '+q[1]+' 듣기</button><div class="answers">'+shuffle([q,...other]).map(x=>card(x[0])).join('')+'</div>';}
if(mode==='blend'){instruction('글자를 하나씩 눌러봐. 그다음 소리를 이어 붙여!');s.innerHTML='<div class="big-emoji">'+q[1]+'</div><div class="phoneme-tiles">'+[...q[0]].map((x,i)=>'<button class="phoneme" data-phoneme="'+i+'"><b>'+x+'</b><small>🔊</small></button>').join('')+'</div><div class="blend-actions"><button data-join="pair" disabled>① 앞의 두 소리 붙이기</button><button data-join="whole" disabled>② '+q[0]+' 읽기</button></div><div class="word-result" hidden>🌟 '+q[0]+'!</div>';}
if(mode==='read'){instruction('그림을 보고 알맞은 단어를 골라봐!');let other=shuffle(words.filter(x=>x[0]!==q[0])).slice(0,2);s.innerHTML='<div class="big-emoji">'+q[1]+'</div><div class="answers">'+shuffle([q,...other]).map(x=>card(x[0])).join('')+'</div>';}
if(mode==='animals'){instruction('어떤 동물이 '+q.ko+'를 제일 잘할까? 🔊 문제 듣기를 눌러봐!');let other=shuffle(animals.filter(x=>x.id!==q.id && !((q.id==='run'||q.id==='jump')&&(x.id==='run'||x.id==='jump')) && !(q.id==='swim'&&x.id==='fly'))).slice(0,2);s.innerHTML='<div class="animal-question"><div class="action-word">'+q.ko+'</div><button class="listen" data-say="I can '+q.verb+'!">🔊 문제 듣기</button></div><div class="animal-choices">'+shuffle([q,...other]).map(x=>'<button class="animal-choice" data-answer="'+x.id+'"><span class="animal-full" role="img" aria-label="'+x.name+'">'+x.emoji+'</span><strong>'+x.name+'</strong></button>').join('')+'</div>';}
if(mode==='listen'){instruction('소리를 듣고 알맞은 그림을 골라봐!');let other=shuffle(words.filter(x=>x[0]!==q[0])).slice(0,2);s.innerHTML='<button class="listen" data-say="'+q[0]+'">🔊 듣기</button><div class="answers image-answers">'+shuffle([q,...other]).map(x=>card(x[0],x[1])).join('')+'</div>';timer=setTimeout(()=>{if(mode==='listen'&&!locked)speak(q[0],.55)},650);}
}
function key(){return mode==='animals'?question.id:Array.isArray(question)?question[0]:question}
function markWrong(){if(!missed){wrong.push(question);missed=true} $('feedback').textContent='괜찮아! 다시 해보자. 이 문제는 조금 뒤에 또 나와 💛';}
function correct(button){if(locked)return;locked=true;if(button)button.classList.add('correct');$('feedback').textContent='🌟 잘했어! 정답이야!';if(mode==='animals')speak('I can '+question.verb+'!',.62);if(mode==='phonics'||mode==='read'||mode==='listen')speak(mode==='phonics'?question[1]:key());if(mode==='alphabet')speak(key());if(mode==='blend')speak(key(),.48);state[mode].push(key());timer=setTimeout(()=>{index++;if(index>=5 && wrong.length===0){finish()}else next()},3200)}
function finish(){clear();completed.add(mode);$('track-fill').style.width='100%';$('round').textContent='완료!';$('instruction').textContent='다섯 문제를 다 풀었어!';$('stage').innerHTML='<div class="finish">🏆<strong>참 잘했어!</strong><span>다른 영어놀이도 해볼까?</span><button id="finish-home">놀이 고르기 🏡</button></div>';$('feedback').textContent=wrong.length?'틀렸던 문제는 다음에 또 연습해보자!':'모두 끝! 🌟';$('skip').hidden=true;updateProgress()}
function updateProgress(){$('progress').style.width=(completed.size/6*100)+'%';$('total').textContent=completed.size+' / 6'}
function home(){clear();mode='';$('home').hidden=false;$('lesson').hidden=true;$('skip').hidden=true;updateProgress()}
$('home').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)start(b.dataset.mode)});
$('stage').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='finish-home'){home();return}if(locked)return;if(b.dataset.say){speak(b.dataset.say);return}if(b.dataset.phoneme!==undefined){let n=+b.dataset.phoneme;if(n>blendStep){markWrong();return}phoneme(question[0][n]);b.classList.add('played');if(n===blendStep)blendStep++;if(blendStep>=2)document.querySelector('[data-join="pair"]').disabled=false;if(blendStep>=question[0].length)document.querySelector('[data-join="whole"]').disabled=false;$('feedback').textContent=blendStep===question[0].length?'이제 붙여서 읽어보자!':'좋아! 다음 글자도 눌러봐';return}if(b.dataset.join==='pair'){phoneme(question[0][0]);setTimeout(()=>{if(mode==='blend')phoneme(question[0][1])},650);$('feedback').textContent='앞의 두 소리를 이어서 말해봐!';return}if(b.dataset.join==='whole'){document.querySelector('.word-result').hidden=false;correct(b);return}if(b.dataset.answer){if(b.dataset.answer===key())correct(b);else{b.classList.add('wrong');markWrong();setTimeout(()=>b.classList.remove('wrong'),500)}return}});
$('back').onclick=home;$('skip').onclick=()=>{if(!locked){markWrong();index++;if(index>=5 && wrong.length===0)finish();else next()}};$('repeat').onclick=()=>{if(!mode)return;if(mode==='alphabet')speak(key());else if(mode==='phonics')speak(question[1]);else if(mode==='animals')speak('I can '+question.verb+'!',.55);else if(mode==='blend')phoneme(question[0][Math.min(blendStep,question[0].length-1)]);else speak(key())};$('sound').onclick=()=>{muted=!muted;$('sound').firstChild.textContent=muted?'🔇':'🔊'};$('reset').onclick=()=>{completed.clear();home()};updateProgress();
})();