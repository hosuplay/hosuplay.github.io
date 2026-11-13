(() => {
  const player = new Audio();
  let generation = 0;
  window.playHangul = (word, status) => {
    const current = ++generation;
    player.pause();
    player.src = '/hangul-test/audio/' + [...word].map(letter => letter.codePointAt(0).toString(16)).join('-') + '.wav';
    player.play().catch(() => {
      if (current === generation && status) status.textContent = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 주세요.';
    });
  };
  window.addEventListener('pagehide', () => player.pause());
})();
