/* 사진 퀴즈: 기존 글 힌트 퀴즈와 상태 및 기록을 분리합니다. */
const photoAnimals=[
 {id:'elephant',answer:'코끼리',focus:[.48,.43],choices:['코끼리','하마','코뿔소','물소']},
 {id:'giraffe',answer:'기린',focus:[.5,.42],choices:['기린','낙타','사슴','얼룩말']},
 {id:'zebra',answer:'얼룩말',focus:[.5,.5],choices:['얼룩말','말','당나귀','사슴']},
 {id:'tiger',answer:'호랑이',focus:[.5,.5],choices:['호랑이','사자','치타','표범']},
 {id:'panda',answer:'판다',focus:[.5,.4],choices:['판다','북극곰','너구리','코알라']},
 {id:'rabbit',answer:'토끼',focus:[.48,.35],choices:['토끼','다람쥐','햄스터','고슴도치']},
 {id:'lion',answer:'사자',focus:[.48,.4],choices:['사자','호랑이','치타','표범']},
 {id:'penguin',answer:'펭귄',focus:[.5,.5],choices:['펭귄','오리','타조','닭']},
 {id:'flamingo',answer:'홍학',focus:[.5,.42],choices:['홍학','타조','공작','백조']},
 {id:'peacock',answer:'공작',focus:[.62,.4],choices:['공작','앵무새','닭','홍학']},
 {id:'red-panda',answer:'레서판다',focus:[.5,.45],choices:['레서판다','여우','라쿤','판다']},
 {id:'hippo',answer:'하마',focus:[.5,.45],choices:['하마','코뿔소','코끼리','물소']} ,
{"id": "rhino", "answer": "코뿔소", "focus": [0.5, 0.45], "choices": ["코뿔소", "하마", "코끼리", "물소"]},
{"id": "camel", "answer": "낙타", "focus": [0.5, 0.45], "choices": ["낙타", "라마", "기린", "말"]},
{"id": "kangaroo", "answer": "캥거루", "focus": [0.5, 0.45], "choices": ["캥거루", "토끼", "코알라", "웜뱃"]},
{"id": "koala", "answer": "코알라", "focus": [0.5, 0.45], "choices": ["캥거루", "토끼", "코알라", "웜뱃"]},
{"id": "sloth", "answer": "나무늘보", "focus": [0.5, 0.45], "choices": ["코알라", "판다", "나무늘보", "레서판다"]},
{"id": "gorilla", "answer": "고릴라", "focus": [0.5, 0.45], "choices": ["나무늘보", "원숭이", "코알라", "고릴라"]},
{"id": "orangutan", "answer": "오랑우탄", "focus": [0.5, 0.45], "choices": ["고릴라", "침팬지", "오랑우탄", "개코원숭이"]},
{"id": "chimp", "answer": "침팬지", "focus": [0.5, 0.45], "choices": ["고릴라", "침팬지", "오랑우탄", "개코원숭이"]},
{"id": "fox", "answer": "여우", "focus": [0.5, 0.45], "choices": ["여우", "늑대", "개", "라쿤"]},
{"id": "wolf", "answer": "늑대", "focus": [0.5, 0.45], "choices": ["여우", "늑대", "개", "라쿤"]},
{"id": "bear", "answer": "갈색곰", "focus": [0.5, 0.45], "choices": ["갈색곰", "북극곰", "판다", "코알라"]},
{"id": "polar-bear", "answer": "북극곰", "focus": [0.5, 0.45], "choices": ["갈색곰", "북극곰", "판다", "코알라"]},
{"id": "raccoon", "answer": "라쿤", "focus": [0.5, 0.45], "choices": ["여우", "늑대", "개", "라쿤"]},
{"id": "squirrel", "answer": "다람쥐", "focus": [0.5, 0.45], "choices": ["다람쥐", "햄스터", "토끼", "고슴도치"]},
{"id": "hedgehog", "answer": "고슴도치", "focus": [0.5, 0.45], "choices": ["다람쥐", "햄스터", "토끼", "고슴도치"]},
{"id": "meerkat", "answer": "미어캣", "focus": [0.5, 0.45], "choices": ["미어캣", "수달", "라쿤", "스컹크"]},
{"id": "skunk", "answer": "스컹크", "focus": [0.5, 0.45], "choices": ["미어캣", "수달", "라쿤", "스컹크"]},
{"id": "otter", "answer": "수달", "focus": [0.5, 0.45], "choices": ["미어캣", "수달", "라쿤", "스컹크"]},
{"id": "beaver", "answer": "비버", "focus": [0.5, 0.45], "choices": ["비버", "수달", "하마", "물범"]},
{"id": "deer", "answer": "사슴", "focus": [0.5, 0.45], "choices": ["사슴", "말", "염소", "소"]},
{"id": "horse", "answer": "말", "focus": [0.5, 0.45], "choices": ["낙타", "라마", "기린", "말"]},
{"id": "donkey", "answer": "당나귀", "focus": [0.5, 0.45], "choices": ["말", "당나귀", "얼룩말", "낙타"]},
{"id": "cow", "answer": "소", "focus": [0.5, 0.45], "choices": ["사슴", "말", "염소", "소"]},
{"id": "pig", "answer": "돼지", "focus": [0.5, 0.45], "choices": ["소", "돼지", "양", "염소"]},
{"id": "sheep", "answer": "양", "focus": [0.5, 0.45], "choices": ["소", "돼지", "양", "염소"]},
{"id": "goat", "answer": "염소", "focus": [0.5, 0.45], "choices": ["사슴", "말", "염소", "소"]},
{"id": "dog", "answer": "개", "focus": [0.5, 0.45], "choices": ["여우", "늑대", "개", "라쿤"]},
{"id": "cat", "answer": "고양이", "focus": [0.5, 0.45], "choices": ["개", "고양이", "여우", "늑대"]},
{"id": "duck", "answer": "오리", "focus": [0.5, 0.45], "choices": ["오리", "닭", "펭귄", "펠리컨"]},
{"id": "chicken", "answer": "닭", "focus": [0.5, 0.45], "choices": ["오리", "닭", "펭귄", "펠리컨"]},
{"id": "owl", "answer": "부엉이", "focus": [0.5, 0.45], "choices": ["부엉이", "앵무새", "공작", "독수리"]},
{"id": "parrot", "answer": "앵무새", "focus": [0.5, 0.45], "choices": ["부엉이", "앵무새", "공작", "독수리"]},
{"id": "ostrich", "answer": "타조", "focus": [0.5, 0.45], "choices": ["타조", "홍학", "공작", "펭귄"]},
{"id": "pelican", "answer": "펠리컨", "focus": [0.5, 0.45], "choices": ["오리", "닭", "펭귄", "펠리컨"]},
{"id": "dolphin", "answer": "돌고래", "focus": [0.5, 0.45], "choices": ["돌고래", "물범", "바다코끼리", "상어"]},
{"id": "seal", "answer": "물범", "focus": [0.5, 0.45], "choices": ["비버", "수달", "하마", "물범"]},
{"id": "walrus", "answer": "바다코끼리", "focus": [0.5, 0.45], "choices": ["돌고래", "물범", "바다코끼리", "상어"]},
{"id": "crocodile", "answer": "악어", "focus": [0.5, 0.45], "choices": ["악어", "도마뱀", "이구아나", "뱀"]}
];

const photoVariantData = {"bear":[{"id":"body-1","src":"photos/bear.webp","focus":[0.5785,0.5552],"size":0.2,"stages":[[0.4773,0.4672,0.2024,0.176],[0.4524,0.4456,0.2852,0.248],[0.4276,0.424,0.368,0.32],[0.4,0.4,0.46,0.4],[0,0,1,1]]},{"id":"body-2","src":"photos/bear.webp","focus":[0.6815,0.6447999999999999],"size":0.2,"stages":[[0.5803,0.5568,0.2024,0.176],[0.5224,0.5064,0.2852,0.248],[0.4644,0.456,0.368,0.32],[0.4,0.4,0.46,0.4],[0,0,1,1]]}],"beaver":[{"id":"body-1","src":"photos/beaver.webp","focus":[0.35559999999999997,0.647],"size":0.2,"stages":[[0.239,0.592,0.2332,0.11],[0.2104,0.5785,0.3286,0.155],[0.1818,0.565,0.424,0.2],[0.15,0.55,0.53,0.25],[0,0,1,1]]},{"id":"body-2","src":"photos/beaver.webp","focus":[0.4744,0.7030000000000001],"size":0.2,"stages":[[0.3578,0.648,0.2332,0.11],[0.291,0.6165,0.3286,0.155],[0.2242,0.585,0.424,0.2],[0.15,0.55,0.53,0.25],[0,0,1,1]]}],"camel":[{"id":"body-1","src":"photos/camel.webp","focus":[0.36619999999999997,0.5601],"size":0.2,"stages":[[0.2606,0.4523,0.2112,0.2156],[0.2347,0.4259,0.2976,0.3038],[0.2088,0.3994,0.384,0.392],[0.18,0.37,0.48,0.49],[0,0,1,1]]},{"id":"body-2","src":"photos/camel.webp","focus":[0.4738,0.6699],"size":0.2,"stages":[[0.3682,0.5621,0.2112,0.2156],[0.3077,0.5003,0.2976,0.3038],[0.2472,0.4386,0.384,0.392],[0.18,0.37,0.48,0.49],[0,0,1,1]]}],"cat":[{"id":"body-1","src":"photos/cat.webp","focus":[0.5474,0.5707],"size":0.2,"stages":[[0.4638,0.4739,0.1672,0.1936],[0.4433,0.4502,0.2356,0.2728],[0.4228,0.4264,0.304,0.352],[0.4,0.4,0.38,0.44],[0,0,1,1]]},{"id":"body-2","src":"photos/cat.webp","focus":[0.6326,0.6693],"size":0.2,"stages":[[0.549,0.5725,0.1672,0.1936],[0.5011,0.517,0.2356,0.2728],[0.4532,0.4616,0.304,0.352],[0.4,0.4,0.38,0.44],[0,0,1,1]]}],"chicken":[{"id":"body-1","src":"photos/chicken.webp","focus":[0.364,0.5452],"size":0.2,"stages":[[0.254,0.4572,0.22,0.176],[0.227,0.4356,0.31,0.248],[0.2,0.414,0.4,0.32],[0.17,0.39,0.5,0.4],[0,0,1,1]]},{"id":"body-2","src":"photos/chicken.webp","focus":[0.476,0.6347999999999999],"size":0.2,"stages":[[0.366,0.5468,0.22,0.176],[0.303,0.4964,0.31,0.248],[0.24,0.446,0.4,0.32],[0.17,0.39,0.5,0.4],[0,0,1,1]]}],"chimp":[{"id":"body-1","src":"photos/chimp.webp","focus":[0.3518,0.6291],"size":0.2,"stages":[[0.2374,0.5389,0.2288,0.1804],[0.2093,0.5167,0.3224,0.2542],[0.1812,0.4946,0.416,0.328],[0.15,0.47,0.52,0.41],[0,0,1,1]]},{"id":"body-2","src":"photos/chimp.webp","focus":[0.4682,0.7209000000000001],"size":0.2,"stages":[[0.3538,0.6307,0.2288,0.1804],[0.2883,0.5791,0.3224,0.2542],[0.2228,0.5274,0.416,0.328],[0.15,0.47,0.52,0.41],[0,0,1,1]]}],"cow":[{"id":"body-1","src":"photos/cow.webp","focus":[0.3762,0.5646],"size":0.2,"stages":[[0.2706,0.4656,0.2112,0.198],[0.2447,0.4413,0.2976,0.279],[0.2188,0.417,0.384,0.36],[0.19,0.39,0.48,0.45],[0,0,1,1]]},{"id":"body-2","src":"photos/cow.webp","focus":[0.4838,0.6654],"size":0.2,"stages":[[0.3782,0.5664,0.2112,0.198],[0.3177,0.5097,0.2976,0.279],[0.2572,0.453,0.384,0.36],[0.19,0.39,0.48,0.45],[0,0,1,1]]}],"crocodile":[{"id":"body-1","src":"photos/crocodile.webp","focus":[0.5401,0.5948],"size":0.2,"stages":[[0.4323,0.5354,0.2156,0.1188],[0.4059,0.5208,0.3038,0.1674],[0.3794,0.5062,0.392,0.216],[0.35,0.49,0.49,0.27],[0,0,1,1]]},{"id":"body-2","src":"photos/crocodile.webp","focus":[0.6499,0.6552],"size":0.2,"stages":[[0.5421,0.5958,0.2156,0.1188],[0.4803,0.5618,0.3038,0.1674],[0.4186,0.5278,0.392,0.216],[0.35,0.49,0.49,0.27],[0,0,1,1]]}],"deer":[{"id":"body-1","src":"photos/deer.webp","focus":[0.4024,0.613],"size":0.2,"stages":[[0.299,0.5206,0.2068,0.1848],[0.2736,0.4979,0.2914,0.2604],[0.2482,0.4752,0.376,0.336],[0.22,0.45,0.47,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/deer.webp","focus":[0.5076,0.7070000000000001],"size":0.2,"stages":[[0.4042,0.6146,0.2068,0.1848],[0.345,0.5617,0.2914,0.2604],[0.2858,0.5088,0.376,0.336],[0.22,0.45,0.47,0.42],[0,0,1,1]]}],"dog":[{"id":"body-1","src":"photos/dog.webp","focus":[0.3468,0.583],"size":0.2,"stages":[[0.2522,0.4906,0.1892,0.1848],[0.229,0.4679,0.2666,0.2604],[0.2058,0.4452,0.344,0.336],[0.18,0.42,0.43,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/dog.webp","focus":[0.44320000000000004,0.677],"size":0.2,"stages":[[0.3486,0.5846,0.1892,0.1848],[0.2944,0.5317,0.2666,0.2604],[0.2402,0.4788,0.344,0.336],[0.18,0.42,0.43,0.42],[0,0,1,1]]}],"dolphin":[{"id":"body-1","src":"photos/dolphin.webp","focus":[0.323,0.5797],"size":0.2,"stages":[[0.2306,0.5005,0.1848,0.1584],[0.2079,0.481,0.2604,0.2232],[0.1852,0.4616,0.336,0.288],[0.16,0.44,0.42,0.36],[0,0,1,1]]},{"id":"body-2","src":"photos/dolphin.webp","focus":[0.417,0.6603],"size":0.2,"stages":[[0.3246,0.5811,0.1848,0.1584],[0.2717,0.5358,0.2604,0.2232],[0.2188,0.4904,0.336,0.288],[0.16,0.44,0.42,0.36],[0,0,1,1]]}],"donkey":[{"id":"body-1","src":"photos/donkey.webp","focus":[0.3462,0.6052],"size":0.2,"stages":[[0.2406,0.5172,0.2112,0.176],[0.2147,0.4956,0.2976,0.248],[0.1888,0.474,0.384,0.32],[0.16,0.45,0.48,0.4],[0,0,1,1]]},{"id":"body-2","src":"photos/donkey.webp","focus":[0.4538,0.6948],"size":0.2,"stages":[[0.3482,0.6068,0.2112,0.176],[0.2877,0.5564,0.2976,0.248],[0.2272,0.506,0.384,0.32],[0.16,0.45,0.48,0.4],[0,0,1,1]]}],"duck":[{"id":"body-1","src":"photos/duck.webp","focus":[0.35009999999999997,0.5652],"size":0.2,"stages":[[0.2423,0.4772,0.2156,0.176],[0.2159,0.4556,0.3038,0.248],[0.1894,0.434,0.392,0.32],[0.16,0.41,0.49,0.4],[0,0,1,1]]},{"id":"body-2","src":"photos/duck.webp","focus":[0.45990000000000003,0.6547999999999999],"size":0.2,"stages":[[0.3521,0.5668,0.2156,0.176],[0.2903,0.5164,0.3038,0.248],[0.2286,0.466,0.392,0.32],[0.16,0.41,0.49,0.4],[0,0,1,1]]}],"elephant":[{"id":"body-1","src":"photos/elephant.webp","focus":[0.2774,0.5968],"size":0.2,"stages":[[0.1938,0.5022,0.1672,0.1892],[0.1733,0.479,0.2356,0.2666],[0.1528,0.4558,0.304,0.344],[0.13,0.43,0.38,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/elephant.webp","focus":[0.36260000000000003,0.6932],"size":0.2,"stages":[[0.279,0.5986,0.1672,0.1892],[0.2311,0.5444,0.2356,0.2666],[0.1832,0.4902,0.304,0.344],[0.13,0.43,0.38,0.43],[0,0,1,1]]}],"flamingo":[{"id":"body-1","src":"photos/flamingo.webp","focus":[0.37129999999999996,0.5856],"size":0.2,"stages":[[0.2855,0.469,0.1716,0.2332],[0.2645,0.4404,0.2418,0.3286],[0.2434,0.4118,0.312,0.424],[0.22,0.38,0.39,0.53],[0,0,1,1]]},{"id":"body-2","src":"photos/flamingo.webp","focus":[0.4587,0.7044],"size":0.2,"stages":[[0.3729,0.5878,0.1716,0.2332],[0.3237,0.521,0.2418,0.3286],[0.2746,0.4542,0.312,0.424],[0.22,0.38,0.39,0.53],[0,0,1,1]]}],"fox":[{"id":"body-1","src":"photos/fox.webp","focus":[0.5707,0.5930000000000001],"size":0.2,"stages":[[0.4739,0.5006,0.1936,0.1848],[0.4502,0.4779,0.2728,0.2604],[0.4264,0.4552,0.352,0.336],[0.4,0.43,0.44,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/fox.webp","focus":[0.6693,0.687],"size":0.2,"stages":[[0.5725,0.5946,0.1936,0.1848],[0.517,0.5417,0.2728,0.2604],[0.4616,0.4888,0.352,0.336],[0.4,0.43,0.44,0.42],[0,0,1,1]]}],"giraffe":[{"id":"body-1","src":"photos/giraffe.webp","focus":[0.5413,0.6068],"size":0.2,"stages":[[0.4555,0.5122,0.1716,0.1892],[0.4345,0.489,0.2418,0.2666],[0.4134,0.4658,0.312,0.344],[0.39,0.44,0.39,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/giraffe.webp","focus":[0.6287,0.7032],"size":0.2,"stages":[[0.5429,0.6086,0.1716,0.1892],[0.4937,0.5544,0.2418,0.2666],[0.4446,0.5002,0.312,0.344],[0.39,0.44,0.39,0.43],[0,0,1,1]]}],"goat":[{"id":"body-1","src":"photos/goat.webp","focus":[0.3546,0.5968],"size":0.2,"stages":[[0.2556,0.5022,0.198,0.1892],[0.2313,0.479,0.279,0.2666],[0.207,0.4558,0.36,0.344],[0.18,0.43,0.45,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/goat.webp","focus":[0.4554,0.6932],"size":0.2,"stages":[[0.3564,0.5986,0.198,0.1892],[0.2997,0.5444,0.279,0.2666],[0.243,0.4902,0.36,0.344],[0.18,0.43,0.45,0.43],[0,0,1,1]]}],"gorilla":[{"id":"body-1","src":"photos/gorilla.webp","focus":[0.3889,0.6513],"size":0.2,"stages":[[0.2591,0.5655,0.2596,0.1716],[0.2273,0.5445,0.3658,0.2418],[0.1954,0.5234,0.472,0.312],[0.16,0.5,0.59,0.39],[0,0,1,1]]},{"id":"body-2","src":"photos/gorilla.webp","focus":[0.5211,0.7387],"size":0.2,"stages":[[0.3913,0.6529,0.2596,0.1716],[0.3169,0.6037,0.3658,0.2418],[0.2426,0.5546,0.472,0.312],[0.16,0.5,0.59,0.39],[0,0,1,1]]}],"hedgehog":[{"id":"body-1","src":"photos/hedgehog.webp","focus":[0.2852,0.44520000000000004],"size":0.2,"stages":[[0.1972,0.3572,0.176,0.176],[0.1756,0.3356,0.248,0.248],[0.154,0.314,0.32,0.32],[0.13,0.29,0.4,0.4],[0,0,1,1]]},{"id":"body-2","src":"photos/hedgehog.webp","focus":[0.3748,0.5347999999999999],"size":0.2,"stages":[[0.2868,0.4468,0.176,0.176],[0.2364,0.3964,0.248,0.248],[0.186,0.346,0.32,0.32],[0.13,0.29,0.4,0.4],[0,0,1,1]]}],"hippo":[{"id":"body-1","src":"photos/hippo.webp","focus":[0.5946,0.5524],"size":0.2,"stages":[[0.4956,0.449,0.198,0.2068],[0.4713,0.4236,0.279,0.2914],[0.447,0.3982,0.36,0.376],[0.42,0.37,0.45,0.47],[0,0,1,1]]},{"id":"body-2","src":"photos/hippo.webp","focus":[0.6954,0.6576000000000001],"size":0.2,"stages":[[0.5964,0.5542,0.198,0.2068],[0.5397,0.495,0.279,0.2914],[0.483,0.4358,0.36,0.376],[0.42,0.37,0.45,0.47],[0,0,1,1]]}],"horse":[{"id":"body-1","src":"photos/horse.webp","focus":[0.3346,0.5707],"size":0.2,"stages":[[0.2356,0.4739,0.198,0.1936],[0.2113,0.4502,0.279,0.2728],[0.187,0.4264,0.36,0.352],[0.16,0.4,0.45,0.44],[0,0,1,1]]},{"id":"body-2","src":"photos/horse.webp","focus":[0.4354,0.6693],"size":0.2,"stages":[[0.3364,0.5725,0.198,0.1936],[0.2797,0.517,0.279,0.2728],[0.223,0.4616,0.36,0.352],[0.16,0.4,0.45,0.44],[0,0,1,1]]}],"kangaroo":[{"id":"body-1","src":"photos/kangaroo.webp","focus":[0.4213,0.6068],"size":0.2,"stages":[[0.3355,0.5122,0.1716,0.1892],[0.3145,0.489,0.2418,0.2666],[0.2934,0.4658,0.312,0.344],[0.27,0.44,0.39,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/kangaroo.webp","focus":[0.5087,0.7032],"size":0.2,"stages":[[0.4229,0.6086,0.1716,0.1892],[0.3737,0.5544,0.2418,0.2666],[0.3246,0.5002,0.312,0.344],[0.27,0.44,0.39,0.43],[0,0,1,1]]}],"koala":[{"id":"body-1","src":"photos/koala.webp","focus":[0.4285,0.5997],"size":0.2,"stages":[[0.3273,0.5205,0.2024,0.1584],[0.3024,0.501,0.2852,0.2232],[0.2776,0.4816,0.368,0.288],[0.25,0.46,0.46,0.36],[0,0,1,1]]},{"id":"body-2","src":"photos/koala.webp","focus":[0.5315,0.6803],"size":0.2,"stages":[[0.4303,0.6011,0.2024,0.1584],[0.3724,0.5558,0.2852,0.2232],[0.3144,0.5104,0.368,0.288],[0.25,0.46,0.46,0.36],[0,0,1,1]]}],"lion":[{"id":"body-1","src":"photos/lion.webp","focus":[0.34299999999999997,0.6013],"size":0.2,"stages":[[0.2506,0.5155,0.1848,0.1716],[0.2279,0.4945,0.2604,0.2418],[0.2052,0.4734,0.336,0.312],[0.18,0.45,0.42,0.39],[0,0,1,1]]},{"id":"body-2","src":"photos/lion.webp","focus":[0.437,0.6887],"size":0.2,"stages":[[0.3446,0.6029,0.1848,0.1716],[0.2917,0.5537,0.2604,0.2418],[0.2388,0.5046,0.336,0.312],[0.18,0.45,0.42,0.39],[0,0,1,1]]}],"meerkat":[{"id":"body-1","src":"photos/meerkat.webp","focus":[0.428,0.5562],"size":0.2,"stages":[[0.3554,0.4506,0.1452,0.2112],[0.3376,0.4247,0.2046,0.2976],[0.3198,0.3988,0.264,0.384],[0.3,0.37,0.33,0.48],[0,0,1,1]]},{"id":"body-2","src":"photos/meerkat.webp","focus":[0.502,0.6638000000000001],"size":0.2,"stages":[[0.4294,0.5582,0.1452,0.2112],[0.3878,0.4977,0.2046,0.2976],[0.3462,0.4372,0.264,0.384],[0.3,0.37,0.33,0.48],[0,0,1,1]]}],"orangutan":[{"id":"body-1","src":"photos/orangutan.webp","focus":[0.3268,0.6207],"size":0.2,"stages":[[0.2322,0.5239,0.1892,0.1936],[0.209,0.5002,0.2666,0.2728],[0.1858,0.4764,0.344,0.352],[0.16,0.45,0.43,0.44],[0,0,1,1]]},{"id":"body-2","src":"photos/orangutan.webp","focus":[0.4232,0.7193],"size":0.2,"stages":[[0.3286,0.6225,0.1892,0.1936],[0.2744,0.567,0.2666,0.2728],[0.2202,0.5116,0.344,0.352],[0.16,0.45,0.43,0.44],[0,0,1,1]]}],"ostrich":[{"id":"body-1","src":"photos/ostrich.webp","focus":[0.3707,0.5518000000000001],"size":0.2,"stages":[[0.2739,0.4374,0.1936,0.2288],[0.2502,0.4093,0.2728,0.3224],[0.2264,0.3812,0.352,0.416],[0.2,0.35,0.44,0.52],[0,0,1,1]]},{"id":"body-2","src":"photos/ostrich.webp","focus":[0.4693,0.6681999999999999],"size":0.2,"stages":[[0.3725,0.5538,0.1936,0.2288],[0.317,0.4883,0.2728,0.3224],[0.2616,0.4228,0.352,0.416],[0.2,0.35,0.44,0.52],[0,0,1,1]]}],"otter":[{"id":"body-1","src":"photos/otter.webp","focus":[0.3168,0.5936],"size":0.2,"stages":[[0.2222,0.5122,0.1892,0.1628],[0.199,0.4922,0.2666,0.2294],[0.1758,0.4722,0.344,0.296],[0.15,0.45,0.43,0.37],[0,0,1,1]]},{"id":"body-2","src":"photos/otter.webp","focus":[0.4132,0.6764],"size":0.2,"stages":[[0.3186,0.595,0.1892,0.1628],[0.2644,0.5484,0.2666,0.2294],[0.2102,0.5018,0.344,0.296],[0.15,0.45,0.43,0.37],[0,0,1,1]]}],"owl":[{"id":"body-1","src":"photos/owl.webp","focus":[0.4436,0.5707],"size":0.2,"stages":[[0.3622,0.4739,0.1628,0.1936],[0.3422,0.4502,0.2294,0.2728],[0.3222,0.4264,0.296,0.352],[0.3,0.4,0.37,0.44],[0,0,1,1]]},{"id":"body-2","src":"photos/owl.webp","focus":[0.5264,0.6693],"size":0.2,"stages":[[0.445,0.5725,0.1628,0.1936],[0.3984,0.517,0.2294,0.2728],[0.3518,0.4616,0.296,0.352],[0.3,0.4,0.37,0.44],[0,0,1,1]]}],"panda":[{"id":"body-1","src":"photos/panda.webp","focus":[0.2952,0.5206999999999999],"size":0.2,"stages":[[0.2072,0.4239,0.176,0.1936],[0.1856,0.4002,0.248,0.2728],[0.164,0.3764,0.32,0.352],[0.14,0.35,0.4,0.44],[0,0,1,1]]},{"id":"body-2","src":"photos/panda.webp","focus":[0.38480000000000003,0.6193],"size":0.2,"stages":[[0.2968,0.5225,0.176,0.1936],[0.2464,0.467,0.248,0.2728],[0.196,0.4116,0.32,0.352],[0.14,0.35,0.4,0.44],[0,0,1,1]]}],"parrot":[{"id":"body-1","src":"photos/parrot.webp","focus":[0.42969999999999997,0.5795],"size":0.2,"stages":[[0.3505,0.4607,0.1584,0.2376],[0.331,0.4316,0.2232,0.3348],[0.3116,0.4024,0.288,0.432],[0.29,0.37,0.36,0.54],[0,0,1,1]]},{"id":"body-2","src":"photos/parrot.webp","focus":[0.5103,0.7005],"size":0.2,"stages":[[0.4311,0.5817,0.1584,0.2376],[0.3858,0.5136,0.2232,0.3348],[0.3404,0.4456,0.288,0.432],[0.29,0.37,0.36,0.54],[0,0,1,1]]}],"peacock":[{"id":"body-1","src":"photos/peacock.webp","focus":[0.2619,0.2364],"size":0.2,"stages":[[0.1871,0.1704,0.1496,0.132],[0.1688,0.1542,0.2108,0.186],[0.1504,0.138,0.272,0.24],[0.13,0.12,0.34,0.3],[0,0,1,1]]},{"id":"body-2","src":"photos/peacock.webp","focus":[0.33809999999999996,0.3036],"size":0.2,"stages":[[0.2633,0.2376,0.1496,0.132],[0.2204,0.1998,0.2108,0.186],[0.1776,0.162,0.272,0.24],[0.13,0.12,0.34,0.3],[0,0,1,1]]}],"pelican":[{"id":"body-1","src":"photos/pelican.webp","focus":[0.3385,0.5991],"size":0.2,"stages":[[0.2373,0.5089,0.2024,0.1804],[0.2124,0.4867,0.2852,0.2542],[0.1876,0.4646,0.368,0.328],[0.16,0.44,0.46,0.41],[0,0,1,1]]},{"id":"body-2","src":"photos/pelican.webp","focus":[0.4415,0.6909000000000001],"size":0.2,"stages":[[0.3403,0.6007,0.2024,0.1804],[0.2824,0.5491,0.2852,0.2542],[0.2244,0.4974,0.368,0.328],[0.16,0.44,0.46,0.41],[0,0,1,1]]}],"penguin":[{"id":"body-1","src":"photos/penguin.webp","focus":[0.4291,0.5518000000000001],"size":0.2,"stages":[[0.3389,0.4374,0.1804,0.2288],[0.3167,0.4093,0.2542,0.3224],[0.2946,0.3812,0.328,0.416],[0.27,0.35,0.41,0.52],[0,0,1,1]]},{"id":"body-2","src":"photos/penguin.webp","focus":[0.5209,0.6681999999999999],"size":0.2,"stages":[[0.4307,0.5538,0.1804,0.2288],[0.3791,0.4883,0.2542,0.3224],[0.3274,0.4228,0.328,0.416],[0.27,0.35,0.41,0.52],[0,0,1,1]]}],"pig":[{"id":"body-1","src":"photos/pig.webp","focus":[0.3168,0.5851999999999999],"size":0.2,"stages":[[0.2222,0.4972,0.1892,0.176],[0.199,0.4756,0.2666,0.248],[0.1758,0.454,0.344,0.32],[0.15,0.43,0.43,0.4],[0,0,1,1]]},{"id":"body-2","src":"photos/pig.webp","focus":[0.4132,0.6748],"size":0.2,"stages":[[0.3186,0.5868,0.1892,0.176],[0.2644,0.5364,0.2666,0.248],[0.2102,0.486,0.344,0.32],[0.15,0.43,0.43,0.4],[0,0,1,1]]}],"polar-bear":[{"id":"body-1","src":"photos/polar-bear.webp","focus":[0.5807,0.5324],"size":0.2,"stages":[[0.4839,0.429,0.1936,0.2068],[0.4602,0.4036,0.2728,0.2914],[0.4364,0.3782,0.352,0.376],[0.41,0.35,0.44,0.47],[0,0,1,1]]},{"id":"body-2","src":"photos/polar-bear.webp","focus":[0.6793,0.6376000000000001],"size":0.2,"stages":[[0.5825,0.5342,0.1936,0.2068],[0.527,0.475,0.2728,0.2914],[0.4716,0.4158,0.352,0.376],[0.41,0.35,0.44,0.47],[0,0,1,1]]}],"rabbit":[{"id":"body-1","src":"photos/rabbit.webp","focus":[0.383,0.6030000000000001],"size":0.2,"stages":[[0.2906,0.5106,0.1848,0.1848],[0.2679,0.4879,0.2604,0.2604],[0.2452,0.4652,0.336,0.336],[0.22,0.44,0.42,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/rabbit.webp","focus":[0.477,0.6970000000000001],"size":0.2,"stages":[[0.3846,0.6046,0.1848,0.1848],[0.3317,0.5517,0.2604,0.2604],[0.2788,0.4988,0.336,0.336],[0.22,0.44,0.42,0.42],[0,0,1,1]]}],"raccoon":[{"id":"body-1","src":"photos/raccoon.webp","focus":[0.6245999999999999,0.5968],"size":0.2,"stages":[[0.5256,0.5022,0.198,0.1892],[0.5013,0.479,0.279,0.2666],[0.477,0.4558,0.36,0.344],[0.45,0.43,0.45,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/raccoon.webp","focus":[0.7253999999999999,0.6932],"size":0.2,"stages":[[0.6264,0.5986,0.198,0.1892],[0.5697,0.5444,0.279,0.2666],[0.513,0.4902,0.36,0.344],[0.45,0.43,0.45,0.43],[0,0,1,1]]}],"red-panda":[{"id":"body-1","src":"photos/red-panda.webp","focus":[0.6046,0.6030000000000001],"size":0.2,"stages":[[0.5056,0.5106,0.198,0.1848],[0.4813,0.4879,0.279,0.2604],[0.457,0.4652,0.36,0.336],[0.43,0.44,0.45,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/red-panda.webp","focus":[0.7054,0.6970000000000001],"size":0.2,"stages":[[0.6064,0.6046,0.198,0.1848],[0.5497,0.5517,0.279,0.2604],[0.493,0.4988,0.36,0.336],[0.43,0.44,0.45,0.42],[0,0,1,1]]}],"rhino":[{"id":"body-1","src":"photos/rhino.webp","focus":[0.313,0.5568],"size":0.2,"stages":[[0.2206,0.4622,0.1848,0.1892],[0.1979,0.439,0.2604,0.2666],[0.1752,0.4158,0.336,0.344],[0.15,0.39,0.42,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/rhino.webp","focus":[0.407,0.6532],"size":0.2,"stages":[[0.3146,0.5586,0.1848,0.1892],[0.2617,0.5044,0.2604,0.2666],[0.2088,0.4502,0.336,0.344],[0.15,0.39,0.42,0.43],[0,0,1,1]]}],"sheep":[{"id":"body-1","src":"photos/sheep.webp","focus":[0.3185,0.5546],"size":0.2,"stages":[[0.2173,0.4556,0.2024,0.198],[0.1924,0.4313,0.2852,0.279],[0.1676,0.407,0.368,0.36],[0.14,0.38,0.46,0.45],[0,0,1,1]]},{"id":"body-2","src":"photos/sheep.webp","focus":[0.4215,0.6554],"size":0.2,"stages":[[0.3203,0.5564,0.2024,0.198],[0.2624,0.4997,0.2852,0.279],[0.2044,0.443,0.368,0.36],[0.14,0.38,0.46,0.45],[0,0,1,1]]}],"seal":[{"id":"body-1","src":"photos/seal.webp","focus":[0.5607,0.5754],"size":0.2,"stages":[[0.4639,0.527,0.1936,0.0968],[0.4402,0.5151,0.2728,0.1364],[0.4164,0.5032,0.352,0.176],[0.39,0.49,0.44,0.22],[0,0,1,1]]},{"id":"body-2","src":"photos/seal.webp","focus":[0.6593,0.6246],"size":0.2,"stages":[[0.5625,0.5762,0.1936,0.0968],[0.507,0.5485,0.2728,0.1364],[0.4516,0.5208,0.352,0.176],[0.39,0.49,0.44,0.22],[0,0,1,1]]}],"skunk":[{"id":"body-1","src":"photos/skunk.webp","focus":[0.29069999999999996,0.4318],"size":0.2,"stages":[[0.1939,0.3174,0.1936,0.2288],[0.1702,0.2893,0.2728,0.3224],[0.1464,0.2612,0.352,0.416],[0.12,0.23,0.44,0.52],[0,0,1,1]]},{"id":"body-2","src":"photos/skunk.webp","focus":[0.3893,0.5482],"size":0.2,"stages":[[0.2925,0.4338,0.1936,0.2288],[0.237,0.3683,0.2728,0.3224],[0.1816,0.3028,0.352,0.416],[0.12,0.23,0.44,0.52],[0,0,1,1]]}],"sloth":[{"id":"body-1","src":"photos/sloth.webp","focus":[0.503,0.6764000000000001],"size":0.2,"stages":[[0.4106,0.6104,0.1848,0.132],[0.3879,0.5942,0.2604,0.186],[0.3652,0.578,0.336,0.24],[0.34,0.56,0.42,0.3],[0,0,1,1]]},{"id":"body-2","src":"photos/sloth.webp","focus":[0.5970000000000001,0.7436],"size":0.2,"stages":[[0.5046,0.6776,0.1848,0.132],[0.4517,0.6398,0.2604,0.186],[0.3988,0.602,0.336,0.24],[0.34,0.56,0.42,0.3],[0,0,1,1]]}],"squirrel":[{"id":"body-1","src":"photos/squirrel.webp","focus":[0.2791,0.553],"size":0.2,"stages":[[0.1889,0.4606,0.1804,0.1848],[0.1667,0.4379,0.2542,0.2604],[0.1446,0.4152,0.328,0.336],[0.12,0.39,0.41,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/squirrel.webp","focus":[0.3709,0.647],"size":0.2,"stages":[[0.2807,0.5546,0.1804,0.1848],[0.2291,0.5017,0.2542,0.2604],[0.1774,0.4488,0.328,0.336],[0.12,0.39,0.41,0.42],[0,0,1,1]]}],"tiger":[{"id":"body-1","src":"photos/tiger.webp","focus":[0.3291,0.5568],"size":0.2,"stages":[[0.2389,0.4622,0.1804,0.1892],[0.2167,0.439,0.2542,0.2666],[0.1946,0.4158,0.328,0.344],[0.17,0.39,0.41,0.43],[0,0,1,1]]},{"id":"body-2","src":"photos/tiger.webp","focus":[0.4209,0.6532],"size":0.2,"stages":[[0.3307,0.5586,0.1804,0.1892],[0.2791,0.5044,0.2542,0.2666],[0.2274,0.4502,0.328,0.344],[0.17,0.39,0.41,0.43],[0,0,1,1]]}],"walrus":[{"id":"body-1","src":"photos/walrus.webp","focus":[0.36010000000000003,0.6854],"size":0.2,"stages":[[0.2523,0.637,0.2156,0.0968],[0.2259,0.6251,0.3038,0.1364],[0.1994,0.6132,0.392,0.176],[0.17,0.6,0.49,0.22],[0,0,1,1]]},{"id":"body-2","src":"photos/walrus.webp","focus":[0.4699,0.7346],"size":0.2,"stages":[[0.3621,0.6862,0.2156,0.0968],[0.3003,0.6585,0.3038,0.1364],[0.2386,0.6308,0.392,0.176],[0.17,0.6,0.49,0.22],[0,0,1,1]]}],"wolf":[{"id":"body-1","src":"photos/wolf.webp","focus":[0.36519999999999997,0.5930000000000001],"size":0.2,"stages":[[0.2772,0.5006,0.176,0.1848],[0.2556,0.4779,0.248,0.2604],[0.234,0.4552,0.32,0.336],[0.21,0.43,0.4,0.42],[0,0,1,1]]},{"id":"body-2","src":"photos/wolf.webp","focus":[0.4548,0.687],"size":0.2,"stages":[[0.3668,0.5946,0.176,0.1848],[0.3164,0.5417,0.248,0.2604],[0.266,0.4888,0.32,0.336],[0.21,0.43,0.4,0.42],[0,0,1,1]]}],"zebra":[{"id":"body-1","src":"photos/zebra.webp","focus":[0.5868,0.5501],"size":0.2,"stages":[[0.4922,0.4423,0.1892,0.2156],[0.469,0.4159,0.2666,0.3038],[0.4458,0.3894,0.344,0.392],[0.42,0.36,0.43,0.49],[0,0,1,1]]},{"id":"body-2","src":"photos/zebra.webp","focus":[0.6832,0.6599],"size":0.2,"stages":[[0.5886,0.5521,0.1892,0.2156],[0.5344,0.4903,0.2666,0.3038],[0.4802,0.4286,0.344,0.392],[0.42,0.36,0.43,0.49],[0,0,1,1]]}]};
const photoBirds = new Set(['penguin','flamingo','peacock','duck','chicken','owl','parrot','ostrich','pelican']);
const photoWater = new Set(['dolphin','seal','walrus','otter','beaver','hippo']);
const photoGroup = id => photoBirds.has(id)?'bird':photoWater.has(id)?'water':id==='crocodile'?'reptile':'land';
photoAnimals.forEach(q=>{
 q.variants=photoVariantData[q.id];
 q.distractors=photoAnimals.filter(other=>photoGroup(other.id)!==photoGroup(q.id)).map(other=>other.answer);
});
function shufflePhotos(items){
 const result=[...items];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
let photoVariant=null;
const photoPreloads=new Map();
function preloadNextPhoto(){
 const next=photoRound[photoIndex+1];
 if(!next)return;
 const src=next.variants[0].src;
 if(photoPreloads.has(src))return;
 const preview=new Image();preview.decoding='async';preview.fetchPriority='low';preview.src=src;
 photoPreloads.set(src,preview);
 if(photoPreloads.size>3)photoPreloads.delete(photoPreloads.keys().next().value);
}

let photoRound=[],photoIndex=0,photoScore=0,photoHints=0,photoAnswered=false,photoReady=false;
let photoToken=0;
const photoCropKey='hosu-play-photo-crops-v1';
let photoCrops={};
try{const saved=JSON.parse(localStorage.getItem(photoCropKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))photoCrops=saved;}catch(e){}
let photoFocus=[.5,.45];
const photoHistoryKey='hosu-play-photo-seen-v1';
let photoSeen=[];
try{const saved=JSON.parse(localStorage.getItem(photoHistoryKey)||'[]');if(Array.isArray(saved))photoSeen=[...new Set(saved.filter(id=>photoAnimals.some(q=>q.id===id)))];}catch(e){}
const photoEl=id=>document.getElementById(id);
function startPhotoQuiz(){
 speechSynthesis.cancel();
 const candidates=shufflePhotos(photoAnimals);
 candidates.sort((a,b)=>photoSeen.indexOf(a.id)-photoSeen.indexOf(b.id));
 const selected=candidates.slice(0,20);
 photoRound=[...shufflePhotos(selected.filter(q=>!photoSeen.includes(q.id))),...shufflePhotos(selected.filter(q=>photoSeen.includes(q.id)))];photoIndex=0;photoScore=0;
 showScreen('photoScreen');loadPhotoQuestion();
}
function loadPhotoQuestion(){
 const token=++photoToken,q=photoRound[photoIndex];
 const spots=q.variants;
 const previous=Number.isInteger(photoCrops[q.id])&&photoCrops[q.id]>=0&&photoCrops[q.id]<spots.length?photoCrops[q.id]:-1;
 const cropIndex=(previous+1)%spots.length;
 photoVariant=spots[cropIndex];photoFocus=photoVariant.focus;
 photoHints=0;photoAnswered=false;photoReady=false;
 photoEl('photoCount').innerText=`${photoIndex+1} / ${photoRound.length}`;
 photoEl('photoScore').innerText=String(photoScore);
 photoEl('photoResult').innerText='';
 photoEl('photoNext').disabled=true;
 photoEl('photoNext').innerText=photoIndex===photoRound.length-1?'결과 보기 🏆':'다음 사진 ➜';
 photoEl('photoHint').hidden=false;photoEl('photoHint').disabled=true;
 photoEl('photoRetryImage').hidden=true;
 photoEl('photoLoadStatus').innerText='사진을 불러오는 중이에요…';
 const box=photoEl('photoAnswers');box.innerHTML='';
 shufflePhotos([q.answer,...shufflePhotos(q.distractors).slice(0,3)]).forEach(name=>{
  const row=document.createElement('div');row.className='answer';
  const button=document.createElement('button');button.className='answer-name';button.innerText=name;button.disabled=true;
  button.onclick=()=>answerPhoto(name,row);
  const sound=document.createElement('button');sound.className='answer-sound';sound.innerText='🔊';sound.setAttribute('aria-label',`${name} 이름 듣기`);sound.onclick=()=>speak(name);
  row.appendChild(button);row.appendChild(sound);box.appendChild(row);
 });
 const img=photoEl('photoImage');img.fetchPriority='high';img.decoding='async';img.hidden=true;img.alt='일부만 보이는 동물 사진';
 img.onload=()=>{
  if(token!==photoToken)return;
  photoCrops[q.id]=cropIndex;
  try{localStorage.setItem(photoCropKey,JSON.stringify(photoCrops));}catch(e){}
  preloadNextPhoto();
  photoReady=true;img.hidden=false;photoEl('photoLoadStatus').innerText='';photoEl('photoHint').disabled=false;
  box.querySelectorAll('.answer-name').forEach(b=>b.disabled=false);
  photoSeen=photoSeen.filter(id=>id!==q.id);photoSeen.push(q.id);
  try{localStorage.setItem(photoHistoryKey,JSON.stringify(photoSeen));}catch(e){}
 };
 img.onerror=()=>{if(token!==photoToken)return;photoReady=false;img.hidden=true;photoEl('photoLoadStatus').innerText='사진을 불러오지 못했어요. 다시 불러와 주세요.';photoEl('photoRetryImage').hidden=false;};
 updatePhotoReveal();img.src=photoVariant.src;
}
function updatePhotoReveal(){
 const [left,top,width,height]=photoAnswered?[0,0,1,1]:photoVariant.stages[photoHints];
 photoEl('photoImage').style.clipPath=`inset(${top*100}% ${Math.max(0,1-left-width)*100}% ${Math.max(0,1-top-height)*100}% ${left*100}% round 12px)`;
 photoEl('photoStage').innerText=photoAnswered?'전체 사진 공개!':`사진 조각 ${photoHints+1} / 5`;
 photoEl('photoPoints').innerText=photoAnswered?'다음 사진도 만나볼까요?':`지금 맞히면 ⭐ ${5-photoHints}점!`;
 photoEl('photoHint').innerText=`🔍 사진 더 보기 (${4-photoHints}번 남음)`;
}
function revealPhotoHint(){
 if(!photoReady||photoAnswered||photoHints>=4)return;
 photoHints++;updatePhotoReveal();if(photoHints===4)photoEl('photoHint').hidden=true;
}
function answerPhoto(name,row){
 if(!photoReady||photoAnswered)return;
 photoAnswered=true;const q=photoRound[photoIndex],earned=5-photoHints;
 photoEl('photoAnswers').querySelectorAll('.answer').forEach(r=>{
  const b=r.querySelector('.answer-name');b.disabled=true;if(b.innerText===q.answer)r.classList.add('correct');
 });
 let message;
 if(name===q.answer){photoScore+=earned;message=`🎉 정답! ${q.answer}! +${earned}점`;}else{row.classList.add('wrong');message=`😊 정답은 ${q.answer}예요. 전체 사진을 함께 봐요!`;}
 photoEl('photoImage').alt=`${q.answer} 전체 사진`;
 photoEl('photoResult').innerText=message;photoEl('photoScore').innerText=String(photoScore);
 photoEl('photoHint').hidden=true;photoEl('photoNext').disabled=false;updatePhotoReveal();speak(name===q.answer ? `정답은 ${q.answer}, ${earned}점` : `정답은 ${q.answer}예요.`);
}
function nextPhotoQuestion(){
 if(!photoAnswered)return;
 speechSynthesis.cancel();
 if(photoIndex<photoRound.length-1){photoIndex++;loadPhotoQuestion();window.scrollTo(0,0);}else{finishPhotoQuiz();}
}
function finishPhotoQuiz(){
 ++photoToken;photoReady=false;
 showScreen('photoFinishScreen');
 const maximum=photoRound.length*5;
 photoEl('photoFinalScore').innerText=`${maximum}점 만점에 ${photoScore}점!`;
 photoEl('photoFinishMessage').innerText=photoScore===maximum?'우와! 사진 탐정이 되었어요! 🌟':'사진 속 동물들을 만났어요! 다음 동물도 찾아볼까요? 🐾';
 launchConfetti();playApplause();speak(`사진 퀴즈 끝! ${maximum}점 만점에 ${photoScore}점이에요!`);
}
