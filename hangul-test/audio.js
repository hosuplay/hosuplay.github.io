/* 한글놀이터 소리 재생기 · v3 (2026-11-26)
 * 1) /hangul-test/audio/ 에 실제 녹음(.wav)이 있으면 그 녹음을 재생하고, 없을 때만 한국어 TTS로 읽는다.
 * 2) 한 번에 한 소리만 난다. 새 소리를 내기 전에 이전 오디오·TTS·(예약된 재생)을 즉시 정리한다.
 * 3) playHangul()은 재생이 실제로 끝나면 'ended', 다른 소리에 밀리면 'cancelled',
 *    재생 자체가 실패하면 'error'로 resolve되는 Promise를 돌려준다.
 *    → '정답 뒤 다음 문제로' 이동을 고정 타이머가 아니라 실제 재생 종료로 처리할 수 있다.
 * 4) 음량: 모든 녹음은 -18.5dB RMS / 피크 -1.5dB로 맞춰 두었고, 재생 볼륨은 1.0으로 고정한다.
 *    (예전에는 첫 터치에서 아직 버퍼가 덜 차면 TTS로 대신 읽어서 첫 소리만 음량·음색이 달랐다)
 * 5) 첫 터치에서 오디오 컨텍스트·TTS를 미리 깨워, iOS Safari 첫 소리가 작거나 씹히지 않게 한다.
 */
(function () {
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
  const VOLUME = 1;

  const pool = new Map(); // 파일명 -> Audio (미리 만들어 두고 바로 재생)
  let token = 0;          // 지금 살아 있는 재생 번호
  let current = null;     // { cancel() } 지금 재생 중인 소리
  let koVoice = null;
  let voiceReady = false;
  let lastUtter = null;
  let warmUtter = null;
  let unlocked = false;
  let lastCancelAt = 0;
  let lastGesture = 0;

  /* ── 사용자 제스처 시각 기록 (오류 문구를 조용한 자동재생에서는 띄우지 않기 위해) ── */
  function inGesture() {
    return performance.now() - lastGesture < 1200;
  }

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

  /* ── 첫 터치 워밍업: ios 사파리에서 첫 소리가 작거나 씹히는 것 방지 ── */
  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        if (ctx.resume) ctx.resume();
        setTimeout(() => { try { ctx.close(); } catch (e) {} }, 700);
      }
    } catch (e) {}
    try {
      if (typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined') {
        const warm = new SpeechSynthesisUtterance(' ');
        warm.lang = 'ko-KR';
        warm.volume = 0;
        warm.rate = 1;
        warmUtter = warm; // GC로 사라지지 않게
        speechSynthesis.speak(warm);
      }
    } catch (e) {}
    pickVoice();
  }

  ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(type => {
    document.addEventListener(type, () => {
      lastGesture = performance.now();
      unlockAudio();
    }, { capture: true, passive: true });
  });

  /* ── 지금 나는 소리 정리 (다음 소리 전에 반드시) ── */
  function stopCurrent() {
    const prev = current;
    current = null;
    if (prev) { try { prev.cancel(); } catch (e) {} }

    let speaking = false;
    try {
      speaking = !!(window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending));
    } catch (e) {}
    if (speaking) {
      try { speechSynthesis.cancel(); } catch (e) {}
      lastCancelAt = performance.now();
    }
    pool.forEach(audio => { try { if (!audio.paused) audio.pause(); } catch (e) {} });
  }

  /* ── TTS (녹음이 없는 글자) ── */
  function speakTTS(text, status, myToken) {
    return new Promise(resolve => {
      let finished = false;
      let watchdog = 0;
      let me = null;

      function finish(how) {
        if (finished) return;
        finished = true;
        if (watchdog) clearTimeout(watchdog);
        if (me && current === me) current = null;
        resolve(myToken === token ? how : 'cancelled');
      }

      function start() {
        if (myToken !== token) { finish('cancelled'); return; }
        try {
          if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
            throw new Error('no-tts');
          }
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = 'ko-KR';
          utter.rate = 0.9;
          utter.pitch = 1;
          utter.volume = VOLUME;
          const voice = pickVoice();
          if (voice) utter.voice = voice;
          utter.onend = () => finish('ended');
          utter.onerror = event => {
            const why = event && event.error;
            if (why === 'interrupted' || why === 'canceled' || why === 'cancelled') { finish('cancelled'); return; }
            if (status && inGesture()) status.textContent = FAIL;
            finish('error');
          };
          lastUtter = utter; // GC로 사라지지 않게 붙잡아 둔다
          me = { cancel: () => { finish('cancelled'); try { speechSynthesis.cancel(); } catch (e) {} } };
          current = me;
          speechSynthesis.speak(utter);
          // onend가 오지 않는 브라우저에서도 next 문제로 넘어갈 수 있게 하는 안전장치
          watchdog = setTimeout(() => finish('ended'), Math.max(1500, text.length * 520) + 1600);
        } catch (e) {
          if (status && inGesture()) status.textContent = FAIL;
          finish('error');
        }
      }

      // iOS 사파리는 cancel() 직후 speak()를 부르면 발화를 통째로 무시할 때가 있어 잠깐 쉬었다 부른다
      if (performance.now() - lastCancelAt < 220) setTimeout(start, 55);
      else start();
    });
  }

  /* ── 글자 → 파일명 (유니코드 코드포인트, 예: 나비 → b098-be44.wav) ── */
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
      audio.volume = VOLUME;
      audio.src = '/hangul-test/audio/' + name + '?v=3'; // 녹음 음량을 새로 맞췄으므로 예전 캐시를 쓰지 않게
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

  /* ── 녹음 재생 ── */
  function playClip(name, text, status, myToken) {
    return new Promise(resolve => {
      let audio;
      try { audio = element(name); } catch (e) {
        speakTTS(text, status, myToken).then(resolve);
        return;
      }

      let finished = false;
      let watchdog = 0;
      let me = null;

      function cleanup() {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        if (watchdog) clearTimeout(watchdog);
        watchdog = 0;
        if (me && current === me) current = null;
      }
      function finish(how) {
        if (finished) return;
        finished = true;
        cleanup();
        resolve(myToken === token ? how : 'cancelled');
      }
      function onEnded() { finish('ended'); }
      function onError() {
        if (finished) return;
        finished = true;
        cleanup();
        if (myToken !== token) { resolve('cancelled'); return; }
        // 녹음을 못 틀면 그 자리에서 TTS로 읽어 준다 (제스처 안이면 소리가 난다)
        speakTTS(text, status, myToken).then(resolve);
      }

      me = {
        cancel: () => { finish('cancelled'); try { audio.pause(); } catch (e) {} }
      };
      current = me;
      audio.volume = VOLUME;
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      try { audio.currentTime = 0; } catch (e) {}

      let played;
      try { played = audio.play(); } catch (e) { onError(); return; }
      if (played && typeof played.catch === 'function') {
        played.catch(err => {
          if (finished) return;               // 우리가 pause()해서 난 AbortError 등
          if (err && err.name === 'AbortError') return;
          onError();
        });
      }
      // ended가 오지 않는 경우(브라우저 버그) 대비 안전장치
      const dur = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration * 1000 : 4000;
      watchdog = setTimeout(() => {
        if (!finished && audio.ended) finish('ended');
      }, dur + 1500);
    });
  }

  /* ── 공개 API ──
   * playHangul(단어, 상태표시요소) → Promise<'ended'|'cancelled'|'error'>
   */
  window.playHangul = function (word, status) {
    const text = word == null ? '' : String(word).trim();
    const myToken = ++token;

    stopCurrent(); // 이전 소리·TTS 즉시 정리 (겹침 방지)

    if (!text) return Promise.resolve('cancelled');

    const name = wavName(text);
    if (!KNOWN_WAVS.has(name)) {
      // 녹음이 없으면 곧바로 동기 TTS (제스처를 잃지 않게)
      return speakTTS(text, status, myToken);
    }
    return playClip(name, text, status, myToken);
  };

  // 다른 곳에서 '지금 나는 소리'만 멈추고 싶을 때
  window.stopHangul = function () {
    token++;
    stopCurrent();
  };

  window.addEventListener('pagehide', () => {
    token++;
    stopCurrent();
    try { speechSynthesis.cancel(); } catch (e) {}
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      token++;
      stopCurrent();
      try { speechSynthesis.cancel(); } catch (e) {}
    }
  });
})();
