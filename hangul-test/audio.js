(() => {
  const player = new Audio();
  let generation = 0;
  window.playHangul = (word, status) => {
    const current = ++generation;
    player.pause();
    player.src = '/hangul-test/audio/' + [...word].map(letter => letter.codePointAt(0).toString(16)).join('-') + '.wav';
    player.onerror = () => {
      if (current !== generation) return;
      try {
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = 'ko-KR';
        utter.rate = .8;
        speechSynthesis.speak(utter);
      } catch (e) {
        if (status) status.textContent = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 주세요.';
      }
    };
    player.play().catch(() => {
      if (current === generation && status) status.textContent = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 주세요.';
    });
  };
  window.addEventListener('pagehide', () => {
    player.pause();
    try { speechSynthesis.cancel(); } catch (e) {}
  });
})();
