'use strict';
(() => {
 const $=id=>document.getElementById(id), KEY='hosuplay-first-math-v1';
 let stars=0,canSave=true;
 try {const saved=JSON.parse(localStorage.getItem(KEY));if(Number.isSafeInteger(saved?.stars)&&saved.stars>=0)stars=saved.stars;}catch{canSave=false;}
 let mode='count',limit=10,n=1,a=0,b=0,solved=false,touched=new Set(),built=0,removed=0,merged=false;
 const rand=(lo,hi)=>Math.floor(Math.random()*(hi-lo+1))+lo;
 function showStars(){$('stars').textContent=`⭐ ${stars}`;if(!canSave)$('saveNote').textContent='이번 놀이에서는 별을 화면에만 모아요. 저장 없이도 놀 수 있어요.';}
 function reward(text){if(solved)return;solved=true;stars++;try{if(canSave)localStorage.setItem(KEY,JSON.stringify({stars}));}catch{canSave=false;}showStars();$('feedback').className='success';$('feedback').textContent=`${text} ⭐ 별 하나!`;$('next').hidden=false;}
 function button(text,fn,parent,cls=''){const el=document.createElement('button');el.type='button';el.textContent=text;el.className=cls;el.onclick=fn;parent.append(el);return el;}
 function tray(count,label,color,fn,start=0){const el=document.createElement('div');el.className=`tray ${color||''}`;const caption=document.createElement('span');caption.className='tray-label';caption.textContent=label;el.append(caption);for(let i=0;i<count;i++){const idx=i+start;const bead=button('',()=>fn(idx,bead),el,'bead');bead.setAttribute('aria-label',`${label}, ${i+1}번째 구슬`);} $('board').append(el);return el;}
 function message(text){$('feedback').className='';$('feedback').textContent=text;}
 function settings(){const label=document.createElement('label');label.textContent=mode==='count'?'세어 볼 숫자 ':mode==='group'?'묶음 놀이 ':'놀이 단계 ';const select=document.createElement('select');select.setAttribute('aria-label',label.textContent.trim());const items=mode==='count'?[[10,'1부터 10까지'],[20,'11부터 20까지']]:mode==='group'?[['skip2','2개씩 세기 · 20까지'],['skip5','5개씩 세기 · 50까지'],['skip10','10개씩 세기 · 100까지'],['skip100','100개씩 세기 · 1000까지'],[5,'구슬 5개 모으기'],[10,'구슬 10개 모으기'],[20,'10과 낱개로 만들기']]:[[5,'처음에는 5까지'],[9,'익숙해지면 9까지']];items.forEach(([v,t])=>{const o=new Option(t,v);o.selected=v===limit;select.add(o);});select.onchange=()=>{limit=select.value.startsWith('skip')?select.value:Number(select.value);n=limit===20?11:1;newRound();};label.append(select);$('settings').replaceChildren(label);}
 function renderCount(){ $('number').textContent=n;$('instruction').textContent='구슬을 하나씩 톡톡 눌러 세어 보세요.';let index=0;for(let size of n>10?[10,n-10]:[n]){tray(size,n>10?(index===0?'10개 묶음':`낱개 ${size}개`):'톡톡 세어 보기','',(i,el)=>{if(touched.has(i))return;touched.add(i);el.classList.add('touched');el.textContent=touched.size;el.setAttribute('aria-pressed','true');message(`${touched.size}개를 세었어요!`);if(touched.size===n)reward(`모두 ${n}개예요! 숫자 ${n}, 잘 세었어요.`);},index);index+=size;} }
 function renderGroup(){if(typeof limit==='string'){renderSkipCount();return;}const target=limit===20?n:limit;$('number').textContent=`${built} / ${target}`;$('instruction').textContent=limit===20?`${target}을 만들어 볼까요? 10개 묶음 1개와 낱개 ${target-10}개예요.`:`구슬 ${target}개를 담으면 한 묶음이 돼요.`;
 $('board').replaceChildren();if(built){if(built>=10)tray(10,'10개 한 묶음','',()=>{});const rest=built>=10?built-10:built;if(rest)tray(rest,built>=10?`낱개 ${rest}개`:'모으는 구슬','orange',()=>{});}
 $('actions').replaceChildren();const add=(amount)=>{if(solved)return;if(built+amount>target){message('목표보다 많아져요. 낱개를 하나씩 담아 볼까요?');return;}built+=amount;renderGroup();if(built===target)reward(limit===20?`10과 ${target-10}을 합치면 ${target}이에요!`:`${target}개가 모여 한 묶음이 되었어요!`);};if(limit===20)button('10개 묶음 담기',()=>add(10),$('actions')).disabled=built>=10;button('구슬 1개 담기',()=>add(1),$('actions')).disabled=solved;button('다시 담기',()=>{built=0;renderGroup();message('처음부터 다시 담아 보세요.');},$('actions')).disabled=solved;}

 // One tile is one complete bundle. Ten tiles make the next larger quantity.
 function renderSkipCount(){
  const unit=Number(limit.slice(4)),goal=unit*10;
  $('title').textContent='묶음으로 껑충껑충!';
  $('instruction').textContent=`반짝이는 묶음을 차례로 눌러요. 누를 때마다 ${unit}개씩 늘어나요.`;
  $('number').textContent='0';
  $('board').classList.add('skip-board');
  const concept=document.createElement('p');
  concept.className='bundle-concept';
  concept.textContent=unit===100?'작은 점은 구슬 1개예요. 10개씩 10줄이면 100개 한 묶음!':`작은 점은 구슬 1개예요. ${unit}개를 모으면 한 묶음!`;
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
    if(i!==built){message('반짝이는 묶음부터 차례로 눌러 볼까요?');return;}
    built++;
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
     reward(unit===10?'10개씩 10묶음, 모두 100! 백이라고 읽어요.':unit===100?'100개씩 10묶음, 모두 1000! 천이라고 읽어요.':`${unit}개씩 10묶음, 모두 ${goal}개를 세었어요!`);
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
   for(let dot=0;dot<unit;dot++)picture.append(document.createElement('i'));
   const total=document.createElement('strong');
   total.className='bundle-total';total.textContent='톡!';
   tile.append(label,picture,total);tiles.push(tile);
  }
  const restart=button('처음부터 세기',()=>{newRound();message(`${unit}개씩 다시 세어 볼까요?`);},$('actions'));
 }
 function renderArithmetic(){const sub=mode==='subtract';$('number').textContent=`${a} ${sub?'−':'＋'} ${b} = ?`;$('instruction').textContent=sub?`구슬 ${a}개에서 ${b}개를 톡톡 눌러 빼 보세요.`:'두 바구니의 구슬을 한곳에 모아 보세요.';
 if(sub){tray(a,'남아 있는 구슬','',(i,el)=>{if(solved||el.classList.contains('removed')||removed>=b)return;removed++;el.classList.add('removed');el.textContent='×';el.setAttribute('aria-label',`${i+1}번째 구슬, 뺐어요`);message(`${removed}개를 뺐어요.${removed===b?' 남은 구슬을 세고 답을 골라 보세요.':` ${b-removed}개 더 빼 보세요.`}`);});if(b===0)message('0개를 빼면 구슬은 그대로예요.');}
 else{tray(a,`파란 구슬 ${a}개`,'',()=>{});tray(b,`주황 구슬 ${b}개`,'orange',()=>{});button('구슬 합치기',()=>{if(merged)return;merged=true;$('board').replaceChildren();tray(a+b,'모두 모인 구슬','',(i,el)=>{if(touched.has(i))return;touched.add(i);el.classList.add('touched');el.textContent=touched.size;message(`${touched.size}개! 모두 세고 답을 골라 보세요.`);});message('한곳에 모였어요! 톡톡 세고 답을 골라 보세요.');},$('actions'));}
 for(let answer=0;answer<=limit;answer++)button(String(answer),()=>{if(solved)return;if(sub?removed!==b:!merged){message(sub?`먼저 구슬 ${b}개를 톡톡 빼 보세요.`:'먼저 구슬 합치기를 눌러 보세요.');return;}const result=sub?a-b:a+b;if(answer!==result){message(sub?`${b}개를 뺀 뒤 남아 있는 구슬을 다시 세어 보세요. 괜찮아요, 다시 골라요!`:'한곳에 모인 구슬을 다시 세어 보세요. 괜찮아요, 다시 골라요!');return;}reward(sub?`${a}개에서 ${b}개를 빼면 ${result}개가 남아요!`:`${a}개와 ${b}개를 합치면 ${result}개예요!`);$('answers').querySelectorAll('button').forEach(el=>el.disabled=true);},$('answers'));
 }
 function newRound(){solved=false;touched=new Set();built=0;removed=0;merged=false;['board','actions','answers'].forEach(id=>$(id).replaceChildren());$('board').classList.remove('skip-board');message('');$('next').hidden=true;$('title').textContent={count:'숫자와 친구해요',group:'작은 구슬, 큰 묶음',add:'모으면 더 많아져요',subtract:'빼면 얼마나 남을까요?'}[mode];if(mode==='count')renderCount();else if(mode==='group')renderGroup();else{a=rand(1,limit);b=mode==='add'?rand(0,limit-a):rand(0,a);renderArithmetic();}}
 document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>{mode=el.dataset.mode;limit=mode==='group'?'skip2':mode==='count'?10:5;n=1;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===el)));settings();newRound();});
 $('next').onclick=()=>{if(mode==='count')n=n>=(limit===20?20:10)?(limit===20?11:1):n+1;else if(mode==='group'&&limit===20)n=n>=20?11:n+1;newRound();};showStars();settings();newRound();
})();
