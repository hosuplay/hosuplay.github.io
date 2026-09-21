'use strict';
const MathEngine=(()=>{
 const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
 const range=d=>[10**(d-1),10**d-1];
 const key=p=>[p.mode,p.a,p.b,p.r>0?'r':'e'].join(':');
 const category=(a,b,q)=>String(q).includes('0')?'zero':Number(String(a)[0])<b?'front': [...String(a)].every(x=>Number(x)%b===0)?'direct':'carry';
 let divisionIndex=0;
 function generate(mode,opts={}){
  let a,b,r=0;
  if(mode==='subtract'){
   const shape=String(opts.subShape||'2,1').split(',').map(Number),borrow=opts.borrow||'mixed';
   const [alo,ahi]=range(shape[0]),[blo,bhi]=range(shape[1]);
   for(let i=0;i<300;i++){
    a=rand(alo,ahi);b=rand(blo,bhi);
    if(a<b)continue;
    const needsBorrow=a%10<b%10;
    if(borrow==='yes'&&!needsBorrow)continue;
    if(borrow==='no'&&needsBorrow)continue;
    return {mode,a,b,answer:a-b,r};
   }
   a=rand(alo,ahi);b=Math.min(rand(blo,bhi),a);return {mode,a,b,answer:a-b,r};
  }
  if(mode==='add'){const [lo,hi]=range(Number(opts.digits||2));a=rand(lo,hi);b=rand(lo,hi);return {mode,a,b,answer:a+b,r};}
  if(mode==='multiply'||mode==='table'){const ds=String(opts.shape||'1,1').split(',').map(Number);a=mode==='table'?Number(opts.table)||rand(2,9):rand(...range(ds[0]));b=mode==='table'?rand(1,9):rand(...range(ds[1]));return {mode,a,b,answer:a*b,r};}
  const [lo,hi]=range(Number(opts.digits||2));const wantR=opts.rem==='yes';const kinds=['direct','front','carry','zero'];const target=kinds[divisionIndex++%4];let candidates=[];
  for(b=2;b<=9;b++)for(let q=1;q<=Math.floor(hi/b);q++){for(let rem=wantR?1:0;rem<=(wantR?b-1:0);rem++){a=b*q+rem;if(a>=lo&&a<=hi)candidates.push({mode,a,b,answer:q,r:rem,category:category(a,b,q)});}}
  const pool=candidates.filter(p=>p.category===target);return (pool.length?pool:candidates)[rand(0,(pool.length?pool:candidates).length-1)];
 }
 function choices(p){const correct=p.answer;const set=new Set([correct]);const near=[p.a*(p.b-1),p.a*(p.b+1),(p.a-1)*p.b,(p.a+1)*p.b,correct-1,correct+1].filter(n=>n>0&&n!==correct);while(set.size<4){set.add(near.length?near.splice(rand(0,near.length-1),1)[0]:correct+rand(1,10));}return [...set].sort(()=>Math.random()-.5);}
 return {generate,choices,key,category};
})();
const $=id=>document.getElementById(id), STORAGE='math-practice-v1';
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
let data;try{data=JSON.parse(localStorage.getItem(STORAGE));}catch{};
if(!data||!Array.isArray(data.wrong))data={date:dateKey(),solved:0,correct:0,streak:0,best:0,wrong:[]};
let mode='add',problem=null,attempts=0,resolved=false,recent=[],timer=null,deadline=0,score=0,challengeStreak=0,active=false,review=false;
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(data));}catch{$('storageNotice').hidden=false;}}
function rollover(){if(data.date!==dateKey()){Object.assign(data,{date:dateKey(),solved:0,correct:0,streak:0});save();}}
function stats(){rollover();$('stats').innerHTML=[['오늘 푼 문제',data.solved],['오늘 맞힌 문제',data.correct],['정답률',`${data.solved?Math.round(data.correct/data.solved*100):0}%`],['연속 정답',data.streak],['60초 최고 기록',data.best]].map(([l,v])=>`<div>${l}<strong>${v}</strong></div>`).join('');$('wrongCount').textContent=`(${data.wrong.length})`;}
function select(id,label,items){return `<label>${label}<select id="${id}">${items.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;}
function opts(){return {digits:$('digits')?.value,shape:$('shape')?.value,subShape:$('subShape')?.value,borrow:$('borrow')?.value,rem:$('rem')?.value,display:$('display')?.value,table:$('table')?.value};}
function isChallenge(){return mode==='table'&&$('gameMode')?.value==='challenge'&&!review;}
function stop(){clearInterval(timer);timer=null;active=false;}
function openMode(m,isReview=false){stop();requestAnimationFrame(sizeScratch);mode=m;review=isReview;$('home').hidden=true;$('play').hidden=false;$('challengeInfo').textContent='';$('modeTitle').textContent=isReview?'틀린 문제 다시 풀기':{add:'덧셈',subtract:'뺄셈',multiply:'곱셈',divide:'나눗셈',table:'구구단 게임'}[m];let html='';
 if(!isReview){if(m==='add')html=select('digits','자릿수',[[2,'2자리 수'],[3,'3자리 수'],[4,'4자리 수']]);if(m==='subtract')html=select('subShape','계산 형태',[['2,1','두 자리 − 한 자리'],['2,2','두 자리 − 두 자리']])+select('borrow','받아내림',[['mixed','받아내림 섞어서'],['no','받아내림 없음'],['yes','받아내림 있음']]);if(m==='multiply')html=select('shape','계산 형태',[['1,1','한 자리 × 한 자리'],['2,1','두 자리 × 한 자리'],['3,1','세 자리 × 한 자리'],['2,2','두 자리 × 두 자리'],['3,2','세 자리 × 두 자리'],['3,3','세 자리 × 세 자리']]);if(m==='divide')html=select('digits','계산 형태',[[2,'두 자리 ÷ 한 자리'],[3,'세 자리 ÷ 한 자리']])+select('rem','나머지',[['no','나머지 없는 문제'],['yes','나머지 있는 문제']])+select('display','표시 방법',[['horizontal','가로식'],['vertical','세로식'],['mixed','섞어서']]);if(m==='table')html=select('table','구구단',[[0,'전체 랜덤'],...Array.from({length:8},(_,i)=>[i+2,`${i+2}단`])])+select('gameMode','모드',[['practice','시간 제한 없는 연습'],['challenge','60초 도전']]);}
 $('settings').innerHTML=html;$('settings').querySelectorAll('select').forEach(el=>el.addEventListener('change',()=>{stop();$('challengeInfo').textContent='';next();}));next();}
function next(){clearScratch();attempts=0;resolved=false;$('feedback').textContent='';$('feedback').className='';$('nextButton').hidden=true;$('answer').value='';$('remainder').value='';$('answer').disabled=false;$('remainder').disabled=false;$('checkButton').disabled=false;$('startButton').hidden=true;
 if(review&&!data.wrong.length){problem=null;$('question').textContent='모두 다시 맞혔어요!';$('answerForm').hidden=true;$('choices').hidden=true;return;}
 if(isChallenge()&&!active){problem=null;$('question').textContent='60초 동안 도전!';$('answerForm').hidden=true;$('choices').hidden=true;$('startButton').hidden=false;return;}
 if(review){problem={...data.wrong[0]};mode=problem.mode;}else{for(let i=0;i<100;i++){problem=MathEngine.generate(mode,opts());const history=mode==='table'&&Number(opts().table)?recent.slice(-6):recent;if(!history.includes(MathEngine.key(problem)))break;}recent.push(MathEngine.key(problem));if(recent.length>20)recent.shift();}
 renderProblem(problem,opts());if(!isChallenge())$('answer').focus();}
// 문제 표시와 채점을 분리해 향후 세로식 과정 입력을 추가할 수 있습니다.
function renderProblem(p,o){const vertical=p.mode==='divide'&&(o.display==='vertical'||o.display==='mixed'&&Math.random()<.5);const op={add:'+',subtract:'−',multiply:'×',divide:'÷',table:'×'}[p.mode];$('questionLabel').textContent=review?'다시 풀기':vertical?'세로식 · 몫을 입력하세요':'문제';$('question').innerHTML=vertical?`<div class="longdivision" aria-label="${p.a} 나누기 ${p.b}"><span class="quotient">?</span><span class="divisor">${p.b}</span><span class="dividend">${p.a}</span></div>`:`${p.a} ${op} ${p.b} = ?`;$('remainderLabel').hidden=!(p.mode==='divide'&&p.r>0);$('answerForm').hidden=isChallenge();$('choices').hidden=!isChallenge();if(isChallenge()){$('choices').innerHTML=MathEngine.choices(p).map(n=>`<button type="button">${n}</button>`).join('');$('choices').querySelectorAll('button').forEach(b=>b.onclick=()=>check(Number(b.textContent),0));}}
function explanation(p){if(p.mode==='subtract')return `${p.a} − ${p.b} = ${p.answer}. ${p.answer} + ${p.b} = ${p.a}로 확인할 수 있어요.`;if(p.mode==='divide')return `${p.b} × ${p.answer}${p.r?` + ${p.r}`:''} = ${p.a} · 몫 ${p.answer}${p.r?`, 나머지 ${p.r}`:''}`;if(p.mode==='add'){const place=10**(String(p.a).length-1);return `${Math.floor(p.a/place)*place} + ${Math.floor(p.b/place)*place} = ${(Math.floor(p.a/place)+Math.floor(p.b/place))*place}, ${p.a%place} + ${p.b%place} = ${p.a%place+p.b%place} → ${p.answer}`;}return `${p.a}를 ${p.b}배 하면 ${p.answer}이에요.`;}
function remember(){if(!data.wrong.some(p=>MathEngine.key(p)===MathEngine.key(problem)))data.wrong.push({...problem});}
function check(answer,rem){if(resolved||!problem||isChallenge()&&!active)return;if(isChallenge()&&Date.now()>=deadline){finish();return;}rollover();const correct=answer===problem.answer&&(problem.r===0||rem===problem.r);if(!correct){attempts++;data.streak=0;challengeStreak=0;remember();save();stats();if(attempts===1){$('feedback').className='bad';$('feedback').textContent='× 조금 달라요. 한 번 더 풀어 보세요.';if(!isChallenge()){$('answer').focus();$('answer').select();}return;}}
 resolved=true;data.solved++;if(correct){data.correct++;data.streak++;data.wrong=data.wrong.filter(p=>MathEngine.key(p)!==MathEngine.key(problem));if(isChallenge()){score++;challengeStreak++;}}
 save();stats();$('feedback').className=correct?'good':'bad';$('feedback').textContent=correct?'○ 정답이에요!':`× 정답은 ${problem.answer}${problem.r?`, 나머지 ${problem.r}`:''}이에요. ${explanation(problem)}`;$('answer').disabled=true;$('remainder').disabled=true;$('checkButton').disabled=true;$('choices').querySelectorAll('button').forEach(b=>b.disabled=true);$('nextButton').hidden=false;if(isChallenge())tick();}
function tick(){if(!active)return;const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('challengeInfo').textContent=`남은 시간 ${left}초 · 점수 ${score} · 연속 ${challengeStreak}`;if(!left)finish();}
function finish(){stop();data.best=Math.max(data.best,score);save();stats();problem=null;$('question').textContent='도전 완료!';$('feedback').className='good';$('feedback').textContent=`${score}점 · 최고 기록 ${data.best}점`;$('challengeInfo').textContent='남은 시간 0초';$('choices').hidden=true;$('nextButton').hidden=true;$('startButton').hidden=false;$('startButton').textContent='다시 도전';$('settings').querySelectorAll('select').forEach(s=>s.disabled=false);}
$('startButton').onclick=()=>{score=0;challengeStreak=0;active=true;deadline=Date.now()+60000;$('settings').querySelectorAll('select').forEach(s=>s.disabled=true);next();tick();timer=setInterval(tick,200);};
$('answerForm').onsubmit=e=>{e.preventDefault();const a=$('answer').value.trim(),r=$('remainder').value.trim();if(!/^\d+$/.test(a)||!$('remainderLabel').hidden&&!/^\d+$/.test(r)){$('feedback').className='bad';$('feedback').textContent='숫자로 답을 입력하세요.';return;}check(Number(a),Number(r||0));};
$('nextButton').onclick=next;document.addEventListener('keydown',e=>{if(e.key==='Enter'&&resolved&&!$('nextButton').hidden){e.preventDefault();next();}});
$('homeButton').onclick=()=>{if(active){finish();}stop();$('settings').querySelectorAll('select').forEach(s=>s.disabled=false);$('home').hidden=false;$('play').hidden=true;stats();};
$('home').querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>openMode(b.dataset.mode));$('reviewButton').onclick=()=>openMode('add',true);document.addEventListener('visibilitychange',()=>{if(active)tick();});stats();

$('enterButton').onclick=()=>{$('welcome').hidden=true;$('appContent').hidden=false;stats();$('home').querySelector('[data-mode]').focus();};

const scratchCanvas=$('scratchCanvas'),scratchCtx=scratchCanvas.getContext('2d');let scratchDrawing=false,scratchErase=false;
function sizeScratch(){const box=scratchCanvas.getBoundingClientRect();if(!box.width)return;const dpr=Math.min(devicePixelRatio||1,2),old=document.createElement('canvas');old.width=scratchCanvas.width;old.height=scratchCanvas.height;if(old.width)old.getContext('2d').drawImage(scratchCanvas,0,0);scratchCanvas.width=Math.round(box.width*dpr);scratchCanvas.height=Math.round(box.height*dpr);scratchCtx.setTransform(dpr,0,0,dpr,0,0);scratchCtx.lineCap='round';scratchCtx.lineJoin='round';if(old.width)scratchCtx.drawImage(old,0,0,old.width,old.height,0,0,box.width,box.height)}
function scratchPoint(e){const r=scratchCanvas.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
function startScratch(e){scratchDrawing=true;scratchCanvas.setPointerCapture(e.pointerId);const [x,y]=scratchPoint(e);scratchCtx.beginPath();scratchCtx.moveTo(x,y);e.preventDefault()}
function drawScratch(e){if(!scratchDrawing)return;const [x,y]=scratchPoint(e);scratchCtx.globalCompositeOperation=scratchErase?'destination-out':'source-over';scratchCtx.strokeStyle='#183f3a';scratchCtx.lineWidth=scratchErase?22:4;scratchCtx.lineTo(x,y);scratchCtx.stroke();scratchCtx.beginPath();scratchCtx.moveTo(x,y);e.preventDefault()}
function endScratch(){scratchDrawing=false;scratchCtx.beginPath()}
function clearScratch(){scratchCtx.save();scratchCtx.setTransform(1,0,0,1,0,0);scratchCtx.clearRect(0,0,scratchCanvas.width,scratchCanvas.height);scratchCtx.restore()}
function setScratchTool(erase){scratchErase=erase;$('penButton').classList.toggle('active',!erase);$('eraserButton').classList.toggle('active',erase);$('penButton').setAttribute('aria-pressed',String(!erase));$('eraserButton').setAttribute('aria-pressed',String(erase))}
scratchCanvas.addEventListener('pointerdown',startScratch);scratchCanvas.addEventListener('pointermove',drawScratch);scratchCanvas.addEventListener('pointerup',endScratch);scratchCanvas.addEventListener('pointercancel',endScratch);$('penButton').onclick=()=>setScratchTool(false);$('eraserButton').onclick=()=>setScratchTool(true);$('clearScratch').onclick=clearScratch;window.addEventListener('resize',sizeScratch);
