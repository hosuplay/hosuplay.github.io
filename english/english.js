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
  const wordPictures = {
    cat: '🐱', bat: '🦇', cap: '🧢', bed: '🛏️', red: '🔴', leg: '🦵',
    sit: '🪑', bit: '🍪', lid: '🥫', dog: '🐶', log: '🪵', cot: '🛌',
    cup: '🥤', cut: '✂️', bug: '🐛', map: '🗺️', mat: '🧺', pen: '🖊️',
    pet: '🐹', peg: '📌', pin: '📍', pan: '🍳', bin: '🗑️', sun: '☀️',
    bun: '🥐', bus: '🚌', pot: '🍲', hop: '🐰', hot: '🔥', van: '🚐',
    net: '🥅', wet: '💧',
  };
  const titles = {alphabet: '알파벳 놀이', phonics: '파닉스 소리', listen: '소리 찾기', blend: '소리 합치기', howmany: '🍎 How Many? 사과 세기', todo: '🐸 What Can You Do?'};
  const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const tensWords = ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'one hundred'];
  const hundredsWords = ['one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred',
    'six hundred', 'seven hundred', 'eight hundred', 'nine hundred', 'one thousand'];
  const appleCards = {1: {max: 10, step: 1}, 2: {max: 20, step: 1}, 10: {max: 100, step: 10}, 100: {max: 1000, step: 100}};
  const levelLabels = {1: '1~10', 2: '1~20', 10: '10씩', 100: '100씩'};
  const actions = [['frog', '🐸', 'jump'], ['dog', '🐶', 'run'], ['duck', '🦆', 'swim'], ['bird', '🐦', 'fly'], ['pig', '🐷', 'dance'], ['bug', '🐛', 'crawl']];
  const byId = id => document.getElementById(id);
  const menu = byId('menu');
  const lesson = byId('lesson');
  const activity = byId('activity');
  const feedback = byId('feedback');
  const audioError = byId('audio-error');
  const player = new Audio();
  let playback = 0;
  let repeatTimer;
  let mode;
  let selected = 'a';
  let quizKind = 'sound';
  let target;
  let choices;
  let round = 0;
  let blendStep = 0;
  let solved = false;
  let advanceTimer;
  let owner;
  const progress = {alphabet:new Set(), phonics:new Set(), listen:new Set(), blend:new Set(), howmany:new Set(), todo:new Set()};

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
    clearTimeout(repeatTimer);
    player.onended = null;
    player.pause();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch {}
    audioError.textContent = '';
  }

  /* 글자 소리 음원은 조금 천천히, 또박또박 두 번 들려줍니다. */
  function play(key, times = 2) {
    stopAudio();
    const current = playback;
    let played = 0;
    try { player.src = 'audio/' + key + '.wav?v=3'; } catch {}
    const start = () => {
      if (current !== playback) return;
      played++;
      try {
        player.playbackRate = .78;
        player.currentTime = 0;
      } catch {}
      player.play().catch(() => {
        if (current === playback) audioError.textContent = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 보세요.';
      });
    };
    player.onended = () => {
      if (current !== playback || played >= times) return;
      clearTimeout(repeatTimer);
      repeatTimer = setTimeout(() => { if (current === playback) start(); }, 450);
    };
    start();
  }

  function speakEN(text) {
    stopAudio();
    try {
      const voice = speechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = .82;
      utter.pitch = 1.1;
      voice.speak(utter);
    } catch {
      audioError.textContent = '이 브라우저에서는 영어 소리가 나지 않아요. 글자를 소리 내어 읽어 주세요.';
    }
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
    clearTimeout(advanceTimer);
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

  /* ── 🍎 How Many? : 사과를 하나씩 눌러 세기 ── */
  const ap = {level: 1, target: 3, picks: 0, done: false};

  function apCard() {
    return appleCards[ap.level];
  }

  function apWord(value) {
    if (value <= 20) return numberWords[value];
    if (value <= 100) return tensWords[value / 10 - 1];
    return hundredsWords[value / 100 - 1];
  }

  function apCapital(word) {
    return word[0].toUpperCase() + word.slice(1);
  }

  function apAsk() {
    return apCard().step === 1 ? `Count ${ap.target} apples!` : `Count to ${ap.target}!`;
  }

  function apNew(level = ap.level) {
    clearTimeout(advanceTimer);
    solved = false;
    ap.level = Object.hasOwn(appleCards, level) ? +level : 1;
    const card = apCard();
    const units = Math.round(card.max / card.step);
    ap.target = (1 + Math.floor(Math.random() * units)) * card.step;
    ap.picks = 0;
    ap.done = false;
    const apples = Array.from({length: Math.round(ap.target / card.step)}, (_, index) => `
      <button type="button" class="ap-apple" data-apple="${index}" aria-label="${index + 1}번째 사과">
        <img src="img/apple-whole.png" alt="" width="120" height="120">
      </button>`).join('');
    activity.innerHTML = `
      <div class="toolbar ap-levels" aria-label="세는 단계">
        ${Object.keys(appleCards).map(level => `<button type="button" data-ap="${level}" aria-pressed="${ap.level === +level}">${levelLabels[level]}</button>`).join('')}
      </div>
      <div class="ap-ask">
        <p lang="en">${apAsk()}</p>
        <button type="button" class="ap-say" data-ap-say aria-label="문제 다시 듣기">🔊</button>
      </div>
      <p class="ap-tally" data-ap-tally>0 / ${ap.target}</p>
      <div class="ap-bowl">${apples}</div>
      <div class="ap-actions"><button type="button" data-ap-again>🔄 다른 사과</button></div>`;
    feedback.textContent = '';
    speakEN(apAsk());
  }

  function apPick(button) {
    if (ap.done || !button || button.classList.contains('picked')) return;
    const card = apCard();
    ap.picks++;
    button.classList.add('picked');
    const image = button.querySelector('img');
    if (image) image.src = 'img/apple-bite.png';
    button.insertAdjacentHTML('beforeend', `<b class="ap-badge">${ap.picks * card.step}</b>`);
    const total = ap.picks * card.step;
    const tally = activity.querySelector('[data-ap-tally]');
    if (tally) tally.textContent = `${total} / ${ap.target}`;
    speakEN(`${apCapital(apWord(total))}!`);
    if (total >= ap.target) apFinish();
  }

  function apFinish() {
    ap.done = true;
    const bowl = activity.querySelector('.ap-bowl');
    bowl?.classList.add('party');
    if (bowl) {
      const burst = document.createElement('div');
      burst.className = 'confetti';
      burst.setAttribute('aria-hidden', 'true');
      burst.innerHTML = Array.from({length: 12}, (_, i) => `<span style="--i:${i}">${['⭐', '✨', '🍎', '💛', '🎉', '🍏'][i % 6]}</span>`).join('');
      bowl.append(burst);
    }
    const starred = window.HosuStudy?.award('english');
    feedback.textContent = ap.level <= 2 ? `${ap.target} apples! 다 세었어요 🎉` : `${ap.target}! 다 세었어요 🎉`;
    if (starred) feedback.textContent += ' · ⭐ 별 하나!';
    speakEN(`Good job!`);
    activity.querySelector('.ap-actions')?.insertAdjacentHTML('afterbegin', '<button type="button" data-ap-next>다음 사과 →</button>');
    advanceTimer = setTimeout(() => { if (mode === 'howmany') apNew(); }, 3200);
  }

  /* ── 🔎 소리 찾기 : 보기 버튼만 남기고, 문제 소리를 두 번 들려줍니다 ── */
  function askListen() {
    play(quizKind + '-' + target);
  }

  function renderListen() {
    activity.innerHTML = `
      <div class="toolbar" aria-label="문제 종류">
        <button type="button" data-kind="sound" aria-pressed="${quizKind === 'sound'}">글자 소리 찾기</button>
        <button type="button" data-kind="name" aria-pressed="${quizKind === 'name'}">글자 이름 찾기</button>
      </div>
      <p>문제를 듣고 알맞은 글자를 골라요.</p>
      <div class="toolbar"><button type="button" data-listen-again>🔊 다시 듣기</button></div>
      <div class="choices" aria-label="보기">${choices.map(choice => `
        <button type="button" class="choice" data-answer="${choice}" lang="en">${choice.toUpperCase()} ${choice}</button>`).join('')}
      </div>
      <button type="button" data-next>다음 문제 →</button>`;
    askListen();
  }

  /* ── 🔗 소리 합치기 : 글자를 왼쪽부터 눌러 소리를 이어 붙입니다 ── */
  function renderBlend() {
    const word = target;
    const picture = wordPictures[word] || '🔤';
    blendStep = 0;
    activity.innerHTML = `
      <p>글자를 왼쪽부터 차례로 눌러 소리를 이어 봐요.</p>
      <div class="blend-row">${[...word].map((letter, index) => `
        <button type="button" class="blend-letter" data-blend="${index}" lang="en">${letter}</button>`).join('')}</div>
      <div class="blend-result" data-blend-result hidden>
        <span aria-hidden="true">${picture}</span>
        <strong lang="en">${word}!</strong>
      </div>
      <button type="button" data-next>다음 문제 →</button>`;
  }

  /* ── 🐸 What Can You Do? ── */
  function tdNew(quiz) {
    clearTimeout(advanceTimer);
    solved = false;
    if (!quiz) {
      activity.innerHTML = `
        <p>동물 친구를 누르면 하는 일을 영어로 말해줘요. 따라 해 보세요!</p>
        <div class="todo-grid">${actions.map(([name, emoji, verb]) => `
          <button class="todo-card" data-td="${verb}" data-say="I can ${verb}!">
            <span>${emoji}</span><strong lang="en">I can ${verb}!</strong><small>${{jump:'뛰어요', run:'달려요', swim:'헤엄쳐요', fly:'날아요', dance:'춤춰요', crawl:'기어요'}[verb]}</small>
          </button>`).join('')}</div>
        <button data-td-quiz>🎯 Who can swim? 퀴즈</button>`;
      feedback.textContent = '';
      return;
    }
    const trio = shuffle(actions).slice(0, 3);
    target = shuffle(trio)[0];
    choices = shuffle(trio);
    activity.innerHTML = `
      <p>문제를 듣고 할 줄 아는 동물을 골라요.</p>
      <button data-td-audio="Who can ${target[2]}?">🔊 문제 듣기</button>
      <div class="todo-grid todo-quiz">${choices.map(([name, emoji, verb]) => `
        <button class="todo-card" data-td-answer="${name}|${verb}"><span>${emoji}</span></button>`).join('')}</div>
      <button data-next>다음 문제 →</button>`;
    speakEN(`Who can ${target[2]}?`);
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

  function navigate() {
    stopAudio();
    clearTimeout(advanceTimer);
    feedback.textContent = '';
    const hash = location.hash.slice(1);
    mode = Object.hasOwn(titles, hash) ? hash : undefined;
    menu.hidden = !!mode;
    lesson.hidden = !mode;
    if (!mode) return;
    byId('lesson-title').textContent = titles[mode];
    if (mode === 'alphabet' || mode === 'phonics') renderLetters();
    else if (mode === 'howmany') apNew();
    else if (mode === 'todo') tdNew(false);
    else {
      newQuestion();
      if (mode === 'listen') renderListen();
      else renderBlend();
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
    if (mode === 'howmany') {
      if (button.dataset.ap) { apNew(+button.dataset.ap); return; }
      if (button.hasAttribute('data-ap-again') || button.hasAttribute('data-ap-next')) { apNew(); return; }
      if (button.hasAttribute('data-ap-say')) { speakEN(apAsk()); return; }
      if (button.dataset.apple !== undefined) { apPick(button); return; }
    }
    if (mode === 'listen') {
      if (button.hasAttribute('data-listen-again')) { askListen(); return; }
      if (answer && !solved) {
        if (answer !== target) {
          feedback.textContent = '다시 들어 봐요!';
          button.classList.add('wrong');
          setTimeout(() => button.classList.remove('wrong'), 520);
          askListen();
          return;
        }
        solved = true;
        button.classList.add('right');
        feedback.textContent = `정답! ${target.toUpperCase()} ${target}`;
        if (studyStep(target)) feedback.textContent += ' · ⭐ 별 하나!';
        const next = activity.querySelector('[data-next]');
        advanceTimer = setTimeout(() => next?.click(), 1700);
        return;
      }
    }
    if (mode === 'blend' && button.dataset.blend !== undefined) {
      const index = +button.dataset.blend;
      if (index < blendStep) return;
      if (index > blendStep) { feedback.textContent = '왼쪽 글자부터 차례로 눌러요.'; return; }
      play('sound-' + target[index]);
      button.classList.add('read');
      blendStep++;
      if (blendStep >= target.length) {
        const result = activity.querySelector('[data-blend-result]');
        if (result) result.hidden = false;
        activity.querySelector('.blend-row')?.classList.add('done');
        feedback.textContent = `${target}! 다 읽었어요`;
        setTimeout(() => { if (mode === 'blend') speakEN(`${target}!`); }, 760);
        if (studyStep(target)) feedback.textContent += ' · ⭐ 별 하나!';
        const next = activity.querySelector('[data-next]');
        advanceTimer = setTimeout(() => next?.click(), 2400);
      }
      return;
    }
    if (button.dataset.td) {
      button.classList.add('acted');
      feedback.textContent = studyStep(button.dataset.td) ? '다섯 마리를 만났어요! ⭐ 별 하나' : '';
      return;
    }
    if (button.dataset.tdAudio) {
      speakEN(button.dataset.tdAudio);
      return;
    }
    if (button.hasAttribute('data-td-quiz')) {
      tdNew(true);
      return;
    }
    if (button.dataset.tdAnswer && !solved) {
      const [name, verb] = button.dataset.tdAnswer.split('|');
      if (name !== target[0]) {
        feedback.textContent = '앗, 그 친구는 할 수 없어요. 다시 들어요!';
        speakEN(`Who can ${target[2]}?`);
        return;
      }
      solved = true;
      feedback.textContent = `정답! I can ${verb}!`;
      speakEN(`Yes! I can ${verb}!`);
      if (studyStep(verb)) feedback.textContent += ' · ⭐ 별 하나!';
      const next = activity.querySelector('[data-next]');
      advanceTimer = setTimeout(() => next.click(), 1900);
      return;
    }
    if (kind || button.hasAttribute('data-next')) {
      stopAudio();
      if (kind) quizKind = kind;
      if (mode === 'todo') tdNew(true);
      else {
        if (mode === 'blend') round = (round + 1) % rounds.length;
        newQuestion();
        if (mode === 'listen') renderListen();
        else renderBlend();
      }
      feedback.textContent = '';
      activity.querySelector('button').focus();
    }
  });

  window.addEventListener('hashchange', navigate);
  window.addEventListener('pagehide', stopAudio);
  navigate();
})();
