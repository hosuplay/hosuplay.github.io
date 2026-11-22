(()=>{
/* ------------------------------------------------------------------ data */
const alphabet='abcdefghijklmnopqrstuvwxyz'.split('');

/* 28 words: 3-letter basics up to 5-letter digraph words.
   Every entry needs english-preview/audio/<word>.wav (v22 build). */
const WORDS=[
 {w:'cat',ko:'고양이'},{w:'dog',ko:'강아지'},{w:'sun',ko:'해'},{w:'hat',ko:'모자'},
 {w:'pig',ko:'돼지'},{w:'bed',ko:'침대'},{w:'frog',ko:'개구리'},{w:'drum',ko:'북'},
 {w:'star',ko:'별'},{w:'tree',ko:'나무'},{w:'ship',ko:'배'},{w:'fish',ko:'물고기'},
 {w:'sheep',ko:'양'},{w:'chip',ko:'감자튀김'},{w:'chair',ko:'의자'},{w:'thumb',ko:'엄지손가락'},
 {w:'three',ko:'숫자 3'},{w:'ring',ko:'반지'},{w:'king',ko:'왕'},{w:'moon',ko:'달'},
 {w:'spoon',ko:'숟가락'},{w:'boot',ko:'부츠'},{w:'rain',ko:'비'},{w:'train',ko:'기차'},
 {w:'snail',ko:'달팽이'},{w:'boat',ko:'보트'},{w:'goat',ko:'염소'},{w:'duck',ko:'오리'}
];
const byWord=Object.fromEntries(WORDS.map(x=>[x.w,x]));

const sounds=[['sh','ship','배'],['ch','chip','감자튀김'],['th','thin','얇은 연필'],['ng','sing','노래'],
 ['ee','see','눈'],['oo','moon','달'],['ai','rain','비'],['oa','boat','보트'],
 ['ck','duck','오리'],['ph','phone','전화기'],['wh','whale','고래'],['qu','queen','왕비']];
const animals=[{id:'jump',name:'캥거루',ko:'뛰기'},{id:'run',name:'강아지',ko:'달리기'},
 {id:'swim',name:'오리',ko:'수영하기'},{id:'fly',name:'앵무새',ko:'날기'},
 {id:'dance',name:'공작',ko:'춤추기'},{id:'crawl',name:'애벌레',ko:'기어가기'}];
const titles={animals:'동물 행동 놀이',alphabet:'알파벳 놀이',phonics:'파닉스 소리',
 blend:'소리 합치기',read:'단어 읽기',listen:'듣고 맞히기'};
const $=id=>document.getElementById(id),pick=a=>a[Math.floor(Math.random()*a.length)],shuffle=a=>[...a].sort(()=>Math.random()-.5);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ------------------------------------------------------------------ audio
   Every sound is a static file under english-preview/audio/ (v22).
   No speechSynthesis anywhere.
     sound-<a..z,sh,ch,th,ng,ee,oo,ai,oa,ck,ph,wh,qu>   phoneme clips
     <word>                                            example words
     name-<a..z>                                       letter names
     animal-<verb>                                     "I can jump!" sentences
*/
const AUDIO='audio/',V='22b';
const ctxSupported=()=>!!(window.AudioContext||window.webkitAudioContext);
let ac=null,master=null,token=0,buffers=new Map(),active=[];

function unlockAudio(){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  try{
    if(!ac){
      ac=new AC({latencyHint:'interactive'});
      master=ac.createGain();
      master.gain.value=muted?0:1;
      master.connect(ac.destination);
      const b=ac.createBuffer(1,1,22050),s=ac.createBufferSource();
      s.buffer=b;s.connect(ac.destination);s.start();
    }
    if(ac.state!=='running')ac.resume().catch(()=>{});
    return ac;
  }catch(e){return null}
}
document.addEventListener('pointerdown',()=>unlockAudio(),{passive:true});
document.addEventListener('touchend',()=>unlockAudio(),{passive:true});

function audioNotice(msg){const el=$('feedback');if(el)el.textContent=msg}

function loadClip(key){
  if(buffers.has(key))return buffers.get(key);
  const p=(async()=>{
    unlockAudio();
    const r=await fetch(AUDIO+encodeURIComponent(key)+'.wav?v='+V,{cache:'force-cache'});
    if(!r.ok)throw new Error('missing '+key);
    const data=await r.arrayBuffer();
    const C=window.AudioContext||window.webkitAudioContext;
    const decoder=ac&&ac.state?ac:new C();
    return await decoder.decodeAudioData(data);
  })();
  buffers.set(key,p);
  p.catch(()=>buffers.delete(key));
  return p;
}
function preload(keys){keys.forEach(k=>{loadClip(k).catch(()=>{})})}
function cancelAudio(){
  token++;
  active.forEach(s=>{try{s.stop()}catch(e){}});
  active=[];
  clearTimeout(timer);
}
async function playClip(key,tok){
  let buf;
  try{buf=await loadClip(key)}
  catch(e){if(tok===token)audioNotice('이 소리의 음원 파일을 불러오지 못했어. 잠시 뒤 다시 해볼까?');return 'missing'}
  if(tok!==token)return 'cancelled';
  const c=unlockAudio();
  if(!c)return 'noaudio';
  if(c.state!=='running')await Promise.race([c.resume().catch(()=>{}),sleep(250)]);
  if(tok!==token)return 'cancelled';
  if(c.state!=='running')return 'blocked';
  return await new Promise(resolve=>{
    const s=c.createBufferSource();
    s.buffer=buf;s.connect(master);active.push(s);
    s.onended=()=>{active=active.filter(x=>x!==s);resolve(tok===token?'ok':'cancelled')};
    try{s.start()}catch(e){active=active.filter(x=>x!==s);resolve('blocked')}
  });
}
async function playSeq(keys,gap=130){
  cancelAudio();
  const tok=token;
  for(let i=0;i<keys.length;i++){
    const r=await playClip(keys[i],tok);
    if(r!=='ok'){if(r==='blocked')audioNotice('🔊 아래 듣기 버튼을 한 번 눌러줘!');return r}
    if(i<keys.length-1)await sleep(gap);
    if(tok!==token)return 'cancelled';
  }
  return 'ok';
}
/* three clear repetitions of one phoneme */
function phoneme3(code){return playSeq(['sound-'+code,'sound-'+code,'sound-'+code],120)}
const nameOf=l=>'name-'+l;
const wordClip=w=>w;

/* ------------------------------------------------------------------ art
   A sticker scene per word: soft gradient card, ground, sparkles and a drawn
   object. All inline SVG, no emoji, no bitmaps. */
const ART={
 cat:{bg:['#fff0d8','#ffd9a8'],d:'<ellipse cx="80" cy="126" rx="42" ry="7" fill="#0001"/><path d="M45 62 38 30 68 46Z" fill="#eda85f" stroke="#7a5232" stroke-width="3"/><path d="M115 62 122 30 92 46Z" fill="#eda85f" stroke="#7a5232" stroke-width="3"/><path d="M47 57 44 40 60 48Z" fill="#f8cdb4"/><path d="M113 57 116 40 100 48Z" fill="#f8cdb4"/><ellipse cx="80" cy="82" rx="40" ry="36" fill="#f7bd76" stroke="#7a5232" stroke-width="3"/><path d="M66 55h6M74 52h6M82 52h6M90 55h6" stroke="#d9924b" stroke-width="4" stroke-linecap="round"/><ellipse cx="66" cy="78" rx="7" ry="8" fill="#fff"/><ellipse cx="94" cy="78" rx="7" ry="8" fill="#fff"/><circle cx="66" cy="79" r="4" fill="#4b3527"/><circle cx="94" cy="79" r="4" fill="#4b3527"/><circle cx="67.5" cy="77" r="1.4" fill="#fff"/><circle cx="95.5" cy="77" r="1.4" fill="#fff"/><path d="M76 92 84 92 80 98Z" fill="#e2798a"/><path d="M80 98q-8 10-15 1M80 98q8 10 15 1" fill="none" stroke="#7a5232" stroke-width="2.4" stroke-linecap="round"/><path d="M40 86 20 82M40 94 18 96M120 86 140 82M120 94 142 96" stroke="#7a5232" stroke-width="2.2" stroke-linecap="round"/>'},
 dog:{bg:['#e8f6ff','#bfe3ff'],d:'<ellipse cx="80" cy="126" rx="40" ry="7" fill="#0001"/><ellipse cx="44" cy="76" rx="15" ry="30" fill="#a9744b" stroke="#6d472a" stroke-width="3"/><ellipse cx="116" cy="76" rx="15" ry="30" fill="#a9744b" stroke="#6d472a" stroke-width="3"/><ellipse cx="80" cy="78" rx="37" ry="34" fill="#e8c49b" stroke="#6d472a" stroke-width="3"/><ellipse cx="80" cy="94" rx="22" ry="18" fill="#f8e7cd" stroke="#c9a682" stroke-width="2"/><ellipse cx="80" cy="84" rx="9" ry="7" fill="#4a3226"/><circle cx="65" cy="70" r="6" fill="#fff"/><circle cx="95" cy="70" r="6" fill="#fff"/><circle cx="66" cy="71" r="3.4" fill="#3b2a20"/><circle cx="96" cy="71" r="3.4" fill="#3b2a20"/><path d="M80 92v6M72 102q8 8 16 0" fill="none" stroke="#8a6242" stroke-width="2.6" stroke-linecap="round"/><path d="M74 104q6 10 12 0" fill="#ef7f8c"/><path d="M52 60q8-8 16-2" stroke="#c9a682" stroke-width="3" fill="none"/>'},
 sun:{bg:['#fff8dd','#ffe6a3'],d:'<g stroke="#f6b93b" stroke-width="7" stroke-linecap="round"><path d="M80 14v14M80 118v14M20 72H6M154 72h-14M38 30l10 10M122 104l10 10M122 30l-10 10M38 104l-10 10"/></g><circle cx="80" cy="72" r="38" fill="#ffd75e" stroke="#e8a52f" stroke-width="3"/><circle cx="67" cy="66" r="5" fill="#8a5b1f"/><circle cx="93" cy="66" r="5" fill="#8a5b1f"/><path d="M66 82q14 14 28 0" fill="none" stroke="#c07a1f" stroke-width="4" stroke-linecap="round"/><circle cx="56" cy="80" r="6" fill="#ffb1a1" opacity=".8"/><circle cx="104" cy="80" r="6" fill="#ffb1a1" opacity=".8"/>'},
 hat:{bg:['#efe6ff','#d3c2ff'],d:'<ellipse cx="80" cy="126" rx="44" ry="8" fill="#0001"/><path d="M80 20 52 108h56Z" fill="#7fbcdf" stroke="#4d7d9c" stroke-width="3"/><path d="M71 50h18l4 16H67Z" fill="#ffe27a"/><path d="M63 82h34l4 16H59Z" fill="#f7a8b8"/><ellipse cx="80" cy="108" rx="30" ry="9" fill="#4d7d9c"/><circle cx="80" cy="18" r="10" fill="#ffe27a" stroke="#d9ab35" stroke-width="3"/>'},
 pig:{bg:['#ffeef7','#ffd3e6'],d:'<ellipse cx="80" cy="126" rx="40" ry="7" fill="#0001"/><path d="M46 56 38 30 64 44Z" fill="#f7b9c8" stroke="#b57a8c" stroke-width="3"/><path d="M114 56 122 30 96 44Z" fill="#f7b9c8" stroke="#b57a8c" stroke-width="3"/><ellipse cx="80" cy="80" rx="40" ry="35" fill="#f9c6d4" stroke="#b57a8c" stroke-width="3"/><ellipse cx="80" cy="94" rx="22" ry="15" fill="#f28aa8" stroke="#c4677f" stroke-width="2.5"/><ellipse cx="72" cy="94" rx="3.4" ry="5" fill="#a34f66"/><ellipse cx="88" cy="94" rx="3.4" ry="5" fill="#a34f66"/><circle cx="64" cy="70" r="5" fill="#5c3b45"/><circle cx="96" cy="70" r="5" fill="#5c3b45"/><circle cx="65.5" cy="68" r="1.6" fill="#fff"/><circle cx="97.5" cy="68" r="1.6" fill="#fff"/><path d="M52 62q6-6 12-2M108 62q-6-6-12-2" stroke="#b57a8c" stroke-width="2.6" fill="none"/>'},
 bed:{bg:['#eef4ff','#cfe0ff'],d:'<ellipse cx="80" cy="128" rx="52" ry="7" fill="#0001"/><rect x="24" y="62" width="112" height="44" rx="10" fill="#8ec4e6" stroke="#5687a8" stroke-width="3"/><rect x="30" y="44" width="32" height="24" rx="8" fill="#fdf6e6" stroke="#c9b48f" stroke-width="2.4"/><path d="M62 66h74v22H62Z" fill="#f3a5b4"/><path d="M62 66h74v8H62Z" fill="#fdf6e6"/><path d="M20 30v92M140 46v76M20 104h120" stroke="#b07a4a" stroke-width="9" stroke-linecap="round"/><circle cx="104" cy="84" r="4" fill="#fff6"/><circle cx="88" cy="90" r="3" fill="#fff6"/>'},
 frog:{bg:['#eafbe4','#bfe8b4'],d:'<ellipse cx="80" cy="128" rx="42" ry="7" fill="#0001"/><path d="M30 96q-10 16 6 22 14 4 16-8" fill="#6fc24d" stroke="#3f8029" stroke-width="3"/><path d="M130 96q10 16-6 22-14 4-16-8" fill="#6fc24d" stroke="#3f8029" stroke-width="3"/><ellipse cx="80" cy="86" rx="44" ry="34" fill="#7ccb57" stroke="#3f8029" stroke-width="3"/><circle cx="60" cy="56" r="15" fill="#7ccb57" stroke="#3f8029" stroke-width="3"/><circle cx="100" cy="56" r="15" fill="#7ccb57" stroke="#3f8029" stroke-width="3"/><circle cx="60" cy="56" r="9" fill="#fff"/><circle cx="100" cy="56" r="9" fill="#fff"/><circle cx="61" cy="57" r="4.6" fill="#2f4a21"/><circle cx="101" cy="57" r="4.6" fill="#2f4a21"/><path d="M56 92q24 20 48 0" fill="none" stroke="#2f5e1c" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="86" r="5" fill="#f7a2a2" opacity=".7"/><circle cx="114" cy="86" r="5" fill="#f7a2a2" opacity=".7"/>'},
 drum:{bg:['#fff0e8','#ffd6c4'],d:'<ellipse cx="80" cy="128" rx="40" ry="7" fill="#0001"/><path d="M38 52h84v46q0 16-42 16t-42-16Z" fill="#e2607a" stroke="#96354c" stroke-width="3"/><ellipse cx="80" cy="52" rx="42" ry="14" fill="#fff6e2" stroke="#96354c" stroke-width="3"/><path d="M38 52l84 0" stroke="#96354c" stroke-width="3"/><path d="M38 96q42 14 84 0" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M62 22 82 50M100 20 78 48" stroke="#c48a4c" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="20" r="6" fill="#f2c88c"/><circle cx="102" cy="18" r="6" fill="#f2c88c"/>'},
 star:{bg:['#0f2b52','#2b5c8f'],d:'<g fill="#ffe9a3"><circle cx="30" cy="30" r="2.4"/><circle cx="132" cy="38" r="2"/><circle cx="44" cy="52" r="1.6"/><circle cx="118" cy="26" r="2.2"/></g><path d="M80 26 93 62 131 64 101 87 111 124 80 102 49 124 59 87 29 64 67 62Z" fill="#ffd34d" stroke="#d79a1f" stroke-width="3"/><path d="M80 40 88 62 110 64 92 78 98 100 80 88Z" fill="#fff3bd" opacity=".75"/>'},
 tree:{bg:['#eafaf0','#c6ecd3'],d:'<ellipse cx="80" cy="130" rx="40" ry="7" fill="#0001"/><path d="M70 128V84h20v44Z" fill="#a4713f" stroke="#6f4a26" stroke-width="3"/><circle cx="56" cy="72" r="26" fill="#57b76a" stroke="#3b8449" stroke-width="3"/><circle cx="104" cy="72" r="26" fill="#4ba85f" stroke="#3b8449" stroke-width="3"/><circle cx="80" cy="50" r="28" fill="#63c475" stroke="#3b8449" stroke-width="3"/><circle cx="66" cy="52" r="5" fill="#e05f5f"/><circle cx="98" cy="62" r="5" fill="#e05f5f"/><circle cx="84" cy="80" r="4.4" fill="#e05f5f"/>'},
 ship:{bg:['#e3f4ff','#a9d8f5'],d:'<path d="M14 96h132l-18 26H32Z" fill="#d9664a" stroke="#8f3d2a" stroke-width="3"/><path d="M40 96h80v-8H40Z" fill="#fff3d6" stroke="#8f3d2a" stroke-width="2.4"/><path d="M78 86V20M78 26 118 76H78Z" fill="#fff" stroke="#8f3d2a" stroke-width="3"/><path d="M74 34 44 76h30Z" fill="#ffe9a8" stroke="#8f3d2a" stroke-width="3"/><path d="M8 128q14-9 28 0t28 0 28 0 28 0 28 0" fill="none" stroke="#4fa4d8" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="26" r="14" fill="#fff" opacity=".7"/><circle cx="46" cy="22" r="10" fill="#fff" opacity=".7"/>'},
 fish:{bg:['#e0f7ff','#a7dff5'],d:'<ellipse cx="76" cy="76" rx="44" ry="30" fill="#ff9f43" stroke="#c06a1c" stroke-width="3"/><path d="M118 76 146 52v48Z" fill="#ff8a2b" stroke="#c06a1c" stroke-width="3"/><path d="M60 48q14-16 30 0" fill="#ffbf6b" stroke="#c06a1c" stroke-width="2.6"/><path d="M62 104q16 16 32-2" fill="#ffbf6b" stroke="#c06a1c" stroke-width="2.6"/><circle cx="48" cy="68" r="7" fill="#fff"/><circle cx="49" cy="69" r="3.6" fill="#3a2a1e"/><path d="M74 86q10 10 20 0" fill="none" stroke="#c06a1c" stroke-width="2.6"/><circle cx="26" cy="46" r="5" fill="#fff" opacity=".8"/><circle cx="18" cy="62" r="3.6" fill="#fff" opacity=".7"/><circle cx="30" cy="96" r="4" fill="#fff" opacity=".7"/>'},
 sheep:{bg:['#f4f9ff','#d7e8fb'],d:'<ellipse cx="80" cy="128" rx="40" ry="7" fill="#0001"/><path d="M40 104v18M62 106v16M98 106v16M118 104v18" stroke="#7f6a55" stroke-width="6" stroke-linecap="round"/><g fill="#fff" stroke="#b8c6d6" stroke-width="3"><circle cx="56" cy="80" r="20"/><circle cx="80" cy="72" r="22"/><circle cx="104" cy="80" r="20"/><circle cx="68" cy="98" r="18"/><circle cx="94" cy="98" r="18"/></g><ellipse cx="80" cy="64" rx="22" ry="20" fill="#f6d7b8" stroke="#c69a74" stroke-width="3"/><circle cx="72" cy="62" r="3.6" fill="#4a3728"/><circle cx="88" cy="62" r="3.6" fill="#4a3728"/><path d="M80 70v4M74 76q6 5 12 0" fill="none" stroke="#a5764f" stroke-width="2.4" stroke-linecap="round"/><path d="M56 62q-8-8-14 0M104 62q8-8 14 0" fill="#f6d7b8" stroke="#c69a74" stroke-width="2.6"/>'},
 chip:{bg:['#fff6e2','#ffdca8'],d:'<ellipse cx="80" cy="128" rx="36" ry="7" fill="#0001"/><path d="M46 62h68l-8 58H54Z" fill="#e2607a" stroke="#96354c" stroke-width="3"/><path d="M50 74h60v8H50Z" fill="#fff" opacity=".7"/><g stroke="#c08b2c" stroke-width="3"><path d="M58 60V26h10v34Z" fill="#f7cf5f"/><path d="M74 58V18h10v40Z" fill="#ffe08a"/><path d="M90 60V30h10v30Z" fill="#f7cf5f"/><path d="M48 58V38h9v20Z" fill="#ffe08a"/><path d="M102 58V36h9v22Z" fill="#ffe08a"/></g><path d="M60 88h10M86 92h10" stroke="#fff" stroke-width="3" opacity=".8" stroke-linecap="round"/>'},
 chair:{bg:['#fdf1e4','#f2d5b4'],d:'<ellipse cx="80" cy="130" rx="42" ry="7" fill="#0001"/><path d="M42 54q0-10 10-10h56q10 0 10 10v34H42Z" fill="#d99a5b" stroke="#8d5c2c" stroke-width="3"/><rect x="48" y="70" width="64" height="10" rx="4" fill="#b97b3d"/><rect x="34" y="88" width="92" height="16" rx="7" fill="#e8ab68" stroke="#8d5c2c" stroke-width="3"/><path d="M44 104v24M116 104v24M60 104v18M100 104v18" stroke="#8d5c2c" stroke-width="7" stroke-linecap="round"/><circle cx="80" cy="52" r="8" fill="#fdf1e4" stroke="#b97b3d" stroke-width="2.4"/>'},
 thumb:{bg:['#fff2ea','#ffd9c9'],d:'<path d="M58 58q-2-22 12-22 13 0 13 20v10h24q16 0 14 16l-6 30q-4 12-18 12H68q-14 0-14-14Z" fill="#f9cfa8" stroke="#b57f52" stroke-width="3"/><path d="M58 58q-14-4-14 12t14 12" fill="#f9cfa8" stroke="#b57f52" stroke-width="3"/><path d="M72 72h34M70 88h38M72 104h32" stroke="#d9a274" stroke-width="3" stroke-linecap="round"/><path d="M96 40q8-14 18-8" stroke="#b57f52" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M120 30q6 4 8 12" stroke="#b57f52" stroke-width="3" fill="none" stroke-linecap="round"/>'},
 three:{bg:['#e7f0ff','#c3d9ff'],d:'<text x="80" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="104" font-weight="900" fill="#5b8fd6" stroke="#2f5fa3" stroke-width="3">3</text><circle cx="34" cy="34" r="6" fill="#ffd75e"/><circle cx="126" cy="42" r="5" fill="#ff9f9f"/><circle cx="118" cy="112" r="6" fill="#8fd6a8"/>'},
 ring:{bg:['#f3ecff','#d9c7ff'],d:'<ellipse cx="80" cy="106" rx="34" ry="30" fill="none" stroke="#f0b429" stroke-width="13"/><ellipse cx="80" cy="106" rx="34" ry="30" fill="none" stroke="#ffd970" stroke-width="5"/><path d="M80 30 98 52 80 74 62 52Z" fill="#8fd8f5" stroke="#3f8fb5" stroke-width="3"/><path d="M80 34 92 52 80 68 68 52Z" fill="#d6f2ff"/><path d="M64 30q16-8 32 0" stroke="#ffe9a8" stroke-width="4" fill="none" stroke-linecap="round"/>'},
 king:{bg:['#fff3e0','#ffd9a0'],d:'<path d="M32 96 24 40l30 22 26-34 26 34 30-22-8 56Z" fill="#ffcf4d" stroke="#c08b2c" stroke-width="3"/><rect x="28" y="94" width="104" height="16" rx="6" fill="#e8ac3a" stroke="#c08b2c" stroke-width="3"/><circle cx="80" cy="36" r="7" fill="#f36b7f"/><circle cx="40" cy="58" r="6" fill="#8fd8f5"/><circle cx="120" cy="58" r="6" fill="#8fd6a8"/><circle cx="62" cy="102" r="4" fill="#fff3c4"/><circle cx="80" cy="102" r="4" fill="#fff3c4"/><circle cx="98" cy="102" r="4" fill="#fff3c4"/>'},
 moon:{bg:['#132a4d','#2f4f7f'],d:'<g fill="#ffeaa7"><circle cx="34" cy="32" r="2.6"/><circle cx="128" cy="30" r="2.2"/><circle cx="118" cy="64" r="1.8"/><circle cx="40" cy="56" r="1.6"/></g><path d="M96 20a48 48 0 1 0 34 76A48 48 0 0 1 96 20Z" fill="#ffe07a" stroke="#d9ab35" stroke-width="3"/><circle cx="66" cy="52" r="7" fill="#f7cd5f"/><circle cx="58" cy="86" r="5" fill="#f7cd5f"/><circle cx="80" cy="104" r="4" fill="#f7cd5f"/>'},
 spoon:{bg:['#eef4fb','#cfdff0'],d:'<ellipse cx="80" cy="128" rx="34" ry="7" fill="#0001"/><path d="M80 62v58" stroke="#a9b8cc" stroke-width="9" stroke-linecap="round"/><ellipse cx="80" cy="42" rx="22" ry="28" fill="#dfe9f4" stroke="#8fa2b8" stroke-width="3"/><ellipse cx="74" cy="36" rx="10" ry="13" fill="#fff" opacity=".7"/><path d="M80 62v58" stroke="#e8eef6" stroke-width="3"/>'},
 boot:{bg:['#eefaf2','#c6ecd8'],d:'<ellipse cx="80" cy="130" rx="38" ry="7" fill="#0001"/><path d="M56 30h34v50l26 18v16H52V30Z" fill="#f2c744" stroke="#a8811f" stroke-width="3"/><path d="M52 114h64v12q0 6-8 6H58q-6 0-6-6Z" fill="#5e6b7a" stroke="#3c4652" stroke-width="3"/><path d="M56 44h34" stroke="#a8811f" stroke-width="4"/><path d="M84 30h12v16H84Z" fill="#ffe9a8" stroke="#a8811f" stroke-width="2.4"/><path d="M70 88l22 14" stroke="#d9a72c" stroke-width="3"/>'},
 rain:{bg:['#e4f0fb','#b8d4ea'],d:'<path d="M40 62q-4-26 22-28 8-22 34-14 20 6 18 24 22-2 24 20 2 22-24 22H52q-24 0-24-24 0-18 12-20Z" fill="#fff" stroke="#7fa6c4" stroke-width="3"/><g stroke="#4fa4d8" stroke-width="5" stroke-linecap="round"><path d="M56 100 46 126M80 100 70 126M104 100 94 126M126 96 116 120"/></g><ellipse cx="84" cy="130" rx="36" ry="6" fill="#8fc9e8" opacity=".55"/>'},
 train:{bg:['#fff0ee','#ffd3cf'],d:'<ellipse cx="80" cy="126" rx="58" ry="7" fill="#0001"/><path d="M18 118h124" stroke="#8a6a55" stroke-width="5"/><path d="M28 62h34v42H28Z" fill="#e2607a" stroke="#96354c" stroke-width="3"/><path d="M62 78h56v26H62Z" fill="#e2607a" stroke="#96354c" stroke-width="3"/><path d="M70 56h40v22H70Z" fill="#ffd7d1" stroke="#96354c" stroke-width="3"/><path d="M110 40h12v16h-12Z" fill="#6f7d8c" stroke="#4a5561" stroke-width="2.4"/><path d="M116 36q10-10 2-18 18 4 8 20" fill="#dfe8f0" stroke="#a7b6c4" stroke-width="2.4"/><circle cx="46" cy="106" r="12" fill="#5e6b7a" stroke="#3c4652" stroke-width="3"/><circle cx="94" cy="106" r="10" fill="#5e6b7a" stroke="#3c4652" stroke-width="3"/><circle cx="116" cy="106" r="10" fill="#5e6b7a" stroke="#3c4652" stroke-width="3"/><circle cx="46" cy="106" r="4" fill="#ffd75e"/><circle cx="94" cy="106" r="3.4" fill="#ffd75e"/><circle cx="116" cy="106" r="3.4" fill="#ffd75e"/>'},
 snail:{bg:['#eefbe6','#cbeab6'],d:'<ellipse cx="84" cy="122" rx="44" ry="7" fill="#0001"/><path d="M26 116q0-14 16-14h50q14 0 14-10 0-8-8-8" fill="none" stroke="#a7d47a" stroke-width="14" stroke-linecap="round"/><path d="M30 106q6-10 16-4" fill="none" stroke="#cbe79e" stroke-width="4"/><path d="M40 96q-8-14 4-20" stroke="#a7d47a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="44" cy="72" r="4" fill="#4a5f33"/><circle cx="34" cy="70" r="3.4" fill="#4a5f33"/><circle cx="92" cy="78" r="34" fill="#f0b06a" stroke="#9d6832" stroke-width="3"/><path d="M92 78a20 20 0 1 1 18 20 12 12 0 1 1 4-18 6 6 0 1 1-6 4" fill="none" stroke="#b47d42" stroke-width="4"/><circle cx="108" cy="52" r="4" fill="#fff" opacity=".5"/>'},
 boat:{bg:['#e3f4ff','#addcf5'],d:'<path d="M18 100h124l-16 24H34Z" fill="#c96a4a" stroke="#8a4028" stroke-width="3"/><path d="M80 96V18M80 24 122 92H80Z" fill="#fff" stroke="#8a4028" stroke-width="3"/><path d="M76 34 44 92h32Z" fill="#ffe9a8" stroke="#8a4028" stroke-width="3"/><path d="M8 130q14-9 28 0t28 0 28 0 28 0 28 0" fill="none" stroke="#4fa4d8" stroke-width="5" stroke-linecap="round"/><circle cx="126" cy="30" r="11" fill="#ffd75e"/>'},
 goat:{bg:['#f7f2e6','#e6d8bf'],d:'<ellipse cx="80" cy="128" rx="38" ry="7" fill="#0001"/><path d="M52 58q-8-26 10-30-6 18 4 26" fill="#e6d8bf" stroke="#8a7452" stroke-width="3"/><path d="M108 58q8-26-10-30 6 18-4 26" fill="#e6d8bf" stroke="#8a7452" stroke-width="3"/><path d="M42 74q-14 6-8 16 8 8 14-4" fill="#f4e6d0" stroke="#8a7452" stroke-width="2.6"/><path d="M118 74q14 6 8 16-8 8-14-4" fill="#f4e6d0" stroke="#8a7452" stroke-width="2.6"/><ellipse cx="80" cy="80" rx="34" ry="32" fill="#f7ead4" stroke="#8a7452" stroke-width="3"/><circle cx="68" cy="72" r="4.4" fill="#4a3a26"/><circle cx="92" cy="72" r="4.4" fill="#4a3a26"/><ellipse cx="80" cy="92" rx="9" ry="7" fill="#e3b7a4"/><path d="M80 99v10M72 112q8 8 16 0" fill="none" stroke="#8a7452" stroke-width="2.6" stroke-linecap="round"/><path d="M70 108q10 16 20 0" fill="#fff" opacity=".8"/>'},
 duck:{bg:['#eef9ff','#c7e8f7'],d:'<ellipse cx="84" cy="122" rx="42" ry="8" fill="#0001"/><ellipse cx="84" cy="94" rx="42" ry="26" fill="#ffd95e" stroke="#c99a1d" stroke-width="3"/><path d="M96 84q18 0 16 12-2 10-16 8" fill="#ffe9a8" stroke="#c99a1d" stroke-width="2.6"/><path d="M50 90q14-10 26 4" fill="none" stroke="#e8b532" stroke-width="3"/><circle cx="52" cy="52" r="24" fill="#ffd95e" stroke="#c99a1d" stroke-width="3"/><path d="M30 52q-14 4-14 10 0 6 14 8Z" fill="#f2a03d" stroke="#b5761f" stroke-width="2.6"/><circle cx="56" cy="46" r="4.6" fill="#3d3324"/><circle cx="57.6" cy="44" r="1.6" fill="#fff"/><path d="M30 110h30M96 112h26" stroke="#4fa4d8" stroke-width="4" stroke-linecap="round" opacity=".6"/>'},
 /* phonics-only example pictures */
 thin:{bg:['#fff7e6','#ffe2b8'],d:'<path d="M46 118 108 24l16 10-62 94Z" fill="#f7cf5f" stroke="#b08a2a" stroke-width="3"/><path d="M46 118 62 112l6 10Z" fill="#f2d7a0" stroke="#b08a2a" stroke-width="2.4"/><path d="M108 24l16 10 8-12-12-8Z" fill="#f0a8a8" stroke="#b06a6a" stroke-width="2.4"/><path d="M62 96 94 46" stroke="#fff" stroke-width="4" opacity=".6"/><path d="M12 130h136" stroke="#c9a36a" stroke-width="3" stroke-linecap="round" opacity=".5"/>'},
 see:{bg:['#eef7ff','#c9e6f7'],d:'<path d="M10 76Q80 12 150 76 80 140 10 76Z" fill="#fff" stroke="#6f97b5" stroke-width="3.4"/><circle cx="80" cy="76" r="30" fill="#7fc8d8" stroke="#3f94a8" stroke-width="3"/><circle cx="80" cy="76" r="15" fill="#2f4a58"/><circle cx="90" cy="66" r="5" fill="#fff"/><path d="M30 48 22 34M80 30V14M130 48l8-14" stroke="#6f97b5" stroke-width="3.4" stroke-linecap="round"/>'},
 phone:{bg:['#eef2ff','#cad7fa'],d:'<rect x="46" y="12" width="68" height="120" rx="16" fill="#5b7fa8" stroke="#2f4c6b" stroke-width="3.4"/><rect x="54" y="28" width="52" height="82" rx="6" fill="#eaf6ff" stroke="#3d6c95" stroke-width="2.4"/><path d="M66 94q14-30 28-10t-14 16" fill="none" stroke="#7fd1a8" stroke-width="4" stroke-linecap="round"/><circle cx="80" cy="120" r="6" fill="#cad7fa"/><path d="M72 18h16" stroke="#cad7fa" stroke-width="4" stroke-linecap="round"/>'},
 whale:{bg:['#e2f4ff','#a9d8ee'],d:'<path d="M16 84q6-34 46-32 34 2 48 22 8 12 14 6 8-8 14-16 4 26-10 34-16 10-32 12-46 6-80-26Z" fill="#7fa8c8" stroke="#456f8f" stroke-width="3"/><path d="M40 102q30 12 62 4" fill="none" stroke="#c9e6f2" stroke-width="6"/><circle cx="46" cy="76" r="4.6" fill="#2f4a5c"/><path d="M78 56q-8-14 2-22M90 58q8-14-2-22" fill="none" stroke="#8fd0ec" stroke-width="4" stroke-linecap="round"/><path d="M20 120q14-8 28 0t28 0 28 0" fill="none" stroke="#4fa4d8" stroke-width="4" stroke-linecap="round" opacity=".7"/>'},
 queen:{bg:['#fdeef8','#f0cbe6'],d:'<path d="M34 74 26 30l28 20 26-30 26 30 28-20-8 44Z" fill="#ffcf4d" stroke="#c08b2c" stroke-width="3"/><circle cx="80" cy="26" r="6" fill="#f36b7f"/><circle cx="36" cy="46" r="5" fill="#8fd8f5"/><circle cx="124" cy="46" r="5" fill="#8fd6a8"/><rect x="30" y="72" width="100" height="14" rx="6" fill="#e8ac3a" stroke="#c08b2c" stroke-width="3"/><circle cx="80" cy="104" r="26" fill="#f8d9c0" stroke="#b5865f" stroke-width="3"/><path d="M54 96q26-24 52 0" fill="#6b4a35"/><circle cx="70" cy="102" r="3.6" fill="#4a3226"/><circle cx="90" cy="102" r="3.6" fill="#4a3224"/><path d="M74 114q6 6 12 0" fill="none" stroke="#c07a6a" stroke-width="2.6" stroke-linecap="round"/><circle cx="52" cy="112" r="4" fill="#ffd75e"/><circle cx="108" cy="112" r="4" fill="#ffd75e"/>'}
};
function art(word,label){
 const a=ART[word];
 if(!a)return '';
 return '<svg class="word-drawing" viewBox="0 0 160 145" role="img" aria-label="'+(label||'')+'" xmlns="http://www.w3.org/2000/svg">'+
  '<defs><linearGradient id="bg-'+word+'" x1="0" y1="0" x2="0" y2="1">'+
  '<stop offset="0" stop-color="'+a.bg[0]+'"/><stop offset="1" stop-color="'+a.bg[1]+'"/></linearGradient></defs>'+
  '<rect x="2" y="2" width="156" height="141" rx="24" fill="url(#bg-'+word+')" stroke="#fff" stroke-width="3"/>'+
  '<circle cx="34" cy="26" r="24" fill="#fff" opacity=".28"/>'+
  '<circle cx="132" cy="118" r="20" fill="#fff" opacity=".18"/>'+
  '<circle cx="16" cy="108" r="3" fill="#fff" opacity=".8"/><circle cx="146" cy="34" r="2.6" fill="#fff" opacity=".85"/>'+
  '<circle cx="150" cy="96" r="3.4" fill="#fff" opacity=".7"/>'+
  a.d+'</svg>';
}
/* the six animal drawings stay as they are (original HosuPlay art) */
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

/* ------------------------------------------------------------------ deck
   One shuffled queue per pool, drawn without replacement. The word queue is
   shared by 소리 합치기·단어 읽기·듣고 맞히기, so a word never comes back in
   the same session until the whole pool has been used. */
const decks={};
let lastKey='';
function draw(poolName,list,keyFn){
 let d=decks[poolName];
 if(!d||!d.length){
  d=shuffle(list.filter(x=>keyFn(x)!==lastKey));
  if(!d.length)d=shuffle(list.slice());
  decks[poolName]=d;
 }
 const v=d.pop();
 lastKey=keyFn(v);
 return v;
}
const wkey=x=>x.w, akey=x=>x, skey=x=>x[0], ankey=x=>x.id;

/* ------------------------------------------------------------------ game */
let mode='',qi=0,question=null,wrong=[],locked=false,muted=false,timer=null,
    blendStep=0,completed=new Set(),missed=false,plan=[];

function clear(){cancelAudio()}
function start(m){
 transition();clear();mode=m;qi=0;wrong=[];locked=false;plan=roundPlan(m);
 $('home').hidden=true;$('lesson').hidden=false;$('lesson-title').textContent=titles[m];
 startup(m);next();
}
function transition(){$('feedback').textContent='';$('skip').hidden=true}
function startup(m){
 unlockAudio();
 if(m==='alphabet')preload(alphabet.map(l=>nameOf(l)).concat(alphabet.map(l=>'sound-'+l)));
 else if(m==='phonics')preload(sounds.map(s=>'sound-'+s[0]).concat(sounds.map(s=>s[1])));
 else if(m==='blend')preload(WORDS.map(w=>w.w).concat(alphabet.map(l=>'sound-'+l)));
 else if(m==='read'||m==='listen')preload(WORDS.map(w=>w.w));
 else if(m==='animals')preload(animals.map(a=>'animal-'+a.id));
}

/* five slots, each with a different question shape, in a fresh order */
function roundPlan(m){
 if(m==='alphabet')return shuffle(['name','match','sound','name','sound']);
 if(m==='phonics')return shuffle(['sound','picture','sound','picture','sound']);
 if(m==='read')return shuffle(['read3','read4','rhyme','read3','read4']);
 if(m==='listen')return shuffle(['pic3','pic4','pic3','pic4','pic3']);
 return ['blend','blend','blend','blend','blend'];
}

function candidate(){
 if(wrong.length&&(qi>1&&(qi%3===2||qi>=5)))return wrong.shift();
 if(mode==='alphabet')return draw('alphabet',alphabet,akey);
 if(mode==='phonics')return draw('phonics',sounds,skey);
 if(mode==='animals')return draw('animals',animals,ankey);
 return draw('words',WORDS,wkey);
}
function key(){return mode==='animals'?question.id:Array.isArray(question)?question[0]:question.w||question}
function fmt(){return plan[Math.min(qi,plan.length-1)]}

function next(){
 clear();locked=false;missed=false;blendStep=0;
 question=candidate();
 $('round').textContent=(qi<5?(qi+1)+' / 5':'복습 문제');
 $('track-fill').style.width=Math.min(qi/5*100,100)+'%';
 $('feedback').textContent='';$('skip').textContent='다음 문제 →';
 render();
}
function instruction(t){$('instruction').textContent=t}

function choiceSet(list,answer,keyFn,n){
 const others=shuffle(list.filter(x=>keyFn(x)!==keyFn(answer))).slice(0,n-1);
 return shuffle([answer,...others]);
}
function rhymeChoices(answer,n){
 const same=shuffle(WORDS.filter(x=>x.w!==answer.w&&x.w.slice(-2)===answer.w.slice(-2)));
 const rest=shuffle(WORDS.filter(x=>x.w!==answer.w&&x.w.slice(-2)!==answer.w.slice(-2)));
 const out=[answer,...same.slice(0,n-2),...rest].slice(0,n);
 if(out.length<n)out.push(...rest.slice(0,n-out.length));
 return shuffle(out);
}
function countBadge(word){return word.length>=5?'<span class="badge">긴 단어</span>':''}

function render(){
 const s=$('stage');let q=question;const f=fmt();
 if(mode==='alphabet'){
  const letter=q;
  const others=shuffle(alphabet.filter(x=>x!==letter)).slice(0,2);
  if(f==='match'){
   instruction('대문자와 짝이 되는 소문자를 찾아봐!');
   s.innerHTML='<div class="big-letter">'+letter.toUpperCase()+'</div>'+
    '<div class="answers">'+shuffle([letter,...others]).map(x=>textCard(x)).join('')+'</div>';
  }else if(f==='sound'){
   instruction('글자의 소리를 듣고 같은 글자를 찾아봐!');
   s.innerHTML='<div class="big-letter mystery">?</div>'+
    '<button class="listen" data-phoneme-q="'+letter+'">🔊 글자 소리 듣기</button>'+
    '<div class="answers">'+shuffle([letter,...others]).map(x=>textCard(x)).join('')+'</div>';
  }else{
   instruction('글자 이름을 듣고 같은 글자를 찾아봐!');
   s.innerHTML='<div class="big-letter mystery">?</div>'+
    '<button class="listen" data-say="'+letter+'">🔊 글자 이름 듣기</button>'+
    '<div class="answers">'+shuffle([letter,...others]).map(x=>textCard(x)).join('')+'</div>';
  }
 }
 if(mode==='phonics'){
  const code=q[0],word=q[1],ko=q[2];
  if(f==='picture'){
   instruction('이 소리가 들어 있는 그림을 찾아봐!');
   const others=shuffle(sounds.filter(x=>x[0]!==code)).slice(0,2);
   s.innerHTML='<div class="phonics-prompt"><b>'+code+'</b></div>'+
    '<button class="listen" data-sound-preview="'+code+'" data-word="'+word+'">🔊 소리와 단어 듣기</button>'+
    '<div class="answers image-answers">'+shuffle([q,...others]).map(x=>pictureCard(x[1],x[2],x[0],true)).join('')+'</div>';
  }else{
   instruction('소리를 듣고 같은 소리가 나는 글자를 골라봐!');
   const others=shuffle(sounds.filter(x=>x[0]!==code)).slice(0,2);
   s.innerHTML='<div class="word-hero">'+art(word,ko)+'</div>'+
    '<button class="listen" data-phoneme-q="'+code+'">🔊 '+word+' 소리 듣기</button>'+
    '<div class="answers">'+shuffle([q,...others]).map(x=>textCard(x[0])).join('')+'</div>';
  }
 }
 if(mode==='blend'){
  instruction('글자를 하나씩 눌러 소리를 듣고, 그다음 소리를 이어 붙여봐!');
  s.innerHTML='<div class="word-hero">'+art(q.w,q.ko)+countBadge(q.w)+'</div>'+
   '<div class="phoneme-tiles">'+[...q.w].map((x,i)=>'<button class="phoneme" data-phoneme="'+i+'"><b>'+x+'</b><small>🔊</small></button>').join('')+'</div>'+
   '<div class="blend-actions"><button data-join="pair" disabled>① 앞의 두 소리 붙이기</button><button data-join="whole" disabled>② '+q.w+' 읽기</button></div>'+
   '<div class="word-result" hidden>🌟 '+q.w+'!</div>';
 }
 if(mode==='read'){
  const n=f==='read4'?4:3;
  const set=f==='rhyme'?rhymeChoices(q,n):choiceSet(WORDS,q,wkey,n);
  instruction(f==='rhyme'?'그림과 알맞은 단어를 골라봐! 비슷한 소리가 섞여 있어.':'그림을 보고 알맞은 단어를 골라봐!');
  s.innerHTML='<div class="word-hero">'+art(q.w,q.ko)+'</div>'+
   '<div class="answers'+(n>3?' four':'')+'">'+set.map(x=>textCard(x.w)).join('')+'</div>';
 }
 if(mode==='animals'){
  instruction('어떤 동물이 '+q.ko+'를 제일 잘할까? 소리를 듣고 골라봐!');
  const others=shuffle(animals.filter(x=>x.id!==q.id&&!((q.id==='run'||q.id==='jump')&&(x.id==='run'||x.id==='jump'))&&!(q.id==='swim'&&x.id==='fly'))).slice(0,2);
  s.innerHTML='<div class="animal-question"><div class="action-word">'+q.ko+'</div>'+
   '<button class="listen" data-say="'+q.id+'">🔊 문제 듣기</button></div>'+
   '<div class="animal-choices">'+shuffle([q,...others]).map(x=>'<button class="animal-choice" data-answer="'+x.id+'"><span class="animal-full" role="img" aria-label="'+x.name+'">'+animalArt(x.id)+'</span><strong>'+x.name+'</strong></button>').join('')+'</div>';
 }
 if(mode==='listen'){
  const n=f==='pic4'?4:3;
  const set=choiceSet(WORDS,q,wkey,n);
  instruction('소리를 듣고 알맞은 그림을 골라봐!');
  s.innerHTML='<button class="listen listen-big" data-say="'+q.w+'">🔊 듣기</button>'+
   '<div class="answers image-answers'+(n>3?' four':'')+'">'+set.map(x=>pictureCard(x.w,x.ko)).join('')+'</div>';
  const word=q.w;
  timer=setTimeout(()=>{
   if(mode!=='listen'||locked)return;
   playSeq([wordClip(word)]).then(r=>{if(r==='blocked')audioNotice('🔊 위의 듣기 버튼을 눌러줘!')});
  },600);
 }
}
/* text-only choice: no picture of the answer may appear in the choices */
function textCard(t,sub=''){return '<button class="answer" data-answer="'+t+'"><strong>'+t+'</strong>'+(sub?'<small>'+sub+'</small>':'')+'</button>'}
/* picture choice, used by the listening quiz and the phonics picture step */
function pictureCard(w,ko,code,noLabel){return '<button class="answer word-answer" data-answer="'+(code||w)+'">'+((noLabel)?'':'<strong>'+w+'</strong>')+'<span class="word-picture">'+art(w,ko)+'</span></button>'}

function markWrong(){
 if(!missed){wrong.push(question);missed=true}
 $('feedback').textContent='괜찮아! 다시 해보자. 이 문제는 조금 뒤에 또 나와 💛';
}
function correct(button){
 if(locked)return;locked=true;
 if(button)button.classList.add('correct');
 $('feedback').textContent='🌟 잘했어! 정답이야!';
 const done=()=>{
  timer=setTimeout(()=>{
   qi++;
   if(qi>=5&&wrong.length===0)finish();else next();
  },900);
 };
 if(mode==='animals'){playSeq(['animal-'+question.id]).then(done);return}
 if(mode==='phonics'){
  if(fmt()==='picture')playSeq([question[1]]).then(done);
  else playSeq(['sound-'+question[0],question[1]],300).then(done);
  return;
 }
 if(mode==='blend'){
  const letters=[...question.w].map(c=>'sound-'+c);
  playSeq([...letters,question.w],120).then(done);return;
 }
 if(mode==='alphabet'){playSeq([nameOf(key())]).then(done);return}
 playSeq([wordClip(key())]).then(done);
}

function finish(){
 clear();completed.add(mode);
 $('track-fill').style.width='100%';$('round').textContent='완료!';
 $('instruction').textContent='다섯 문제를 다 풀었어!';
 $('stage').innerHTML='<div class="finish">🏆<strong>참 잘했어!</strong><span>다른 영어놀이도 해볼까?</span><button id="finish-home">놀이 고르기 🏡</button></div>';
 $('feedback').textContent=wrong.length?'틀렸던 문제는 다음에 또 연습해보자!':'모두 끝! 🌟';
 $('skip').hidden=true;updateProgress();
}
function updateProgress(){$('progress').style.width=(completed.size/6*100)+'%';$('total').textContent=completed.size+' / 6'}
function home(){clear();mode='';question=null;$('home').hidden=false;$('lesson').hidden=true;$('skip').hidden=true;updateProgress()}

/* ------------------------------------------------------------------ events */
$('home').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)start(b.dataset.mode)});

$('stage').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 unlockAudio();
 if(b.id==='finish-home'){home();return}
 if(locked)return;
 if(b.dataset.soundPreview){
  playSeq(['sound-'+b.dataset.soundPreview,b.dataset.word,'sound-'+b.dataset.soundPreview],300);return;
 }
 if(b.dataset.phonemeQ){phoneme3(b.dataset.phonemeQ);return}
 if(b.dataset.say){
  if(mode==='listen')playSeq([wordClip(b.dataset.say)]);
  else if(mode==='animals')playSeq(['animal-'+b.dataset.say]);
  else playSeq([nameOf(b.dataset.say)]);
  return;
 }
 if(b.dataset.phoneme!==undefined){
  const n=+b.dataset.phoneme;
  if(n>blendStep){markWrong();return}
  phoneme3(question.w[n]);
  b.classList.add('played');
  if(n===blendStep)blendStep++;
  if(blendStep>=2)document.querySelector('[data-join="pair"]').disabled=false;
  if(blendStep>=question.w.length)document.querySelector('[data-join="whole"]').disabled=false;
  $('feedback').textContent=blendStep===question.w.length?'이제 붙여서 읽어보자!':'좋아! 다음 글자도 눌러봐';
  return;
 }
 if(b.dataset.join==='pair'){
  playSeq(['sound-'+question.w[0],'sound-'+question.w[1]],170);
  $('feedback').textContent='앞의 두 소리를 이어서 말해봐!';
  return;
 }
 if(b.dataset.join==='whole'){
  const r=document.querySelector('.word-result');if(r)r.hidden=false;
  correct(b);
  return;
 }
 if(b.dataset.answer){
  const chosen=b.dataset.answer;
  if(chosen===key()){correct(b);return}
  b.classList.add('wrong');
  markWrong();
  if(mode==='phonics'){
   if(fmt()==='picture'){
    const snd=sounds.find(x=>x[0]===chosen);
    if(snd)playSeq([snd[1]]);
   }else phoneme3(chosen);
  }
  else if(mode==='alphabet')playSeq([nameOf(chosen)]);
  else if(mode==='animals'){
   const a=animals.find(x=>x.id===chosen);
   if(a){playSeq(['animal-'+a.id]);$('feedback').textContent='🔊 '+a.name+'는 '+a.ko+'! 다시 골라봐 💛'}
  }
  else playSeq([wordClip(chosen)]);
  setTimeout(()=>b.classList.remove('wrong'),700);
 }
});

$('back').onclick=home;
$('skip').onclick=()=>{
 if(locked)return;
 markWrong();qi++;
 if(qi>=5&&wrong.length===0)finish();else next();
};
$('repeat').onclick=()=>{
 if(!mode||!question)return;
 unlockAudio();
 if(mode==='alphabet')playSeq([nameOf(key())]);
 else if(mode==='phonics')phoneme3(question[0]);
 else if(mode==='animals')playSeq(['animal-'+question.id]);
 else if(mode==='blend')phoneme3(question.w[Math.min(blendStep,question.w.length-1)]);
 else playSeq([wordClip(key())]);
};
$('sound').onclick=()=>{
 muted=!muted;
 $('sound').firstChild.textContent=muted?'🔇':'🔊';
 if(master)master.gain.value=muted?0:1;
 if(!muted)unlockAudio();
};
$('reset').onclick=()=>{cancelAudio();completed.clear();Object.keys(decks).forEach(k=>delete decks[k]);lastKey='';home()};

updateProgress();
})();
