/* 한글놀이터 소리 재생기
 * 1) /hangul-test/audio/ 에 실제로 있는 녹음(.wav)만 재생한다.
 * 2) 녹음이 없는 글자는 클릭한 그 자리에서 곧바로(동기적으로) 한국어 TTS로 읽는다.
 *    iOS 사파리는 사용자 제스처 안에서 시작한 speak()만 들려주기 때문에,
 *    없는 파일을 Audio로 눌렀다가 404를 받고 나서 TTS를 부르면 소리가 나지 않는다.
 */
(() => {
  'use strict';

  // `ls /hangul-test/audio` 기준 실제 파일 23개
  const KNOWN_WAVS = new Set([
    'ac00.wav',
    'ac00-bc29.wav',
    'b098.wav',
    'b098-bb34.wav',
    'b098-be44.wav',
    'b178.wav',
    'b204.wav',
    'b204-b098.wav',
    'b9c8.wav',
    'b9c8-cc28.wav',
    'baa8.wav',
    'baa8-c790.wav',
    'bb34.wav',
    'bbf8.wav',
    'bbf8-c18c.wav',
    'bc14.wav',
    'bc14-b098-b098.wav',
    'c0ac.wav',
    'c0ac-acfc.wav',
    'c544.wav',
    'c624.wav',
    'c6b0.wav',
    'c774.wav'
  ]);

  const FAIL = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 주세요.';
  const pool = new Map(); // 파일명 -> Audio (미리 만들어 두고 바로 재생)
  let generation = 0;
  let lastGesture = 0;
  let koVoice = null;
  let voiceReady = false;
  let lastUtter = null;

  /* ── 사용자 제스처 시각 기록 (오류 문구를 조용한 자동재생에서는 띄우지 않기 위해) ── */
  ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(type => {
    document.addEventListener(type, () => { lastGesture = performance.now(); }, { capture: true, passive: true });
  });
  const inGesture = () => performance.now() - lastGesture < 1200;

  /* ── 한국어 음성 고르기 ── */
  function pickVoice() {
    if (voiceReady) return koVoice;
    try {
      const list = speechSynthesis.getVoices() || [];
      if (!list.length) return null; // 아직 목록이 안 왔으면 다음 기회에
      voiceReady = true;
      koVoice = list.find(v => /^ko([-_]|$)/i.test(v.lang))
        || list.find(v => /korean|한국어|한국/i.test(v.name || ''))
        || null;
    } catch (e) { voiceReady = true; }
    return koVoice;
  }
  try {
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.addEventListener) {
      speechSynthesis.addEventListener('voiceschanged', () => { voiceReady = false; pickVoice(); });
    }
  } catch (e) {}

  /* ── 동기 TTS ── */
  function say(text, status) {
    let started = false;
    try {
      if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
        throw new Error('no-tts');
      }
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = 0.85;
      utter.pitch = 1;
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      utter.onerror = event => {
        const why = event && event.error;
        if (why === 'interrupted' || why === 'canceled') return;
        if (status && inGesture()) status.textContent = FAIL;
      };
      lastUtter = utter; // GC로 사라지지 않게 붙잡아 둔다
      speechSynthesis.speak(utter);
      started = true;
    } catch (e) {
      started = false;
    }
    if (!started && status && inGesture()) status.textContent = FAIL;
  }

  /* ── 글자 → 파일명 (유니코드 코드포인트, 예: 나비 → b098-bcf4.wav) ── */
  function wavName(word) {
    let name = '';
    for (const ch of word) name += (name ? '-' : '') + ch.codePointAt(0).toString(16);
    return name + '.wav';
  }

  function element(name) {
    let audio = pool.get(name);
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.src = '/hangul-test/audio/' + name;
      pool.set(name, audio);
    }
    return audio;
  }

  /* ── 미리 받아 두기 (첫 재생이 늦지 않게) ── */
  function preload() {
    KNOWN_WAVS.forEach(name => {
      try { element(name); } catch (e) {}
    });
  }
  if (document.readyState === 'complete') preload();
  else window.addEventListener('load', () => {
    const start = () => { try { preload(); } catch (e) {} };
    if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 800);
  });

  /* ── 공개 API ── */
  window.playHangul = function (word, status) {
    if (!word) return;
    const text = String(word);
    const current = ++generation;

    try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); } catch (e) {}
    pool.forEach(audio => { try { audio.pause(); } catch (e) {} });

    const name = wavName(text);
    if (!KNOWN_WAVS.has(name)) {
      // 녹음이 없으면 곧바로 TTS (제스처를 잃지 않게 동기로!)
      say(text, status);
      return;
    }

    let audio;
    try { audio = element(name); } catch (e) { say(text, status); return; }

    // 아직 재생할 만큼 받아지지 않았으면 기다리지 않고 바로 TTS로 들려준다
    if (audio.readyState < 3) {
      say(text, status);
      try { audio.load(); } catch (e) {}
      return;
    }

    audio.onerror = () => {
      if (current !== generation) return;
      say(text, status);
    };
    try { audio.currentTime = 0; } catch (e) {}
    let played;
    try { played = audio.play(); } catch (e) { say(text, status); return; }
    if (played && typeof played.catch === 'function') {
      played.catch(err => {
        if (current !== generation) return;
        if (err && err.name === 'AbortError') return;
        say(text, status);
      });
    }
  };

  window.addEventListener('pagehide', () => {
    pool.forEach(audio => { try { audio.pause(); } catch (e) {} });
    try { speechSynthesis.cancel(); } catch (e) {}
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { try { speechSynthesis.cancel(); } catch (e) {} }
  });
})();
