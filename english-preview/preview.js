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
const phonicsCues={sh:'shh',ch:'ch',th:'th',ng:'ng',ee:'ee',oo:'oo',ai:'ay',oa:'oh',ck:'k',ph:'f',wh:'wh',qu:'kw'};
function sayPhonicsSound(letters,onDone){
 const cue=phonicsCues[letters]||letters;
 if(!('speechSynthesis' in window)){audioNotice('음성 재생을 지원하지 않는 브라우저야.');if(onDone)onDone();return}
 try{
  if(currentAudio){currentAudio.pause();currentAudio=null}
  speechSynthesis.cancel();speechSynthesis.resume();
  const u=new SpeechSynthesisUtterance(cue);u.lang='en-US';u.rate=.8;u.pitch=1;u.volume=1;
  const v=speechSynthesis.getVoices().find(v=>v.lang==='en-US')||speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(v)u.voice=v;
  let done=false;const finish=()=>{if(!done){done=true;if(onDone)onDone()}};
  u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);
 }catch(e){if(onDone)onDone()}
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
function animalArt(id){
 const head=(x,y,c)=>'<circle cx="'+x+'" cy="'+y+'" r="19" fill="'+c+'" stroke="#9c7958" stroke-width="2"/>';
 const eye=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="2.8" fill="#493a32"/>';
 const bodies={
 jump:'<path d="M45 76 Q25 54 50 42 Q68 28 80 55 L96 83 Q74 79 61 88 Z" fill="#d99c65" stroke="#9c7958" stroke-width="2"/><path d="M76 80 Q88 100 112 89" fill="none" stroke="#d99c65" stroke-width="12" stroke-linecap="round"/><path d="M45 78 L32 100 M68 79 L61 101" stroke="#9c7958" stroke-width="7" stroke-linecap="round"/><path d="M45 35 L36 6 Q43 0 50 27 M59 32 L63 3 Q74 2 67 34" fill="#d99c65" stroke="#9c7958" stroke-width="2"/>'+head(52,42,'#e5ab77')+eye(59,38)+'<ellipse cx="40" cy="49" rx="7" ry="5" fill="#ffe3bb"/>',
 run:'<ellipse cx="69" cy="70" rx="39" ry="25" fill="#f5d3a6" stroke="#9c7958" stroke-width="2"/><path d="M43 84 L36 105 M59 87 L56 105 M85 87 L88 105 M100 80 L105 104" stroke="#9c7958" stroke-width="7" stroke-linecap="round"/><path d="M102 58 Q123 44 119 66" fill="none" stroke="#b47a52" stroke-width="8" stroke-linecap="round"/>'+head(38,51,'#f5d3a6')+'<path d="M23 38 Q5 40 20 65" fill="#b47a52" stroke="#9c7958" stroke-width="2"/>'+eye(42,48)+'<circle cx="24" cy="56" r="4" fill="#654837"/>',
 swim:'<ellipse cx="67" cy="75" rx="41" ry="23" fill="#f3eadb" stroke="#8b755d" stroke-width="2"/><path d="M72 68 Q86 51 100 69 Q90 85 72 80" fill="#a8c9db" stroke="#8b755d" stroke-width="2"/><path d="M99 80 L119 68 L116 88" fill="#e6c2a0"/><path d="M40 63 L42 32" stroke="#8b755d" stroke-width="16" stroke-linecap="round"/>'+head(42,31,'#4b8c62')+'<path d="M23 35 L8 41 L25 46" fill="#efb94f" stroke="#a47737" stroke-width="2"/>'+eye(43,27)+'<path d="M51 92 L48 105 M70 93 L70 105" stroke="#e3a44b" stroke-width="5"/>',
 fly:'<ellipse cx="67" cy="70" rx="25" ry="34" fill="#e95442" stroke="#a47a59" stroke-width="2"/><path d="M61 64 Q80 60 86 80 L65 94" fill="#f8c24e" stroke="#a47a59" stroke-width="2"/><path d="M65 94 L50 112" stroke="#356c9d" stroke-width="12" stroke-linecap="round"/>'+head(65,40,'#f0d8b7')+'<path d="M46 42 L29 49 L47 54" fill="#4b4b4b"/>'+eye(70,37)+'<path d="M50 99 L40 109" stroke="#a47a59" stroke-width="4"/>',
 dance:'<path d="M61 80 Q16 19 9 76 Q18 108 61 95 Q103 18 121 75 Q118 108 67 97" fill="#70b999" stroke="#438b73" stroke-width="2"/><circle cx="26" cy="65" r="10" fill="#ebcf6b"/><circle cx="98" cy="65" r="10" fill="#ebcf6b"/><circle cx="62" cy="48" r="10" fill="#ebcf6b"/><ellipse cx="63" cy="84" rx="19" ry="27" fill="#3d83ae"/>'+head(63,54,'#3d83ae')+eye(69,52)+'<path d="M46 56 L36 60 L46 65" fill="#e2b652"/>',
 crawl:'<ellipse cx="30" cy="80" rx="18" ry="20" fill="#b8d979"/><ellipse cx="54" cy="75" rx="20" ry="22" fill="#a5d36d"/><ellipse cx="80" cy="78" rx="20" ry="22" fill="#b8d979"/>'+head(101,64,'#c8df7d')+eye(107,59)+'<path d="M95 43 L89 29 M107 43 L114 29" stroke="#749b56" stroke-width="4" stroke-linecap="round"/><path d="M35 99 L31 107 M62 97 L61 107 M85 97 L88 107" stroke="#749b56" stroke-width="5"/>'
 };
 return '<svg class="animal-drawing" viewBox="0 0 130 120" role="img" aria-label="동물 그림" xmlns="http://www.w3.org/2000/svg">'+(bodies[id]||'')+'</svg>';
}
function phonicsArt(word){
 const shape={
 rain:'<path d="M20 65 Q7 42 33 37 Q37 13 65 25 Q87 7 101 35 Q126 37 113 65Z" fill="#f7fbff" stroke="#92b8d2" stroke-width="4"/><path d="M33 77l-7 16 M59 77l-7 16 M85 77l-7 16 M108 77l-7 16" stroke="#5aafe4" stroke-width="6" stroke-linecap="round"/>',
 ship:'<path d="M15 70H117L98 97H38Z" fill="#e7a46d" stroke="#aa7653" stroke-width="3"/><path d="M65 70V15M65 20L103 60H65Z" fill="#fff2d3" stroke="#aa7653" stroke-width="3"/><path d="M15 106q12 -8 24 0t24 0t24 0t24 0" fill="none" stroke="#75b8db" stroke-width="5"/>',
 chip:'<path d="M34 45L20 100Q65 118 110 100L96 45Z" fill="#ed7763" stroke="#b95a4e" stroke-width="3"/><path d="M39 50L31 24 M55 49L53 17 M72 50L80 20 M87 51L101 27" stroke="#f1c86c" stroke-width="13" stroke-linecap="round"/>',
 thin:'<circle cx="65" cy="62" r="43" fill="#f4d8b7" stroke="#bc9577" stroke-width="3"/><circle cx="50" cy="55" r="4" fill="#58453d"/><circle cx="80" cy="55" r="4" fill="#58453d"/><path d="M50 81q15 12 30 0" stroke="#b66c71" stroke-width="4" fill="none"/>',
 sing:'<path d="M57 23v60a14 14 0 1 1 -9 -13V31l49 -11v54a14 14 0 1 1 -9 -13V10Z" fill="#89b5e4" stroke="#5c88b5" stroke-width="3"/>',
 see:'<path d="M12 62Q65 8 118 62Q65 116 12 62Z" fill="#fff" stroke="#a48b76" stroke-width="4"/><circle cx="65" cy="62" r="23" fill="#81b4a4"/><circle cx="65" cy="62" r="12" fill="#3b4b50"/><circle cx="71" cy="55" r="5" fill="white"/>',
 moon:'<path d="M81 12a48 48 0 1 0 34 75A48 48 0 0 1 81 12Z" fill="#f4d579" stroke="#bd9d54" stroke-width="3"/><circle cx="26" cy="25" r="4" fill="#f4d579"/>',
 boat:'<path d="M13 79h104l-22 27H36Z" fill="#e8a47b" stroke="#b47758" stroke-width="3"/><path d="M63 78V13L102 72H63Z" fill="#f5e6a4" stroke="#c7a65b" stroke-width="3"/><path d="M14 114q12 -7 24 0t24 0t24 0t24 0" stroke="#78badb" stroke-width="5" fill="none"/>',
 duck:'<ellipse cx="68" cy="77" rx="37" ry="24" fill="#f5e4c3" stroke="#b69b70" stroke-width="3"/><circle cx="48" cy="43" r="20" fill="#a2c58e" stroke="#759b72" stroke-width="3"/><path d="M30 43L10 50L31 57" fill="#edb15c"/><circle cx="51" cy="40" r="3" fill="#463d36"/><path d="M58 71q15 -16 29 2" stroke="#b69b70" stroke-width="4" fill="none"/>',
 phone:'<rect x="36" y="12" width="60" height="105" rx="12" fill="#92b8da" stroke="#6089aa" stroke-width="4"/><rect x="44" y="25" width="44" height="69" rx="4" fill="#e9f6ff"/><circle cx="66" cy="105" r="5" fill="#e9f6ff"/>',
 whale:'<path d="M18 74Q33 35 83 51Q109 57 111 80Q120 75 123 62Q129 88 107 95Q58 111 18 74Z" fill="#8bbbd5" stroke="#5f94b1" stroke-width="3"/><circle cx="45" cy="70" r="4" fill="#344c58"/><path d="M76 48q-7 -15 0 -25 M84 48q7 -15 0 -25" fill="none" stroke="#6db5dd" stroke-width="4"/>',
 queen:'<path d="M24 44L42 64L65 26L88 64L106 44L96 98H34Z" fill="#f4d078" stroke="#bb944c" stroke-width="3"/><circle cx="24" cy="42" r="6" fill="#ed9c9c"/><circle cx="65" cy="24" r="6" fill="#9ac9e9"/><circle cx="106" cy="42" r="6" fill="#bba5df"/>'
 };
 return '<svg class="phonics-drawing" viewBox="0 0 130 125" role="img" aria-label="'+word+' 그림" xmlns="http://www.w3.org/2000/svg">'+(shape[word]||'')+'</svg>';
}
function card(t,sub='',cls=''){return '<button class="answer '+cls+'" data-answer="'+t+'"><strong>'+t+'</strong><small>'+sub+'</small></button>'}
function render(){
const s=$('stage');let q=question;
if(mode==='alphabet'){instruction('글자를 듣고 같은 소문자를 찾아봐!');let other=shuffle(alphabet.filter(x=>x!==q)).slice(0,2);s.innerHTML='<div class="big-letter">'+q.toUpperCase()+'</div><button class="listen" data-say="'+q+'">🔊 글자 이름 듣기</button><div class="answers">'+shuffle([q,...other]).map(x=>card(x)).join('')+'</div>';}
if(mode==='phonics'){instruction('소리를 듣고 같은 소리가 나는 글자를 골라봐!');let other=shuffle(sounds.filter(x=>x[0]!==q[0])).slice(0,2);s.innerHTML='<div class="phonics-picture">'+phonicsArt(q[1])+'</div><button class="listen" data-say="'+q[1]+'">🔊 '+q[1]+' 듣기</button><div class="answers">'+shuffle([q,...other]).map(x=>card(x[0])).join('')+'</div>';}
if(mode==='blend'){instruction('글자를 하나씩 눌러봐. 그다음 소리를 이어 붙여!');s.innerHTML='<div class="big-emoji">'+q[1]+'</div><div class="phoneme-tiles">'+[...q[0]].map((x,i)=>'<button class="phoneme" data-phoneme="'+i+'"><b>'+x+'</b><small>🔊</small></button>').join('')+'</div><div class="blend-actions"><button data-join="pair" disabled>① 앞의 두 소리 붙이기</button><button data-join="whole" disabled>② '+q[0]+' 읽기</button></div><div class="word-result" hidden>🌟 '+q[0]+'!</div>';}
if(mode==='read'){instruction('그림을 보고 알맞은 단어를 골라봐!');let other=shuffle(words.filter(x=>x[0]!==q[0])).slice(0,2);s.innerHTML='<div class="big-emoji">'+q[1]+'</div><div class="answers">'+shuffle([q,...other]).map(x=>card(x[0])).join('')+'</div>';}
if(mode==='animals'){instruction('어떤 동물이 '+q.ko+'를 제일 잘할까? 🔊 문제 듣기를 눌러봐!');let other=shuffle(animals.filter(x=>x.id!==q.id && !((q.id==='run'||q.id==='jump')&&(x.id==='run'||x.id==='jump')) && !(q.id==='swim'&&x.id==='fly'))).slice(0,2);s.innerHTML='<div class="animal-question"><div class="action-word">'+q.ko+'</div><button class="listen" data-say="I can '+q.verb+'!">🔊 문제 듣기</button></div><div class="animal-choices">'+shuffle([q,...other]).map(x=>'<button class="animal-choice" data-answer="'+x.id+'"><span class="animal-full" role="img" aria-label="'+x.name+'">'+animalArt(x.id)+'</span><strong>'+x.name+'</strong></button>').join('')+'</div>';}
if(mode==='listen'){instruction('소리를 듣고 알맞은 그림을 골라봐!');let other=shuffle(words.filter(x=>x[0]!==q[0])).slice(0,2);s.innerHTML='<button class="listen" data-say="'+q[0]+'">🔊 듣기</button><div class="answers image-answers">'+shuffle([q,...other]).map(x=>card(x[0],x[1])).join('')+'</div>';timer=setTimeout(()=>{if(mode==='listen'&&!locked)speak(q[0],.55)},650);}
}
function key(){return mode==='animals'?question.id:Array.isArray(question)?question[0]:question}
function markWrong(){if(!missed){wrong.push(question);missed=true} $('feedback').textContent='괜찮아! 다시 해보자. 이 문제는 조금 뒤에 또 나와 💛';}
function correct(button){if(locked)return;locked=true;if(button)button.classList.add('correct');$('feedback').textContent='🌟 잘했어! 정답이야!';if(mode==='animals')speak('I can '+question.verb+'!',.62);if(mode==='phonics')sayPhonicsSound(question[0],()=>{if(mode==='phonics')speak(question[1],.78)});if(mode==='read'||mode==='listen')speak(key());if(mode==='alphabet')speak(key());if(mode==='blend')speak(key(),.48);state[mode].push(key());timer=setTimeout(()=>{index++;if(index>=5 && wrong.length===0){finish()}else next()},2600)}
function finish(){clear();completed.add(mode);$('track-fill').style.width='100%';$('round').textContent='완료!';$('instruction').textContent='다섯 문제를 다 풀었어!';$('stage').innerHTML='<div class="finish">🏆<strong>참 잘했어!</strong><span>다른 영어놀이도 해볼까?</span><button id="finish-home">놀이 고르기 🏡</button></div>';$('feedback').textContent=wrong.length?'틀렸던 문제는 다음에 또 연습해보자!':'모두 끝! 🌟';$('skip').hidden=true;updateProgress()}
function updateProgress(){$('progress').style.width=(completed.size/6*100)+'%';$('total').textContent=completed.size+' / 6'}
function home(){clear();mode='';$('home').hidden=false;$('lesson').hidden=true;$('skip').hidden=true;updateProgress()}
$('home').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)start(b.dataset.mode)});
$('stage').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='finish-home'){home();return}if(locked)return;if(b.dataset.say){speak(b.dataset.say);return}if(b.dataset.phoneme!==undefined){let n=+b.dataset.phoneme;if(n>blendStep){markWrong();return}phoneme(question[0][n]);b.classList.add('played');if(n===blendStep)blendStep++;if(blendStep>=2)document.querySelector('[data-join="pair"]').disabled=false;if(blendStep>=question[0].length)document.querySelector('[data-join="whole"]').disabled=false;$('feedback').textContent=blendStep===question[0].length?'이제 붙여서 읽어보자!':'좋아! 다음 글자도 눌러봐';return}if(b.dataset.join==='pair'){phoneme(question[0][0]);setTimeout(()=>{if(mode==='blend')phoneme(question[0][1])},650);$('feedback').textContent='앞의 두 소리를 이어서 말해봐!';return}if(b.dataset.join==='whole'){document.querySelector('.word-result').hidden=false;correct(b);return}if(b.dataset.answer){if(b.dataset.answer===key())correct(b);else{if(mode==='phonics')sayPhonicsSound(b.dataset.answer);b.classList.add('wrong');markWrong();if(mode==='animals'){const chosen=animals.find(x=>x.id===b.dataset.answer);if(chosen){speak('I can '+chosen.verb+'!',.6);$('feedback').textContent='🔊 '+chosen.name+'는 '+chosen.ko+'! 다른 동물도 눌러봐. 이 문제는 나중에 다시 나와 💛'}}setTimeout(()=>b.classList.remove('wrong'),700)}return}});
$('back').onclick=home;$('skip').onclick=()=>{if(!locked){markWrong();index++;if(index>=5 && wrong.length===0)finish();else next()}};$('repeat').onclick=()=>{if(!mode)return;if(mode==='alphabet')speak(key());else if(mode==='phonics')sayPhonicsSound(question[0]);else if(mode==='animals')speak('I can '+question.verb+'!',.55);else if(mode==='blend')phoneme(question[0][Math.min(blendStep,question[0].length-1)]);else speak(key())};$('sound').onclick=()=>{muted=!muted;$('sound').firstChild.textContent=muted?'🔇':'🔊'};$('reset').onclick=()=>{completed.clear();home()};updateProgress();
})();