/* Shared by dinosaur quizzes, field guide and the existing puzzle engine. */
const dinosaurAnimals = Object.freeze([
  {
    "id": "tyrannosaurus",
    "answer": "티라노사우루스",
    "period": "백악기",
    "diet": "육식",
    "src": "/dinosaurs/images/tyrannosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "커다란 머리와 튼튼한 뒷다리가 있어요.",
      "앞발에는 손가락이 두 개 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/tyrannosaurus.html"
  },
  {
    "id": "triceratops",
    "answer": "트리케라톱스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/triceratops.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "네 발로 걸으며 식물을 먹었어요.",
      "얼굴에 뿔이 세 개 있고 목 뒤에 큰 프릴이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/triceratops.html"
  },
  {
    "id": "stegosaurus",
    "answer": "스테고사우루스",
    "period": "쥐라기",
    "diet": "초식",
    "src": "/dinosaurs/images/stegosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "주로 식물을 먹었어요.",
      "머리가 작고 뒷다리가 앞다리보다 길어요.",
      "등에 큰 골판이 있고 꼬리 끝에는 긴 가시가 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/stegosaurus.html"
  },
  {
    "id": "brachiosaurus",
    "answer": "브라키오사우루스",
    "period": "쥐라기",
    "diet": "초식",
    "src": "/dinosaurs/images/brachiosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "주로 식물을 먹었어요.",
      "목이 길어서 높은 곳의 잎을 먹기 좋았어요.",
      "앞다리가 뒷다리보다 길어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/brachiosaurus.html"
  },
  {
    "id": "diplodocus",
    "answer": "디플로도쿠스",
    "period": "쥐라기",
    "diet": "초식",
    "src": "/dinosaurs/images/diplodocus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "주로 식물을 먹었어요.",
      "목도 길고 꼬리도 아주 길어요.",
      "가느다란 채찍 같은 꼬리가 특징이에요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/diplodocus.html"
  },
  {
    "id": "apatosaurus",
    "answer": "아파토사우루스",
    "period": "쥐라기",
    "diet": "초식",
    "src": "/dinosaurs/images/apatosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "주로 식물을 먹었어요.",
      "네 발로 걷는 몸집 큰 공룡이에요.",
      "굵고 튼튼한 목과 긴 꼬리가 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/apatosaurus.html"
  },
  {
    "id": "ankylosaurus",
    "answer": "안킬로사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/ankylosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "몸이 낮고 네 발로 걸었어요.",
      "등은 갑옷처럼 덮여 있고 꼬리 끝에는 곤봉이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/ankylosaurus.html"
  },
  {
    "id": "parasaurolophus",
    "answer": "파라사우롤로푸스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/parasaurolophus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "오리 부리처럼 넓적한 입이 있어요.",
      "머리 뒤로 길게 뻗은 관이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/parasaurolophus.html"
  },
  {
    "id": "velociraptor",
    "answer": "벨로키랍토르",
    "period": "백악기",
    "diet": "육식",
    "src": "/dinosaurs/images/velociraptor.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "몸에 깃털이 있던 작은 공룡이에요.",
      "뒷발에 커다란 낫 모양 발톱이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/velociraptor.html"
  },
  {
    "id": "spinosaurus",
    "answer": "스피노사우루스",
    "period": "백악기",
    "diet": "육식",
    "src": "/dinosaurs/images/spinosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "긴 주둥이로 물고기도 먹었어요.",
      "등에 커다란 돛 모양 구조가 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/spinosaurus.html"
  },
  {
    "id": "allosaurus",
    "answer": "알로사우루스",
    "period": "쥐라기",
    "diet": "육식",
    "src": "/dinosaurs/images/allosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "두 발로 걷는 큰 포식자였어요.",
      "눈 위에 작은 뿔 같은 돌기가 있고 앞발 손가락은 세 개예요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/allosaurus.html"
  },
  {
    "id": "carnotaurus",
    "answer": "카르노타우루스",
    "period": "백악기",
    "diet": "육식",
    "src": "/dinosaurs/images/carnotaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "짧고 깊은 머리와 아주 작은 앞다리가 있어요.",
      "눈 위에 소처럼 뿔이 두 개 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/carnotaurus.html"
  },
  {
    "id": "dilophosaurus",
    "answer": "딜로포사우루스",
    "period": "쥐라기",
    "diet": "육식",
    "src": "/dinosaurs/images/dilophosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "두 발로 걷고 긴 꼬리로 균형을 잡았어요.",
      "머리 위에 얇은 볏이 나란히 두 개 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/dilophosaurus.html"
  },
  {
    "id": "ceratosaurus",
    "answer": "케라토사우루스",
    "period": "쥐라기",
    "diet": "육식",
    "src": "/dinosaurs/images/ceratosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "날카로운 이빨을 가진 포식자예요.",
      "코 위에 뿔이 하나 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/ceratosaurus.html"
  },
  {
    "id": "baryonyx",
    "answer": "바리오닉스",
    "period": "백악기",
    "diet": "육식",
    "src": "/dinosaurs/images/baryonyx.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "길쭉한 주둥이로 물고기도 먹었어요.",
      "앞발에 커다랗게 휜 엄지 발톱이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/baryonyx.html"
  },
  {
    "id": "deinonychus",
    "answer": "데이노니쿠스",
    "period": "백악기",
    "diet": "육식",
    "src": "/dinosaurs/images/deinonychus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "깃털이 있고 긴 꼬리로 균형을 잡았어요.",
      "이름은 무서운 발톱이라는 뜻이고 뒷발에 큰 낫 모양 발톱이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/deinonychus.html"
  },
  {
    "id": "iguanodon",
    "answer": "이구아노돈",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/iguanodon.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "식물을 씹어 먹는 이빨이 있었어요.",
      "엄지손가락이 뾰족한 가시 모양이에요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/iguanodon.html"
  },
  {
    "id": "pachycephalosaurus",
    "answer": "파키케팔로사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/pachycephalosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "두 발로 걸으며 긴 꼬리로 균형을 잡았어요.",
      "머리 꼭대기가 둥글고 두꺼운 돔 모양이에요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/pachycephalosaurus.html"
  },
  {
    "id": "styracosaurus",
    "answer": "스티라코사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/styracosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "부리 같은 입으로 식물을 먹었어요.",
      "코에 긴 뿔이 있고 목 프릴 가장자리에 긴 가시들이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/styracosaurus.html"
  },
  {
    "id": "protoceratops",
    "answer": "프로토케라톱스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/protoceratops.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "몸집이 비교적 작은 네 발 공룡이에요.",
      "목 뒤에 프릴이 있지만 얼굴에 큰 뿔은 없어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/protoceratops.html"
  },
  {
    "id": "psittacosaurus",
    "answer": "프시타코사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/psittacosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "작은 몸과 긴 꼬리를 가졌어요.",
      "앵무새처럼 구부러진 부리가 있고 큰 목 프릴은 없어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/psittacosaurus.html"
  },
  {
    "id": "corythosaurus",
    "answer": "코리토사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/corythosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "오리 부리처럼 넓적한 입이 있어요.",
      "머리 위에 둥근 투구 모양 볏이 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/corythosaurus.html"
  },
  {
    "id": "edmontosaurus",
    "answer": "에드몬토사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/edmontosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "많은 이빨로 식물을 잘 씹었어요.",
      "넓적한 오리 부리 같은 입이 있고 커다란 뼈 볏은 없어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/edmontosaurus.html"
  },
  {
    "id": "maiasaura",
    "answer": "마이아사우라",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/maiasaura.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "오리 부리 공룡 무리에 속해요.",
      "이름은 좋은 엄마 도마뱀이라는 뜻이에요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/maiasaura.html"
  },
  {
    "id": "kentrosaurus",
    "answer": "켄트로사우루스",
    "period": "쥐라기",
    "diet": "초식",
    "src": "/dinosaurs/images/kentrosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "쥐라기에 살았어요.",
      "주로 식물을 먹었어요.",
      "작은 머리를 가진 네 발 공룡이에요.",
      "등 앞쪽에는 골판이, 뒤쪽과 꼬리에는 긴 가시가 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/kentrosaurus.html"
  },
  {
    "id": "amargasaurus",
    "answer": "아마르가사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/amargasaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "목이 긴 네 발 초식 공룡이에요.",
      "목과 등 앞쪽에 길게 솟은 가시가 두 줄 있어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/amargasaurus.html"
  },
  {
    "id": "argentinosaurus",
    "answer": "아르헨티노사우루스",
    "period": "백악기",
    "diet": "초식",
    "src": "/dinosaurs/images/argentinosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "백악기에 살았어요.",
      "주로 식물을 먹었어요.",
      "아주 거대한 몸집의 긴 목 공룡이에요.",
      "아르헨티나에서 화석이 발견되어 이름이 붙었어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/argentinosaurus.html"
  },
  {
    "id": "plateosaurus",
    "answer": "플라테오사우루스",
    "period": "트라이아스기",
    "diet": "초식",
    "src": "/dinosaurs/images/plateosaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "트라이아스기에 살았어요.",
      "주로 식물을 먹었어요.",
      "공룡이 나타난 초기 시대에 살았어요.",
      "긴 목과 작은 머리가 있고 주로 두 발로 걸었어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/plateosaurus.html"
  },
  {
    "id": "coelophysis",
    "answer": "코엘로피시스",
    "period": "트라이아스기",
    "diet": "육식",
    "src": "/dinosaurs/images/coelophysis.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "트라이아스기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "공룡이 나타난 초기 시대의 포식자예요.",
      "몸이 가늘고 목과 꼬리가 길어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/coelophysis.html"
  },
  {
    "id": "herrerasaurus",
    "answer": "헤레라사우루스",
    "period": "트라이아스기",
    "diet": "육식",
    "src": "/dinosaurs/images/herrerasaurus.webp",
    "base": "어떤 공룡일까요? 힌트를 하나씩 열어 보세요.",
    "hints": [
      "트라이아스기에 살았어요.",
      "다른 동물이나 물고기를 먹었어요.",
      "아주 이른 시기에 살았던 포식 공룡이에요.",
      "아르헨티나에서 발견되었고 튼튼한 뒷다리로 걸었어요."
    ],
    "source": "https://www.nhm.ac.uk/discover/dino-directory/herrerasaurus.html"
  }
]);
