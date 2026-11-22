# 체험판(v22) 음원 출처 / Audio credits

`english-preview/audio/`의 파일은 아래 출처로만 만들었습니다. 상용 파닉스 교재 음원을 복제한 것은 없습니다.
All files in this folder were produced from the sources below; no commercial phonics recordings were copied.

## 1. 단일 글자 음가 `sound-a.wav` ~ `sound-z.wav`

- 출처: **Open Letter Sounds** — https://github.com/purplecomputerorg/openlettersounds
  (`sounds/en-us/marin/`)
- 라이선스: **CC0 1.0** (해당 폴더의 `sounds/LICENSE` 전문 확인, 저작권 표기 불필요)
- 제작: Purple Computer, OpenAI `gpt-audio-1.5` voice `marin`, 사람이 최종 선별(`reviewed: true`)
- 가공: 앞뒤 무음 정리, -20 dBFS RMS / 피크 -1.5 dBFS 이하로 음량 평준화, 24 kHz mono 16-bit PCM
- `sound-ck, sound-ph, sound-wh, sound-qu`는 같은 소리인 CC0 `k, f, w, q` 음가를 사용합니다.

## 2. 조합 음가 `sound-ee, sound-oo, sound-ai, sound-oa`, 단어, 동물 문장

- 엔진: **Kokoro-82M** (`kokoro-onnx` 런타임) — 모델 Apache-2.0, 런타임 MIT
  모델: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
- 목소리: `af_heart` (미국 영어 여성)
- 파일
  - `sound-ee, sound-oo, sound-ai, sound-oa`: 미국 영어 IPA(`iː`, `uː`, `eɪ`, `oʊ`)를 직접 입력해 합성
  - `sound-sh, sound-ch`: `ship`, `chip` 합성음에서 유성 시작 전까지의 마찰 구간을 잘라 사용
  - `sound-th`(v22): `thin` 합성음의 첫 무성 마찰 구간(θ)만 잘라 내고, 잡음 구간을 등파워 크로스페이드로 반복해 0.32초로 만듦
  - 단어 28개 (`cat … duck`): 단어를 그대로 합성
  - `animal-*`: `I can jump!` 형태의 문장 합성

## 3. 글자 이름 `name-a` ~ `name-z`, 조합 음가 `sound-ng` (v22)

- 엔진: **Piper** (`piper-tts`, GPL-3.0 런타임) + 음성 **en_US-hfc_female-medium**
  - 모델·설정: https://huggingface.co/rhasspy/piper-voices (`en/en_US/hfc_female/medium/`)
  - 라이선스: Piper 음성은 rhasspy/piper-voices 저장소 배포 조건을 따르며, 이 앱은 개인용으로 음성을 재배포하지 않고 합성 결과 파일만 사용합니다.
- 방식: 글자 이름을 철자가 아니라 **미국 영어 IPA로 직접 지정**해 합성했습니다
  (`a = ˈeɪ`, `b = ˈbiː`, `g = ˈdʒiː`, `z = ˈziː` …). v21에서처럼 `ay, bee, ee, gee` 같은 철자를 읽히면 `ay`가 /aɪ/로, 홀로 놓인 장모음이 끝에서 흐려져 "아이·비에·즁에"처럼 들렸기 때문입니다.
- `sound-ng`: 낱개 음소 `ŋː`를 그대로 합성했습니다(단어를 잘라 늘리던 v21 방식은 기계적인 버징이 생겼습니다).
- 가공: 앞뒤 무음 정리, -20 dBFS RMS / 피크 -1.5 dBFS 이하로 음량 평준화, 24 kHz mono 16-bit PCM

## 라이선스 판단에서 제외한 후보

- `vocamax/ipa-audios`: 저장소에 라이선스 파일이 없고(LICENSE 없음) 출처·화자 정보가 확인되지 않아 사용하지 않았습니다.
- `purplecomputerorg/openlettersounds`: 조합 음가(2글자) 파일은 제공하지 않습니다(단일 글자 26개 + 대안 테이크만 존재).
- 그 밖에 이전 검토에서 언급된 유료·출처 불명 음원, 상용 교재 음원은 사용하지 않았습니다.
