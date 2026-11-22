# 체험판(v23) 음원 출처 / Audio credits

`english-preview/audio/`에는 **사람이 녹음한 단일 글자 음가 30개**만 남아 있습니다.
기계 합성(Piper·Kokoro)으로 만들었던 글자 이름·단어·동물 문장·조합 음가 파일은 v23에서 모두 지웠습니다.

## 1. 단일 글자 음가 `sound-a.wav` ~ `sound-z.wav`, `sound-ck/ph/wh/qu.wav`

- 출처: **Open Letter Sounds** — https://github.com/purplecomputerorg/openlettersounds (`sounds/en-us/marin/`)
- 라이선스: **CC0 1.0**
- 제작: Purple Computer, OpenAI `gpt-audio-1.5` voice `marin`, 사람이 최종 선별(`reviewed: true`)
- 가공: 앞뒤 무음 정리, -20 dBFS RMS / 피크 -1.5 dBFS 이하 음량 평준화, 24 kHz mono 16-bit PCM
- `sound-ck, sound-ph, sound-wh, sound-qu`는 같은 소리인 CC0 `k, f, w, q` 음가를 씁니다.
- 파일 내용은 v22와 같습니다(다시 만들지 않았습니다).

## 2. 글자 이름·단어·동물 문장·조합 음가 — 기기 내장 음성

- 아이폰/브라우저가 가진 **미국 영어 음성**(`window.speechSynthesis`, `lang='en-US'`)으로 재생합니다. 음원 파일이 없습니다.
- 글자 이름: `ay, bee, see, dee, ee, eff …`처럼 이름을 철자로 넣어 읽힙니다(한 글자 `a`를 그냥 넣으면 대부분의 음성이 단어처럼 읽습니다).
- 단어 28개, 동물 문장 6개(`I can jump!` 등): 그대로 읽힙니다.
- 조합 음가 `sh ch th ng ee oo ai oa`: 해당 음가만 따로 녹음한 사람 음원이 없어 **대표 단어**(ship, chip, thin, sing, see, moon, rain, boat)를 읽어 줍니다.

## 3. 조합 음가 사람 녹음 — 확인했지만 쓰지 않은 이유

Wikimedia Commons의 표준 IPA 발음 표본은 실제 화자 녹음이지만 라이선스가 **CC BY-SA 3.0**(Peter Isotalo)이라 이번 조건(CC0/Public Domain만)에 맞지 않아 넣지 않았습니다.

- `File:Voiceless palato-alveolar sibilant.ogg` (ʃ) — CC BY-SA 3.0
- `File:Voiceless palato-alveolar affricate.ogg` (tʃ) — CC BY-SA 3.0
- `File:Voiceless dental fricative.ogg` (θ) — CC BY-SA 3.0
- `File:Velar nasal.ogg` (ŋ) — CC BY-SA 3.0

CC0 음소 표본도 Commons에 있으나(예: `File:Voiceless labio-dental fricative.ogg`), 영어 파닉스에 필요한 ʃ·tʃ·θ·ŋ·iː·uː·eɪ·oʊ 음가의 CC0 사람 녹음은 확인하지 못했습니다. Lingua Libre 녹음은 대부분 CC BY-SA 4.0입니다.

## 4. v23에서 지운 파일

- `name-a` ~ `name-z` (Piper / LJSpeech 합성)
- `sound-ng`, `sound-th`, `sound-sh`, `sound-ch` (합성·절단)
- `sound-ee`, `sound-oo`, `sound-ai`, `sound-oa` (Kokoro IPA 합성)
- 단어 28개 (`cat` ~ `duck`), 동물 문장 6개 (`animal-*`) — Kokoro 합성
