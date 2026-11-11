'use strict';
// One shared 30-dinosaur dataset drives both quiz types and the field guide.
const de = id => document.getElementById(id);
let dinosaurMode = 'hint', dinosaurRound = [], dinosaurIndex = 0;
let dinosaurScore = 0, dinosaurHints = 0, dinosaurAnswered = false, dinosaurCorrect = 0;
function shuffleDinosaurs(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let dinosaurAdvanceTimer = null, dinosaurAdvanceToken = 0;
function stopDinosaurVoice() {
  clearTimeout(dinosaurAdvanceTimer); dinosaurAdvanceTimer = null; dinosaurAdvanceToken++;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
function speakDinosaur(text) {
  if (dinosaurAnswered && de('dinosaurQuiz').classList.contains('active')) return;
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  stopDinosaurVoice();
  const voice = new SpeechSynthesisUtterance(text.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim());
  voice.lang = 'ko-KR'; voice.rate = .88;
  const korean = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('ko'));
  if (korean) voice.voice = korean;
  speechSynthesis.speak(voice);
}
function showDinosaurScreen(id) {
  stopDinosaurVoice();
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === id));
  window.scrollTo(0, 0);
  de(id).querySelector('h1').focus({ preventScroll: true });
}
function openDinosaurMenu() { showDinosaurScreen('dinosaurMenu'); }
function startDinosaurQuiz(mode) {
  dinosaurMode = mode;
  // Every round includes all 30 species without repetition. Facts alternate 15 diet / 15 period.
  dinosaurRound = shuffleDinosaurs(dinosaurAnimals).map((dino, i) => ({ dino, kind: mode === 'hint' ? 'name' : i % 2 ? 'period' : 'diet' }));
  dinosaurIndex = dinosaurScore = dinosaurCorrect = 0;
  showDinosaurScreen('dinosaurQuiz'); loadDinosaurQuestion();
}
function currentDinosaurQuestion() { return dinosaurRound[dinosaurIndex]; }
function loadDinosaurQuestion() {
  stopDinosaurVoice();
  dinosaurHints = 0; dinosaurAnswered = false;
  const { dino, kind } = currentDinosaurQuestion();
  de('quizTitle').textContent = dinosaurMode === 'hint' ? '💡 힌트로 이름 맞히기' : '🌿 시대 · 먹이 퀴즈';
  de('questionCount').textContent = (dinosaurIndex + 1) + ' / ' + dinosaurRound.length;
  de('score').textContent = dinosaurScore;
  de('roundGuide').textContent = dinosaurMode === 'hint' ? '힌트를 적게 보고 맞히면 점수가 더 높아요!' : '초식은 식물, 육식은 다른 동물을 먹어요. 잡식은 둘 다 먹어요.';
  de('question').textContent = kind === 'name' ? '🔊 나는 어떤 공룡일까요?' : kind === 'period' ? '🔊 ' + dino.answer + '는 어느 시대에 살았을까요?' : '🔊 ' + dino.answer + '의 먹이 종류는 무엇일까요?';
  de('question').setAttribute('aria-label', de('question').textContent + ' 듣기');
  de('hints').replaceChildren(); de('result').textContent = ''; de('explanation').textContent = '';
  de('hintButton').hidden = kind !== 'name'; de('hintButton').disabled = false;
  de('autoNextStatus').textContent = '';
  de('artFrame').hidden = kind === 'name';
  // Do not expose the answer through alt text before the name question is answered.
  de('quizArt').removeAttribute('src'); de('quizArt').alt = '';
  de('artCaption').textContent = '';
  if (kind !== 'name') revealDinosaurArt(dino);
  de('points').textContent = '정답을 맞히면 ⭐ 5점!';
  const options = kind === 'name'
    ? shuffleDinosaurs([dino, ...shuffleDinosaurs(dinosaurAnimals.filter(d => d.id !== dino.id)).slice(0, 3)]).map(d => ({ value: d.id, label: d.answer }))
    : shuffleDinosaurs(kind === 'period' ? ['트라이아스기', '쥐라기', '백악기'] : ['초식', '육식', '잡식']).map(value => ({ value, label: value }));
  de('answers').replaceChildren();
  for (const option of options) {
    const row = document.createElement('div'); row.className = 'answer';
    const button = document.createElement('button'); button.className = 'answer-name'; button.textContent = option.label; button.dataset.value = option.value;
    button.addEventListener('click', () => answerDinosaur(option.value));
    const voice = document.createElement('button'); voice.className = 'answer-sound'; voice.textContent = '🔊'; voice.setAttribute('aria-label', option.label + ' 듣기');
    voice.addEventListener('click', () => speakDinosaur(option.label));
    row.append(button, voice); de('answers').append(row);
  }
}
function revealDinosaurArt(dino) {
  de('quizArt').src = dino.src; de('quizArt').alt = dino.answer + ' 전신 복원 그림';
  de('artFrame').hidden = false; de('artCaption').textContent = dino.answer + ' · AI 복원 그림';
}
function showDinosaurHint() {
  if (dinosaurAnswered || dinosaurMode !== 'hint' || dinosaurHints >= 4) return;
  const text = currentDinosaurQuestion().dino.hints[dinosaurHints++];
  const button = document.createElement('button'); button.className = 'hint'; button.textContent = '🔊 힌트 ' + dinosaurHints + '. ' + text;
  button.addEventListener('click', () => speakDinosaur(text)); de('hints').append(button); speakDinosaur(text);
  de('hintButton').disabled = dinosaurHints === 4;
  de('points').textContent = '지금 맞히면 ⭐ ' + (5 - dinosaurHints) + '점!';
}
function answerDinosaur(value) {
  if (dinosaurAnswered || !dinosaurRound.length) return;
  dinosaurAnswered = true;
  const { dino, kind } = currentDinosaurQuestion(), expected = kind === 'name' ? dino.id : dino[kind];
  const correct = value === expected, points = kind === 'name' ? 5 - dinosaurHints : 5;
  if (correct) { dinosaurScore += points; dinosaurCorrect++; }
  de('answers').querySelectorAll('.answer-name').forEach(button => {
    button.disabled = true;
    if (button.dataset.value === expected) button.parentElement.classList.add('correct');
    else if (button.dataset.value === value) button.parentElement.classList.add('wrong');
  });
  de('hintButton').disabled = true; de('score').textContent = dinosaurScore;
  revealDinosaurArt(dino);
  const label = kind === 'name' ? dino.answer : expected;
  de('result').textContent = correct ? '🎉 정답! ' + label + '! +' + points + '점' : '다시 배워 봐요! 정답은 ' + label + '예요.';
  de('explanation').textContent = kind === 'name' ? dino.hints[3] : kind === 'period' ? dino.answer + '는 ' + dino.period + '에 살았어요.' : dino.answer + '는 ' + (dino.diet === '초식' ? '주로 식물을 먹는 초식 공룡이에요.' : '다른 동물을 먹는 육식 공룡이에요. 물고기를 먹는 공룡도 육식에 속해요.');
  de('autoNextStatus').textContent = dinosaurIndex === dinosaurRound.length - 1 ? '잠시 후 결과를 보여 드려요.' : '잠시 후 다음 공룡으로 넘어가요.';
  announceAndAdvanceDinosaur(correct ? '정답. ' + label + '. ' + points + '점.' : '정답은 ' + label + '예요.');
}
function announceAndAdvanceDinosaur(text) {
  stopDinosaurVoice();
  const token = dinosaurAdvanceToken;
  let finished = false;
  const advance = () => {
    if (finished || token !== dinosaurAdvanceToken) return;
    finished = true; clearTimeout(dinosaurAdvanceTimer);
    dinosaurAdvanceTimer = setTimeout(() => {
      if (token === dinosaurAdvanceToken && de('dinosaurQuiz').classList.contains('active')) nextDinosaurQuestion();
    }, 250);
  };
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    dinosaurAdvanceTimer = setTimeout(advance, 1300); return;
  }
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'ko-KR'; voice.rate = .95;
  const korean = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('ko'));
  if (korean) voice.voice = korean;
  voice.onend = advance; voice.onerror = advance;
  // Some mobile browsers never fire speech completion. Keep the quiz moving.
  dinosaurAdvanceTimer = setTimeout(advance, 9000);
  speechSynthesis.speak(voice);
}
function nextDinosaurQuestion() {
  if (!dinosaurAnswered) return;
  if (++dinosaurIndex < dinosaurRound.length) { loadDinosaurQuestion(); window.scrollTo(0, 0); de('question').focus({ preventScroll: true }); return; }
  showDinosaurScreen('dinosaurFinish');
  de('finalScore').textContent = dinosaurScore + ' / ' + dinosaurRound.length * 5 + '점';
  de('finalMessage').textContent = '공룡 30종을 모두 만났어요! ' + dinosaurRound.length + '문제 중 ' + dinosaurCorrect + '문제를 맞혔어요.';
  speakDinosaur('공룡 탐험 완성! 정말 잘했어요!');
}
function renderDinosaurGuide() {
  const entries = dinosaurAnimals.filter(d => !de('guideFilter').value || d.period === de('guideFilter').value);
  de('guideCount').textContent = entries.length + '종의 공룡'; de('guideCards').replaceChildren();
  for (const dino of entries) {
    const card = document.createElement('details'); card.className = 'dino-entry';
    const summary = document.createElement('summary'), img = document.createElement('img');
    img.src = dino.src; img.alt = dino.answer + ' 복원 그림'; img.loading = 'lazy'; img.width = img.height = 768;
    const title = document.createElement('strong'); title.textContent = dino.answer; summary.append(img, title);
    for (const text of [dino.period, dino.diet]) { const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = text; summary.append(tag); }
    const body = document.createElement('div'); body.className = 'dino-details';
    const description = document.createElement('p'); description.textContent = dino.hints.slice(2).join(' ');
    const voice = document.createElement('button'); voice.textContent = '🔊 이름과 특징 듣기'; voice.addEventListener('click', () => speakDinosaur(dino.answer + '. ' + dino.hints.join(' ')));
    const source = document.createElement('a'); source.href = dino.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; source.textContent = '자연사박물관 자료 보기 ↗';
    body.append(description, voice, document.createElement('br'), source); card.append(summary, body); de('guideCards').append(card);
  }
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => startDinosaurQuiz(button.dataset.mode)));
document.querySelectorAll('.menu-back').forEach(button => button.addEventListener('click', openDinosaurMenu));
de('question').addEventListener('click', () => speakDinosaur(de('question').textContent));
de('hintButton').addEventListener('click', showDinosaurHint);

de('retry').addEventListener('click', () => startDinosaurQuiz(dinosaurMode));
de('openGuide').addEventListener('click', () => { renderDinosaurGuide(); showDinosaurScreen('dinosaurGuide'); });
de('guideFilter').addEventListener('change', renderDinosaurGuide);
de('quizArt').addEventListener('error', () => { de('artCaption').textContent = '그림을 불러오지 못했어요. 퀴즈는 계속 풀 수 있어요.'; });
window.addEventListener('pagehide', stopDinosaurVoice);
