'use strict';
(() => {
 const $=id=>document.getElementById(id), KEY='hosuplay-first-math-v1';
 let stars=0,canSave=true;
 try {const saved=JSON.parse(localStorage.getItem(KEY));if(Number.isSafeInteger(saved?.stars)&&saved.stars>=0)stars=saved.stars;}catch{canSave=false;}
 let mode='count',limit=20,n=1,a=0,b=0,solved=false,touched=new Set(),built=0,removed=0,merged=false;

 let nextTimer=null, audio=null, sound=true, vibration=false, drag=null;
 const decks=new Map();
 try {const prefs=JSON.parse(localStorage.getItem(KEY+'-preferences'));sound=prefs?.sound!==false;vibration=prefs?.vibration===true;}catch{}
 const haptics=typeof navigator.vibrate==='function';
 function savePreferences(){try{localStorage.setItem(KEY+'-preferences',JSON.stringify({sound,vibration}));}catch{}}
 function pop(el){
  if(el){el.classList.remove('popped');void el.offsetWidth;el.classList.add('popped');}
  if(vibration&&haptics){try{navigator.vibrate(18);}catch{}}
  if(!sound)return;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   audio=audio||new Audio();
   const play=()=>{const t=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(480,t);osc.frequency.exponentialRampToValueAtTime(85,t+.085);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.22,t+.005);gain.gain.exponentialRampToValueAtTime(.0001,t+.105);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.11);};
   if(audio.state==='suspended')audio.resume().then(play).catch(()=>{});else play();
  }catch{}
 }
 function preferences(){
  $('sound').textContent=`소리 ${sound?'ON':'OFF'}`;$('sound').setAttribute('aria-pressed',String(sound));
  $('vibration').hidden=!haptics;$('vibration').textContent=`진동 ${vibration?'ON':'OFF'}`;$('vibration').setAttribute('aria-pressed',String(vibration));
  $('hapticNote').textContent=haptics?'진동은 원할 때만 켜요.':'이 기기는 진동 없이 소리와 움직임으로 놀아요.';
 }
 function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
 function deckKey(){return mode+':'+limit;}
 function takeProblem(){
  if(mode==='group'&&limit!==20){$('roundProgress').textContent='';return true;}
  const key=deckKey();
  if(!decks.has(key)){
   const list=[];
   if(mode==='count'){const lo=limit===11?11:1,hi=limit===10?10:20;for(let value=lo;value<=hi;value++)list.push([value]);}
   else if(mode==='group'){for(let value=11;value<=20;value++)list.push([value]);}
   else for(let first=1;first<=limit;first++)for(let second=0;second<=(mode==='add'?limit-first:first);second++)list.push([first,second]);
   decks.set(key,{list:shuffle(list),total:list.length});
  }
  const deck=decks.get(key);
  if(!deck.list.length&&!deck.current){
   $('number').textContent='참 잘했어요!';$('number').classList.add('session-done');$('instruction').textContent='이번 회차의 문제를 모두 풀었어요. 잠깐 쉬어도 좋아요.';$('roundProgress').textContent=`${deck.total}문제 완료`;
   button('새 회차 시작',()=>{decks.delete(key);newRound();},$('actions'),'primary');return false;
  }
  const problem=deck.current||(deck.current=deck.list.pop());if(mode==='count'||mode==='group')n=problem[0];else [a,b]=problem;
  $('roundProgress').textContent=`이번 회차 ${deck.total-deck.list.length} / ${deck.total} · 같은 문제 없이 놀아요`;
  return true;
 }

 function showStars(){$('stars').textContent=`⭐ ${stars}`;if(!canSave)$('saveNote').textContent='이번 놀이에서는 별을 화면에만 모아요. 저장 없이도 놀 수 있어요.';}
 function reward(text){if(solved)return;solved=true;if(decks.has(deckKey()))decks.get(deckKey()).current=null;stars++;try{if(canSave)localStorage.setItem(KEY,JSON.stringify({stars}));}catch{canSave=false;}showStars();$('feedback').className='success';$('feedback').textContent=`${text} ⭐ 별 하나!`;$('next').hidden=false;nextTimer=setTimeout(newRound,1500);}
 function button(text,fn,parent,cls=''){const el=document.createElement('button');el.type='button';el.textContent=text;el.className=cls;el.onclick=fn;parent.append(el);return el;}
 function tray(count,label,color,fn,start=0){const el=document.createElement('div');el.className=`tray ${color||''}`;const caption=document.createElement('span');caption.className='tray-label';caption.textContent=label;el.append(caption);for(let i=0;i<count;i++){const idx=i+start;const bead=button('',()=>{if(!solved)pop(bead);fn(idx,bead);},el,'bead');bead.setAttribute('aria-label',`${label}, ${i+1}번째 구슬`);bead.setAttribute('aria-pressed','false');} $('board').append(el);return el;}
 function message(text){$('feedback').className='';$('feedback').textContent=text;}
 function settings(){const label=document.createElement('label');label.textContent=mode==='count'?'세어 볼 숫자 ':mode==='group'?'묶음 놀이 ':'놀이 단계 ';const select=document.createElement('select');select.setAttribute('aria-label',label.textContent.trim());const items=mode==='count'?[[20,'1부터 20까지'],[10,'1부터 10까지'],[11,'11부터 20까지']]:mode==='group'?[['skip2','2개씩 세기 · 20까지'],['skip5','5개씩 세기 · 50까지'],['skip10','10개씩 세기 · 100까지'],['skip100','큰 수 · 100개씩 1,000까지'],['skip1000','큰 수 · 1,000개씩 10,000까지'],[5,'사과 5개 모으기'],[10,'사과 10개 모으기'],[20,'10과 낱개로 만들기']]:[[5,'처음에는 5까지'],[9,'익숙해지면 9까지'],[10,'10까지'],[20,'20까지']];items.forEach(([v,t])=>{const o=new Option(t,v);o.selected=v===limit;select.add(o);});select.onchange=()=>{limit=select.value.startsWith('skip')?select.value:Number(select.value);n=limit===20?11:1;newRound();};label.append(select);$('settings').replaceChildren(label);}
 function renderCount(){ $('number').textContent=n;$('instruction').textContent='구슬을 하나씩 톡톡 눌러 세어 보세요.';let index=0;for(let size of n>10?[10,n-10]:[n]){tray(size,n>10?(index===0?'10개 묶음':`낱개 ${size}개`):'톡톡 세어 보기','',(i,el)=>{if(solved||touched.has(i))return;touched.add(i);el.classList.add('touched');el.textContent=touched.size;el.setAttribute('aria-pressed','true');message(`${touched.size}개를 세었어요!`);if(touched.size===n)reward(`모두 ${n}개예요! 숫자 ${n}, 잘 세었어요.`);},index);index+=size;} }

 const appleSVG='<svg viewBox="0 0 80 86" aria-hidden="true"><path d="M41 22 Q35 12 43 6" fill="none" stroke="#846956" stroke-width="4" stroke-linecap="round"/><path d="M44 17 Q49 5 65 11 Q60 24 44 17Z" fill="#94ac84" stroke="#657b59" stroke-width="2"/><path d="M40 26 C17 10 4 31 10 53 C15 76 29 81 40 73 C53 82 68 71 72 50 C77 28 58 13 40 26Z" fill="#d9908b" stroke="#a86561" stroke-width="3"/><path d="M22 36 Q16 44 20 52" stroke="#f4d9cd" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
 function cancelDrag(){if(!drag)return;drag.el.style.transform='';drag.el.classList.remove('dragging');try{drag.el.releasePointerCapture(drag.id);}catch{}drag=null;document.querySelector('.apple-basket')?.classList.remove('over');}
 function renderGroup(){
  if(typeof limit==='string'){renderSkipCount();return;}
  const target=limit===20?n:limit;
  $('number').textContent=`${built} / ${target}`;
  $('instruction').textContent=`빨간 사과를 바구니에 하나씩 끌어 넣어요. ${target}개를 모아 볼까요?`;
  let suppressClick=false;const game=document.createElement('div');game.className='apple-game';
  const source=document.createElement('div');source.className='apple-source';
  const apple=button('',()=>{},source,'apple');apple.innerHTML=appleSVG;apple.setAttribute('aria-label','사과 하나. 바구니로 끌거나, 선택한 뒤 바구니를 눌러요.');
  const hint=document.createElement('p');hint.textContent='하나를 옮기면 새 사과가 나와요';source.append(hint);
  const basket=button('',()=>{if(solved){message('바구니가 가득 찼어요! 다음 놀이를 기다려요.');return;}if(apple.getAttribute('aria-pressed')==='true')addApple();else message('사과를 끌어 넣거나, 사과를 먼저 누르고 바구니를 눌러요.');},game,'apple-basket');basket.setAttribute('aria-label',`바구니, 목표 ${target}개`);
  const contents=document.createElement('span');contents.className='basket-contents';const caption=document.createElement('strong');basket.append(contents,caption);game.prepend(source);$('board').append(game);
  function draw(){contents.replaceChildren();
   for(let i=0;i<Math.floor(built/10);i++){const bundle=document.createElement('span');bundle.className='apple-bundle';bundle.textContent='10개 한 묶음';contents.append(bundle);}
   for(let i=0;i<built%10;i++){const fruit=document.createElement('span');fruit.className='small-apple';fruit.innerHTML=appleSVG;contents.append(fruit);}
   caption.textContent=`바구니 · ${built}개`;$('number').textContent=`${built} / ${target}`;
  }
  function addApple(){if(solved||built>=target){message('목표만큼 다 모았어요. 더 담지 않아도 괜찮아요!');return;}
   built++;pop(basket);apple.setAttribute('aria-pressed','false');draw();
   message(`${built}개 담았어요! ${target-built}개 더 모아 볼까요?`);
   if(built===target)reward(target>=10?`10개 묶음 ${Math.floor(target/10)}개${target%10?`와 낱개 ${target%10}개`:''}, 모두 ${target}개예요!`:`사과 ${target}개가 한 묶음이 되었어요!`);
  }
  apple.onclick=()=>{if(suppressClick){suppressClick=false;return;}if(solved)return;apple.setAttribute('aria-pressed','true');message('사과를 골랐어요. 이제 바구니를 눌러도 담을 수 있어요.');};
  apple.onpointerdown=e=>{if(solved||drag||!e.isPrimary||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,el:apple};apple.setPointerCapture(e.pointerId);apple.classList.add('dragging');};
  apple.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;apple.style.transform=`translate(${e.clientX-drag.x}px,${e.clientY-drag.y}px)`;const r=basket.getBoundingClientRect();basket.classList.toggle('over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);};
  apple.onpointerup=e=>{if(!drag||drag.id!==e.pointerId)return;const moved=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8;const r=basket.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;suppressClick=moved||inside;cancelDrag();if(inside)addApple();else if(moved)message('괜찮아요! 사과를 바구니 안에 놓아 볼까요?');};
  apple.onpointercancel=cancelDrag;apple.onlostpointercapture=()=>{if(drag)cancelDrag();};
  button('다시 담기',()=>{if(solved)return;built=0;draw();message('바구니를 비웠어요. 다시 담아 봐요.');},$('actions'));draw();
 }

 // One tile is one complete bundle. Ten tiles make the next larger quantity.
 function renderSkipCount(){
  const unit=Number(limit.slice(4)),goal=unit*10;
  $('title').textContent='묶음으로 껑충껑충!';
  $('instruction').textContent=`테두리가 있는 묶음부터 차례로 눌러요. 누를 때마다 ${unit}개씩 늘어나요.`;
  $('number').textContent='0';
  $('board').classList.add('skip-board');
  const concept=document.createElement('p');
  concept.className='bundle-concept';
  concept.textContent=unit===1000?'작은 네모 하나는 100개 묶음! 100개 묶음 10개가 1,000이고, 1,000이 10개면 10,000이에요.':unit===100?'작은 점은 구슬 1개예요. 10개씩 10줄이면 100개 한 묶음!':`작은 점은 구슬 1개예요. ${unit}개를 모으면 한 묶음!`;
  $('board').append(concept);
  const progress=document.createElement('p');
  progress.className='bundle-progress';
  progress.textContent=`${unit}개 묶음 0개 → 0`;
  $('board').append(progress);
  const grid=document.createElement('div');
  grid.className='bundle-grid';
  $('board').append(grid);
  const tiles=[];
  for(let i=0;i<10;i++){
   const tile=button('',()=>{
    if(solved||i<built)return;
    if(i!==built){message('테두리가 있는 묶음부터 차례로 눌러 볼까요?');return;}
    pop(tile);built++;
    const total=built*unit;
    $('number').textContent=total;
    progress.textContent=`${unit}개 묶음 ${built}개 → ${total}`;
    tile.classList.add('counted');
    tile.classList.remove('next-bundle');
    tile.setAttribute('aria-pressed','true');
    tile.setAttribute('aria-label',`${i+1}번째 ${unit}개 묶음, 모두 ${total}개, 세었어요`);
    tile.querySelector('.bundle-total').textContent=total;
    if(built<10)tiles[built].classList.add('next-bundle');
    message(`${total-unit}에 ${unit}을 더하면 ${total}! ${unit}개씩 ${built}묶음을 세었어요.`);
    if(built===10){
     reward(unit===1000?'1,000개씩 10묶음, 모두 10,000! 만이라고 읽어요.':unit===10?'10개씩 10묶음, 모두 100! 백이라고 읽어요.':unit===100?'100개씩 10묶음, 모두 1000! 천이라고 읽어요.':`${unit}개씩 10묶음, 모두 ${goal}개를 세었어요!`);
     restart.disabled=true;
    }
   },grid,'bundle-tile'+(i===0?' next-bundle':''));
   tile.setAttribute('aria-label',`${i+1}번째 ${unit}개 묶음, 눌러서 세기`);
   tile.setAttribute('aria-pressed','false');
   const label=document.createElement('span');
   label.className='bundle-unit';label.textContent=`${unit}개 한 묶음`;
   const picture=document.createElement('span');
   picture.className='bundle-picture dots-'+unit;
   picture.setAttribute('aria-hidden','true');
   for(let dot=0;dot<(unit===1000?10:unit);dot++)picture.append(document.createElement('i'));
   const total=document.createElement('strong');
   total.className='bundle-total';total.textContent='톡!';
   tile.append(label,picture,total);tiles.push(tile);
  }
  const restart=button('처음부터 세기',()=>{newRound();message(`${unit}개씩 다시 세어 볼까요?`);},$('actions'));
 }
 function renderArithmetic(){const sub=mode==='subtract';$('number').textContent=`${a} ${sub?'−':'＋'} ${b} = ?`;$('instruction').textContent=sub?`구슬 ${a}개에서 ${b}개를 톡톡 눌러 빼 보세요.`:'두 바구니의 구슬을 한곳에 모아 보세요.';
 if(sub){tray(a,'남아 있는 구슬','',(i,el)=>{if(solved||el.classList.contains('removed')||removed>=b)return;removed++;el.classList.add('removed');el.textContent='×';el.setAttribute('aria-label',`${i+1}번째 구슬, 뺐어요`);message(`${removed}개를 뺐어요.${removed===b?' 남은 구슬을 세고 답을 골라 보세요.':` ${b-removed}개 더 빼 보세요.`}`);});if(b===0)message('0개를 빼면 구슬은 그대로예요.');}
 else{tray(a,`파란 구슬 ${a}개`,'',()=>{});tray(b,`주황 구슬 ${b}개`,'orange',()=>{});button('구슬 합치기',()=>{if(merged)return;merged=true;$('board').replaceChildren();tray(a+b,'모두 모인 구슬','',(i,el)=>{if(solved||touched.has(i))return;touched.add(i);el.classList.add('touched');el.textContent=touched.size;message(`${touched.size}개! 모두 세고 답을 골라 보세요.`);});message('한곳에 모였어요! 톡톡 세고 답을 골라 보세요.');},$('actions'));}
 for(let answer=0;answer<=limit;answer++)button(String(answer),()=>{if(solved)return;if(sub?removed!==b:!merged){message(sub?`먼저 구슬 ${b}개를 톡톡 빼 보세요.`:'먼저 구슬 합치기를 눌러 보세요.');return;}const result=sub?a-b:a+b;if(answer!==result){message(sub?`${b}개를 뺀 뒤 남아 있는 구슬을 다시 세어 보세요. 괜찮아요, 다시 골라요!`:'한곳에 모인 구슬을 다시 세어 보세요. 괜찮아요, 다시 골라요!');return;}reward(sub?`${a}개에서 ${b}개를 빼면 ${result}개가 남아요!`:`${a}개와 ${b}개를 합치면 ${result}개예요!`);$('answers').querySelectorAll('button').forEach(el=>el.disabled=true);},$('answers'));
 }
 function newRound(){clearTimeout(nextTimer);nextTimer=null;cancelDrag();solved=false;touched=new Set();built=0;removed=0;merged=false;['board','actions','answers'].forEach(id=>$(id).replaceChildren());$('board').classList.remove('skip-board');$('number').classList.remove('session-done');message('');$('next').hidden=true;$('title').textContent={count:'숫자와 친구해요',group:'작은 구슬, 큰 묶음',add:'모으면 더 많아져요',subtract:'빼면 얼마나 남을까요?'}[mode];if(!takeProblem())return;if(mode==='count')renderCount();else if(mode==='group')renderGroup();else renderArithmetic();}
 document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>{mode=el.dataset.mode;limit=mode==='group'?5:mode==='count'?20:5;n=1;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===el)));settings();newRound();});
 $('next').onclick=newRound;
 $('sound').onclick=()=>{sound=!sound;savePreferences();preferences();if(sound)pop();};
 $('vibration').onclick=()=>{vibration=!vibration;savePreferences();preferences();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(nextTimer);nextTimer=null;cancelDrag();}});
 window.addEventListener('pagehide',()=>{clearTimeout(nextTimer);cancelDrag();});
 preferences();showStars();settings();newRound();
})();
