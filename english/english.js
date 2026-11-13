(() => {
  const letters = [...'abcdefghijklmnopqrstuvwxyz'];
  const examples = 'apple bat cat dog egg fan goat hat igloo jam kite leg map net octopus pig queen red sun top up van web box yes zip'.split(' ');
  const phonemes = 'æ b k d ɛ f ɡ h ɪ dʒ k l m n ɑ p kw ɹ s t ʌ v w ks j z'.split(' ');
  const rounds = [
    ['cat', 'bat', 'cap'], ['bed', 'red', 'leg'], ['sit', 'bit', 'lid'],
    ['dog', 'log', 'cot'], ['cup', 'cut', 'bug'], ['map', 'mat', 'cap'],
    ['pen', 'pet', 'peg'], ['pin', 'pan', 'bin'], ['sun', 'bun', 'bus'],
    ['pot', 'hop', 'hot'], ['van', 'can', 'pan'], ['net', 'wet', 'pet'],
  ];
  const titles = {alphabet: '알파벳 놀이', phonics: '파닉스 소리', listen: '소리 찾기', blend: '소리 합치기'};
  const byId = id => document.getElementById(id);
  const menu = byId('menu');
  const lesson = byId('lesson');
  const activity = byId('activity');
  const feedback = byId('feedback');
  const audioError = byId('audio-error');
  const player = new Audio();
  let playback = 0;
  let mode;
  let selected = 'a';
  let quizKind = 'sound';
  let target;
  let choices;
  let round = 0;
  let solved = false;
  let owner;
  const progress = {alphabet:new Set(), phonics:new Set(), listen:new Set(), blend:new Set()};

  function studyStep(value) {
    const active = window.HosuStudy?.active();
    if (owner !== active) {
      owner = active;
      Object.values(progress).forEach(set => set.clear());
    }
    const set = progress[mode];
    set.add(value);
    if (set.size < 5) return false;
    set.clear();
    return window.HosuStudy?.award('english');
  }

  function stopAudio() {
    playback++;
    player.pause();
    audioError.textContent = '';
  }

  function play(key) {
    stopAudio();
    const current = playback;
    player.src = 'audio/' + key + '.wav';
    player.play().catch(() => {
      if (current === playback) audioError.textContent = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 보세요.';
    });
  }

  function shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function newQuestion() {
    solved = false;
    if (mode === 'listen') {
      target = shuffle(letters.filter(letter => letter !== target))[0];
      const sound = letter => phonemes[letters.indexOf(letter)];
      const distractors = letters.filter(letter => letter !== target
        && (quizKind === 'name' || sound(letter) !== sound(target)));
      const options = [];
      for (const letter of shuffle(distractors)) {
        if (quizKind === 'name' || options.every(option => sound(letter) !== sound(option))) options.push(letter);
        if (options.length === 2) break;
      }
      choices = shuffle([target, ...options]);
    } else {
      [target] = rounds[round];
      choices = shuffle(rounds[round]);
    }
  }

  function renderLetters() {
    const isPhonics = mode === 'phonics';
    activity.innerHTML = `
      <p>${isPhonics ? '글자를 눌러 단어 속에서 나는 대표 소리를 들어요.' : '대문자와 소문자를 짝지어 보고 글자의 이름을 들어요.'}</p>
      <div class="letters">${letters.map(letter => `<button type="button" lang="en" data-letter="${letter}" aria-pressed="${letter === selected}">${letter.toUpperCase()} ${letter}</button>`).join('')}</div>
      <div class="example"></div>`;
    showLetter();
  }

  function showLetter() {
    const index = letters.indexOf(selected);
    const word = examples[index];
    const note = selected === 'x' ? 'box의 끝소리' : selected === 'q' ? 'queen에서 qu가 내는 소리' : word + '의 첫소리';
    activity.querySelectorAll('[data-letter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.letter === selected));
    });
    activity.querySelector('.example').innerHTML = `
      <strong lang="en">${selected.toUpperCase()} ${selected}</strong>
      ${mode === 'phonics' ? `<p>/${phonemes[index]}/ · ${note}</p>` : ''}
      <div class="toolbar">
        <button data-audio="name-${selected}">🔊 글자 이름</button>
        <button data-audio="sound-${selected}">🔊 글자 소리</button>
        <button data-audio="${word}">🔊 예시 단어 <span lang="en">${word}</span></button>
      </div>`;
  }

  function renderQuestion() {
    const listen = mode === 'listen';
    const question = listen ? `
      <div class="toolbar" aria-label="문제 종류">
        <button data-kind="sound" aria-pressed="${quizKind === 'sound'}">글자 소리 찾기</button>
        <button data-kind="name" aria-pressed="${quizKind === 'name'}">글자 이름 찾기</button>
      </div>
      <p>문제를 듣고 알맞은 글자를 골라요. 각 보기의 소리도 들을 수 있어요.</p>
      <button data-audio="${quizKind}-${target}">🔊 문제 듣기</button>` : `
      <p>왼쪽부터 소리를 듣고, 이어 읽은 단어를 골라요.</p>
      <div class="pieces">${[...target].map((letter, index) => `<button data-audio="sound-${letter}" aria-label="${index + 1}번째 소리 ${letter}"><span lang="en">${letter}</span> 🔊</button>`).join('')}</div>
      <button data-audio="${target}" id="whole-word" hidden>🔊 합친 단어 듣기</button>`;
    activity.innerHTML = `${question}
      <div class="choices" aria-label="보기">${choices.map(choice => `
        <div>
          <button data-answer="${choice}" lang="en">${listen ? choice.toUpperCase() + ' ' + choice : choice}</button>
          <button data-audio="${listen ? quizKind + '-' : ''}${choice}" aria-label="${choice} 보기 듣기">🔊 듣기</button>
        </div>`).join('')}</div>
      <button data-next>다음 문제 →</button>`;
  }

  function navigate() {
    stopAudio();
    feedback.textContent = '';
    const hash = location.hash.slice(1);
    mode = Object.hasOwn(titles, hash) ? hash : undefined;
    menu.hidden = !!mode;
    lesson.hidden = !mode;
    if (!mode) return;
    byId('lesson-title').textContent = titles[mode];
    if (mode === 'alphabet' || mode === 'phonics') renderLetters();
    else {
      newQuestion();
      renderQuestion();
    }
    byId('lesson-title').focus();
  }

  activity.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const {audio, letter, kind, answer} = button.dataset;
    if (audio) play(audio);
    if (letter) {
      selected = letter;
      showLetter();
      play((mode === 'alphabet' ? 'name-' : 'sound-') + letter);
      feedback.textContent = studyStep(letter) ? '다섯 글자를 들었어요! ⭐ 별 하나' : '';
    }
    if (kind || button.hasAttribute('data-next')) {
      stopAudio();
      if (kind) quizKind = kind;
      if (mode === 'blend') round = (round + 1) % rounds.length;
      newQuestion();
      renderQuestion();
      feedback.textContent = '';
      activity.querySelector('button').focus();
    }
    if (answer && !solved) {
      if (answer !== target) {
        feedback.textContent = '한 번 더 들어 보고 골라요!';
        return;
      }
      solved = true;
      feedback.textContent = '정답! ' + (mode === 'listen' ? target.toUpperCase() : target);
      if (studyStep(target)) feedback.textContent += ' · ⭐ 별 하나!';
      const wordButton = byId('whole-word');
      if (wordButton) {
        wordButton.hidden = false;
        play(target);
      }
    }
  });

  window.addEventListener('hashchange', navigate);
  window.addEventListener('pagehide', stopAudio);
  navigate();
})();
