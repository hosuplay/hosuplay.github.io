/* 12 individually identifiable dinosaur assets recovered from the user's Library.
   Do not claim this is the full 30-species Work asset list. */
const HOSU_DINOSAURS = Object.freeze([
  {id:'tyrannosaurus',name:'티라노사우루스',period:'백악기',diet:'육식',clue:'큰 머리와 강한 턱, 아주 짧은 앞다리가 특징이에요.'},
  {id:'triceratops',name:'트리케라톱스',period:'백악기',diet:'초식',clue:'얼굴에 뿔이 세 개 있고, 머리 뒤에 넓은 뼈 장식이 있어요.'},
  {id:'stegosaurus',name:'스테고사우루스',period:'쥐라기',diet:'초식',clue:'등에 커다란 골판이 줄지어 있고 꼬리에 뾰족한 가시가 있어요.'},
  {id:'velociraptor',name:'벨로시랩터',period:'백악기',diet:'육식',clue:'몸집이 비교적 작고 발에 낫처럼 휘어진 발톱이 있어요.'},
  {id:'spinosaurus',name:'스피노사우루스',period:'백악기',diet:'물고기 중심의 육식',clue:'등의 긴 돌기가 돛처럼 보이고 물고기를 먹었어요.'},
  {id:'allosaurus',name:'알로사우루스',period:'쥐라기',diet:'육식',clue:'두 발로 걷는 커다란 포식자이고 눈 위에 뿔 같은 돌기가 있어요.'},
  {id:'ankylosaurus',name:'안킬로사우루스',period:'백악기',diet:'초식',clue:'등은 단단한 갑옷처럼 덮였고 꼬리 끝에 뼈 곤봉이 있어요.'},
  {id:'brachiosaurus',name:'브라키오사우루스',period:'쥐라기',diet:'초식',clue:'목이 길고 앞다리가 뒷다리보다 길어 어깨가 높아요.'},
  {id:'diplodocus',name:'디플로도쿠스',period:'쥐라기',diet:'초식',clue:'목과 꼬리가 매우 길고 가느다란 거대한 네발 공룡이에요.'},
  {id:'iguanodon',name:'이구아노돈',period:'백악기',diet:'초식',clue:'엄지손가락 부근에 뾰족한 가시 같은 뼈가 있어요.'},
  {id:'pachycephalosaurus',name:'파키케팔로사우루스',period:'백악기',diet:'초식',clue:'머리 위쪽 뼈가 두껍고 둥글게 솟아 있어요.'},
  {id:'parasaurolophus',name:'파라사우롤로푸스',period:'백악기',diet:'초식',clue:'머리 뒤로 길고 속이 빈 볏이 뻗어 있어요.'}
]);
globalThis.HOSU_DINOSAURS = HOSU_DINOSAURS;
if (typeof module !== 'undefined') module.exports = HOSU_DINOSAURS;
