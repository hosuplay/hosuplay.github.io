const HOSU_PUZZLE_CATEGORIES = Object.freeze({
 animal:{label:'동물',ready:true,images:()=>photoAnimals},
 insect:{label:'곤충',ready:true,images:()=>insectAnimals.map(q=>({...q,src:'/insects/insects/atlas.png',atlas:q}))},
 dinosaur:{label:'공룡',ready:false,images:()=>[]}
});
let puzzleCategory=null;
function puzzleCategoryData(){return HOSU_PUZZLE_CATEGORIES[puzzleCategory];}
function showPuzzleCategories(){
 puzzleCategory=null;puzzleBag=[];++puzzleToken;
 history.replaceState(null,'','/puzzle/');showScreen('puzzleChoose');renderPuzzleCategories();
}
function choosePuzzleCategory(key){
 const category=HOSU_PUZZLE_CATEGORIES[key];
 if(!category?.ready||!category.images().length)return;
 if(puzzleCategory!==key)puzzleBag=[];
 puzzleCategory=key;history.replaceState(null,'','/puzzle/?category='+key);
 showScreen('puzzleChoose');renderPuzzleCategories();
}
function renderPuzzleCategories(){
 const box=document.getElementById('puzzleCategories');box.replaceChildren();
 for(const [key,category] of Object.entries(HOSU_PUZZLE_CATEGORIES)){
  const button=document.createElement('button');button.className='mode-button';
  button.textContent=category.label+(category.ready?' 퍼즐':' 퍼즐 · 준비중');
  button.disabled=!category.ready;button.onclick=()=>choosePuzzleCategory(key);box.append(button);
 }
 const selected=puzzleCategoryData();
 document.getElementById('puzzleChooseTitle').textContent=selected?selected.label+' 퍼즐':'퍼즐 게임';
 box.hidden=!!selected;document.getElementById('puzzleDifficulties').hidden=!selected;
 document.getElementById('puzzleCategoryBack').hidden=!selected;
}
