/* Reuses existing animal photos without changing original files. */
let puzzleSize=3,puzzleAnimal=null,puzzleSelected=null,puzzlePlaced=new Set(),puzzleOrder=[],puzzleToken=0,puzzleBag=[];
let puzzleImageURL=null;
const puzzleEl=id=>document.getElementById('puzzle'+id);
function openPuzzle(){speechSynthesis.cancel();showScreen('puzzleChoose');}
function startPuzzle(size){
 puzzleSize=size===4?4:3;const token=++puzzleToken;puzzleSelected=null;puzzlePlaced=new Set();
 if(!puzzleBag.length)puzzleBag=shufflePhotos(photoAnimals);
 puzzleAnimal=puzzleBag.pop();showScreen('puzzleScreen');
 puzzleEl('Tray').hidden=false;puzzleEl('Board').innerHTML='';puzzleEl('Tray').innerHTML='';puzzleEl('Complete').hidden=true;puzzleEl('Retry').hidden=true;puzzleEl('Reference').hidden=true;
 if(puzzleImageURL){URL.revokeObjectURL(puzzleImageURL);puzzleImageURL=null;}
 puzzleEl('Reference').removeAttribute('src');
 puzzleEl('Toggle').textContent='👀 완성 그림 보기';puzzleEl('Message').textContent='동물 그림을 불러오고 있어요…';puzzleEl('Count').textContent=`0 / ${puzzleSize*puzzleSize}`;
 puzzleEl('Level').textContent=puzzleSize===3?'쉬움 · 9조각':'어려움 · 16조각';
 const img=new Image();img.fetchPriority='high';img.decoding='async';img.onload=()=>{if(token!==puzzleToken)return;
  // Fit the entire selected picture into a square before making equal tiles.
  // Insect puzzles use one cell from the 4 × 3 atlas instead of the whole atlas image.
  const canvas=document.createElement('canvas');canvas.width=canvas.height=960;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffdf4';ctx.fillRect(0,0,960,960);
  let sx=0,sy=0,sw=img.width,sh=img.height;
  if(puzzleAnimal.atlas){sw=img.width/4;sh=img.height/3;sx=puzzleAnimal.atlas.col*sw;sy=puzzleAnimal.atlas.row*sh;}
  const scale=Math.min(960/sw,960/sh),dw=sw*scale,dh=sh*scale;
  ctx.drawImage(img,sx,sy,sw,sh,(960-dw)/2,(960-dh)/2,dw,dh);
  canvas.toBlob(blob=>{
  if(token!==puzzleToken)return;
  if(!blob){img.onerror();return;}
  const url=URL.createObjectURL(blob);puzzleImageURL=url;puzzleEl('Reference').src=url;puzzleEl('Reference').alt=puzzleAnimal.answer+' 완성 그림';
  const board=puzzleEl('Board'),tray=puzzleEl('Tray');board.style.setProperty('--pieces',puzzleSize);tray.style.setProperty('--pieces',puzzleSize);
  for(let i=0;i<puzzleSize*puzzleSize;i++){
   const slot=document.createElement('button');slot.className='puzzle-slot';slot.setAttribute('aria-label',`${Math.floor(i/puzzleSize)+1}번째 줄 ${i%puzzleSize+1}번째 빈칸`);slot.onclick=()=>placePuzzlePiece(i);slot.ondragover=e=>e.preventDefault();slot.ondrop=e=>{e.preventDefault();placePuzzlePiece(i)};board.append(slot);
  }
  puzzleOrder=shufflePhotos(Array.from({length:puzzleSize*puzzleSize},(_,i)=>i));
  puzzleOrder.forEach((i,index)=>{const piece=document.createElement('button');piece.className='puzzle-piece';piece.dataset.piece=i;piece.draggable=true;piece.setAttribute('aria-label',`${index+1}번 그림 조각`);piece.setAttribute('aria-pressed','false');piece.style.backgroundImage=`url("${url}")`;piece.style.backgroundSize=`${puzzleSize*100}% ${puzzleSize*100}%`;piece.style.backgroundPosition=`${i%puzzleSize/(puzzleSize-1)*100}% ${Math.floor(i/puzzleSize)/(puzzleSize-1)*100}%`;piece.onclick=()=>selectPuzzlePiece(i);piece.ondragstart=e=>{selectPuzzlePiece(i);e.dataTransfer.setData('text/plain',String(i));e.dataTransfer.effectAllowed='move'};tray.append(piece)});
  puzzleEl('Message').textContent='옆으로 넘겨 고르고, 위로 끌어 놓거나 조각과 빈칸을 눌러요!';
  },'image/png');
 };img.onerror=()=>{if(token!==puzzleToken)return;puzzleEl('Message').textContent='그림을 불러오지 못했어요. 다시 시작해 주세요.';puzzleEl('Retry').hidden=false};img.src=puzzleAnimal.atlas?(puzzleAnimal.src||'insects/atlas.png'):`photos/${puzzleAnimal.id}.webp`;
}
function selectPuzzlePiece(i){if(puzzlePlaced.has(i))return;puzzleSelected=i;puzzleEl('Tray').querySelectorAll('button').forEach(b=>{const selected=Number(b.dataset.piece)===i;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))});puzzleEl('Message').textContent='이 조각이 들어갈 빈칸을 눌러요.';}
function placePuzzlePiece(slot){
 if(puzzleSelected===null||puzzlePlaced.has(slot))return;
 if(slot!==puzzleSelected){puzzleEl('Message').textContent='다른 자리에 놓아 볼까요? 모양을 살펴봐요!';return;}
 const piece=puzzleEl('Tray').querySelector(`[data-piece="${slot}"]`),target=puzzleEl('Board').children[slot];target.style.backgroundImage=piece.style.backgroundImage;target.style.backgroundSize=piece.style.backgroundSize;target.style.backgroundPosition=piece.style.backgroundPosition;target.classList.add('filled');target.setAttribute('aria-label','맞춘 조각');target.disabled=true;piece.disabled=true;piece.style.display='none';puzzlePlaced.add(slot);puzzleSelected=null;
 puzzleEl('Count').textContent=`${puzzlePlaced.size} / ${puzzleSize*puzzleSize}`;puzzleEl('Message').textContent='잘했어요! 다음 조각도 찾아봐요.';
 if(puzzlePlaced.size===puzzleSize*puzzleSize){puzzleEl('Message').textContent=`🎉 ${puzzleAnimal.answer} 퍼즐 완성!`;puzzleEl('Complete').hidden=false;puzzleEl('Tray').hidden=true;launchConfetti();playApplause();speak(`잘했어요! ${puzzleAnimal.answer} 퍼즐 완성!`)}
}
function nextPuzzle(){puzzleEl('Tray').hidden=false;startPuzzle(puzzleSize)}
function togglePuzzleReference(){const img=puzzleEl('Reference');img.hidden=!img.hidden;puzzleEl('Toggle').textContent=img.hidden?'👀 완성 그림 보기':'🙈 완성 그림 숨기기';}
