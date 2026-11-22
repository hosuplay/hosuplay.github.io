# 체험판(v21) 음원 출처 / Audio credits

`english-preview/audio/`의 파일은 아래 두 출처로만 만들었습니다. 상용 파닉스 교재 음원을 복제한 것은 없습니다.
All files in this folder were produced from the two sources below; no commercial phonics recordings were copied.

## 1. 단일 글자 음가 `sound-a.wav` ~ `sound-z.wav`

- 출처: **Open Letter Sounds** — https://github.com/purplecomputerorg/openlettersounds
  (`sounds/en-us/marin/`)
- 라이선스: **CC0 1.0** (해당 폴더의 `sounds/LICENSE` 전문 확인, 저작권 표기 불필요)
- 제작: Purple Computer, OpenAI `gpt-audio-1.5` voice `marin`, 사람이 최종 선별(`reviewed: true`)
- 가공: 앞뒤 무음 정리, -20 dBFS RMS / 피크 -1.5 dBFS 이하로 음량 평준화, 24 kHz mono 16-bit PCM

## 2. 조합 음가·단어·글자 이름·문장

- 엔진: **Kokoro-82M** (`kokoro-onnx` 런타임) — 모델 Apache-2.0, 런타임 MIT
  모델: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
- 목소리: `af_heart` (미국 영어 여성)
- 파일
  - `sound-ee, sound-oo, sound-ai, sound-oa`: 미국 영어 IPA(`iː`, `uː`, `eɪ`, `oʊ`)를 직접 입력해 합성
  - `sound-sh, sound-ch`: `ship`, `chip` 합성음에서 유성 시작 전까지의 마찰 구간을 잘라 사용
  - `sound-ng`: `sing` 합성음의 끝 비음 구간을 잘라 사용
  - `sound-th`: `θ` 음가를 직접 입력해 합성
  - `sound-ck, sound-ph, sound-wh, sound-qu`: CC0 `k, f, w, q` 음가를 사용(같은 소리이므로 파일만 복제)
  - `cat … red`, `ship … queen`: 단어 합성
  - `name-a … name-z`: 글자 이름을 소리 나는 대로 적어 합성(`ay, bee, see …`)
  - `animal-*`: `I can jump!` 형태의 문장 합성
- 가공: 앞뒤 무음 정리, 음량 평준화(위와 동일), 짧은 마찰음·비음은 피치를 바꾸지 않는 overlap-add로 길이 보정

## 라이선스 판단에서 제외한 후보

- `vocamax/ipa-audios`: 저장소에 라이선스 파일이 없고(LICENSE 없음) 출처·화자 정보가 확인되지 않아 사용하지 않았습니다.
- `purplecomputerorg/openlettersounds`: 조합 음가(2글자) 파일은 제공하지 않습니다(단일 글자 26개 + 대안 테이크만 존재).
- 그 밖에 이전 검토에서 언급된 유료·출처 불명 음원, 상용 교재 음원은 사용하지 않았습니다.
