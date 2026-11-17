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
  const titles = {alphabet: '알파벳 놀이', phonics: '파닉스 소리', listen: '소리 찾기', blend: '소리 합치기', howmany: '🎈 How Many? 숫자 세기', todo: '🐸 What Can You Do?'};
  const pets = [['cat', '🐱'], ['dog', '🐶'], ['frog', '🐸'], ['duck', '🦆'], ['pig', '🐷'], ['bug', '🐛']];
  const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const balloonColors = ['#e8833a', '#3f7fd4', '#3f9a5f', '#4aa3a8', '#c8577f'];
  const actions = [['frog', '🐸', 'jump'], ['dog', '🐶', 'run'], ['duck', '🦆', 'swim'], ['bird', '🐦', 'fly'], ['pig', '🐷', 'dance'], ['bug', '🐛', 'crawl']];
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
    player.pause();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch {}
    audioError.textContent = '';
  }

  function play(key) {
    stopAudio();
    const current = playback;
    player.src = 'audio/' + key + '.wav?v=3';
    player.play().catch(() => {
      if (current === playback) audioError.textContent = '소리를 재생하지 못했어요. 듣기 버튼을 다시 눌러 보세요.';
    });
  }

  function speakEN(text) {
    stopAudio();
    try {
      const voice = speechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = .85;
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

  /* ── 🎈 How Many? ── */
  const hm = {max: 5, count: 3, pet: pets[0]};
  function hmNew() {
    clearTimeout(advanceTimer);
    solved = false;
    hm.count = 1 + Math.floor(Math.random() * hm.max);
    hm.pet = shuffle(pets)[0];
    const [name, emoji] = hm.pet;
    const balloons = Array.from({length: Math.min(hm.max, hm.count + 2)}, (_, i) => i + 1);
    const choicesNow = shuffle(balloons);
    activity.innerHTML = `
      <div class="toolbar" aria-label="숫자 범위">
        <button data-hm="5" aria-pressed="${hm.max === 5}">1~5 세기</button>
        <button data-hm="10" aria-pressed="${hm.max === 10}">1~10 세기</button>
      </div>
      <p>동물을 하나씩 짚으면서 세 보고, 숫자 풍선을 눌러요.</p>
      <div class="hm-scene">${Array.from({length: hm.count}, (_, i) => `
        <span class="pet" style="animation-delay:${i * .12}s"><i class="pet-balloon" style="background:${balloonColors[i % balloonColors.length]}"></i>${emoji}</span>`).join('')}</div>
      <button data-hm-audio="How many?">🔊 How many?</button>
      <div class="hm-balloons" aria-label="숫자 풍선 고르기">${choicesNow.map((n, i) => `
        <button class="balloon" data-hm-answer="${n}" style="background:${balloonColors[i % balloonColors.length]}">${n}</button>`).join('')}</div>
      <button data-next>다음 동물 →</button>`;
    hm.answer = hm.count;
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
    clearTimeout(advanceTimer);
    feedback.textContent = '';
    const hash = location.hash.slice(1);
    mode = Object.hasOwn(titles, hash) ? hash : undefined;
    menu.hidden = !!mode;
    lesson.hidden = !mode;
    if (!mode) return;
    byId('lesson-title').textContent = titles[mode];
    if (mode === 'alphabet' || mode === 'phonics') renderLetters();
    else if (mode === 'howmany') hmNew();
    else if (mode === 'todo') tdNew(false);
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
    if (button.dataset.hm) {
      hm.max = +button.dataset.hm;
      hmNew();
      return;
    }
    if (button.dataset.hmAudio) {
      speakEN(button.dataset.hmAudio);
      return;
    }
    if (button.dataset.hmAnswer && !solved) {
      if (+button.dataset.hmAnswer !== hm.answer) {
        feedback.textContent = '하나씩 짚으면서 다시 세어 봐요!';
        return;
      }
      solved = true;
      feedback.textContent = `정답! ${numberWords[hm.answer].toUpperCase()} ${numberWords[hm.answer]}!`;
      speakEN(`${numberWords[hm.answer]}!`);
      if (studyStep(String(hm.answer))) feedback.textContent += ' · ⭐ 별 하나!';
      const next = activity.querySelector('[data-next]');
      advanceTimer = setTimeout(() => next.click(), 1800);
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
      if (mode === 'blend') round = (round + 1) % rounds.length;
      if (mode === 'howmany') hmNew();
      else if (mode === 'todo') tdNew(true);
      else {
        newQuestion();
        renderQuestion();
      }
      feedback.textContent = '';
      activity.querySelector('button').focus();
    }
  });

  window.addEventListener('hashchange', navigate);
  window.addEventListener('pagehide', stopAudio);
  navigate();
})();
