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
  const titles = {alphabet: '알파벳 놀이', phonics: '파닉스 소리', listen: '소리 찾기', blend: '소리 합치기', howmany: '🎈 How Many? 숫자 풍선 달기', todo: '🐸 What Can You Do?'};
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

  /* ── 🎈 How Many? : 숫자 풍선 하나씩 달기 ── */
  const hmPets = [['cat', '🐱'], ['dog', '🐶'], ['frog', '🐸'], ['bug', '🐛'], ['pig', '🐷']];
  const hmOrdinal = index => ['첫', '두', '세', '네', '다섯'][index] + ' 번째';
  const hm = {start: 1, filled: [], selected: 0, done: false, drag: null, muteClick: false};
  const hmNumbers = () => hmPets.map((_, i) => hm.start + i);
  const hmColor = index => balloonColors[index % balloonColors.length];
  const hmWord = number => numberWords[number][0].toUpperCase() + numberWords[number].slice(1);
  const hmJosa = number => number === 6 || number === 10 ? '은' : '는';

  function hmBalloonHTML(number, index, filled) {
    if (!filled) return `<span class="hm-balloon empty" aria-hidden="true"><i>${number}</i></span>`;
    return `<span class="hm-balloon on" style="--balloon:${hmColor(index)}" aria-hidden="true">${number}</span>`;
  }

  function hmSlotHTML(index) {
    const number = hmNumbers()[index];
    const filled = hm.filled[index] === number;
    const emoji = hmPets[index][1];
    return `<button type="button" class="hm-slot${filled ? ' filled' : ''}" data-slot="${index}"
      aria-label="${filled ? number + '번 풍선, ' : ''}${hmOrdinal(index)} 자리">
      <span class="hm-line">${hmBalloonHTML(number, index, filled)}<span class="hm-string${filled ? ' taut' : ''}" aria-hidden="true"></span></span>
      <span class="hm-pet" aria-hidden="true">${emoji}</span>
    </button>`;
  }

  function hmTrayHTML() {
    return shuffle(hmNumbers()).map(number => `
      <button type="button" class="hm-balloon tray" data-balloon="${number}" style="--balloon:${hmColor(number - hm.start)}"
        aria-label="${number}번 풍선" aria-pressed="${hm.selected === number}">${number}</button>`).join('');
  }

  function hmNew(start = hm.start) {
    clearTimeout(advanceTimer);
    solved = false;
    hm.start = start === 6 ? 6 : 1;
    hm.filled = hmPets.map(() => 0);
    hm.selected = 0;
    hm.done = false;
    hm.drag = null;
    activity.innerHTML = `
      <div class="toolbar" aria-label="숫자 범위">
        <button type="button" data-hm="1" aria-pressed="${hm.start === 1}">1~5</button>
        <button type="button" data-hm="6" aria-pressed="${hm.start === 6}">6~10</button>
      </div>
      <p class="hm-guide">풍선을 끌어다 동물 머리 위에 달아요. <b>${hm.start}</b>부터 차례로!</p>
      <div class="hm-stage" data-hm-stage>
        <div class="hm-slots">${hmPets.map((_, i) => hmSlotHTML(i)).join('')}</div>
      </div>
      <p class="hm-tray-label">숫자 풍선을 하나씩 갖다 놓아 봐요</p>
      <div class="hm-tray" role="group" aria-label="숫자 풍선">${hmTrayHTML()}</div>
      <div class="hm-actions"><button type="button" data-hm-again>🔄 섞어서 다시</button></div>`;
    feedback.textContent = '';
    hmMarkNext();
  }

  function hmMarkNext() {
    const nextIndex = hm.done ? -1 : hm.filled.findIndex(value => !value);
    activity.querySelectorAll('.hm-slot').forEach(slot => {
      slot.classList.toggle('next', +slot.dataset.slot === nextIndex);
    });
  }

  function hmPulse(element) {
    if (!element) return;
    element.classList.remove('bump');
    void element.offsetWidth;
    element.classList.add('bump');
  }

  function hmHighlight(slot) {
    activity.querySelectorAll('.hm-slot').forEach(candidate => candidate.classList.toggle('over', candidate === slot));
  }

  function hmSlotAt(x, y) {
    const slot = document.elementFromPoint(x, y)?.closest?.('.hm-slot');
    return slot && activity.contains(slot) ? slot : null;
  }

  function hmPlace(number, index) {
    if (hm.done || !number || index < 0) return;
    const numbers = hmNumbers();
    const slot = activity.querySelector(`.hm-slot[data-slot="${index}"]`);
    if (hm.filled[index]) {
      feedback.textContent = `여기는 이미 ${hm.filled[index]}번 풍선이 달려 있어요.`;
      hmPulse(slot);
      return;
    }
    if (numbers[index] !== number) {
      feedback.textContent = `${number}${hmJosa(number)} ${hmOrdinal(numbers.indexOf(number))} 자리에 달아요. 다시 해 볼까요?`;
      hmPulse(slot);
      hmPulse(activity.querySelector(`.hm-tray .hm-balloon[data-balloon="${number}"]`));
      return;
    }
    hm.filled[index] = number;
    hm.selected = 0;
    const wasFocused = slot === document.activeElement;
    if (slot) slot.outerHTML = hmSlotHTML(index);
    if (wasFocused) activity.querySelector(`.hm-slot[data-slot="${index}"]`)?.focus();
    activity.querySelectorAll('.hm-tray .hm-balloon').forEach(balloon => {
      if (+balloon.dataset.balloon === number) balloon.remove();
      else balloon.setAttribute('aria-pressed', 'false');
    });
    feedback.textContent = `${hmWord(number)}! ${hmOrdinal(index)} 자리 🎈`;
    speakEN(`${hmWord(number)}!`);
    const starred = studyStep(String(number));
    if (hm.filled.every((value, i) => value === numbers[i])) {
      hmFinish(starred);
      return;
    }
    if (starred) feedback.textContent += ' · ⭐ 별 하나!';
    hmMarkNext();
  }

  function hmCount(numbers) {
    stopAudio();
    if (!window.speechSynthesis) return;
    try {
      numbers.forEach((number, index) => {
        const utter = new SpeechSynthesisUtterance(numberWords[number] + (index === numbers.length - 1 ? '!' : ''));
        utter.lang = 'en-US';
        utter.rate = .82;
        utter.pitch = 1.1;
        utter.onstart = () => {
          const slot = activity.querySelector(`.hm-slot[data-slot="${index}"]`);
          if (!slot) return;
          slot.classList.remove('hm-counting');
          void slot.offsetWidth;
          slot.classList.add('hm-counting');
        };
        speechSynthesis.speak(utter);
      });
    } catch {
      audioError.textContent = '영어 소리 대신 크게 읽어 주세요.';
    }
  }

  function hmFinish(starred) {
    hm.done = true;
    hmMarkNext();
    activity.classList.add('hm-done');
    const numbers = hmNumbers();
    const stage = activity.querySelector('[data-hm-stage]');
    stage?.classList.add('party');
    if (stage) {
      const burst = document.createElement('div');
      burst.className = 'hm-confetti';
      burst.setAttribute('aria-hidden', 'true');
      burst.innerHTML = Array.from({length: 14}, (_, i) => `<span style="--i:${i}">${['⭐', '✨', '🎈', '💛', '🎉', '💜'][i % 6]}</span>`).join('');
      stage.append(burst);
    }
    const words = numbers.map(hmWord);
    feedback.textContent = `${words.join(', ')}! 다섯 개 다 달았어요 🎉` + (starred ? ' · ⭐ 별 하나!' : '');
    hmCount(numbers);
    activity.querySelector('.hm-actions')?.insertAdjacentHTML('beforeend', hm.start === 1
      ? '<button type="button" data-hm="6">6~10 풍선 달기 →</button>'
      : '<button type="button" data-hm="1">1~5 한 번 더 →</button>');
  }

  function hmDragStart(event) {
    if (mode !== 'howmany' || hm.done) return;
    const balloon = event.target.closest('.hm-tray .hm-balloon');
    if (!balloon) return;
    const rect = balloon.getBoundingClientRect();
    hm.drag = {
      number: +balloon.dataset.balloon, balloon, width: rect.width, height: rect.height,
      startX: event.clientX, startY: event.clientY,
      offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
      moved: false, ghost: null
    };
    try { balloon.setPointerCapture(event.pointerId); } catch {}
  }

  function hmDragMove(event) {
    const drag = hm.drag;
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 8) return;
      drag.moved = true;
      const ghost = drag.balloon.cloneNode(true);
      ghost.className = 'hm-balloon tray hm-drag-ghost';
      ghost.removeAttribute('data-balloon');
      ghost.style.width = drag.width + 'px';
      ghost.style.height = drag.height + 'px';
      document.body.append(ghost);
      drag.ghost = ghost;
      drag.balloon.classList.add('dragging');
    }
    drag.ghost.style.left = (event.clientX - drag.offsetX) + 'px';
    drag.ghost.style.top = (event.clientY - drag.offsetY) + 'px';
    hmHighlight(hmSlotAt(event.clientX, event.clientY));
  }

  function hmDragEnd(event) {
    const drag = hm.drag;
    if (!drag) return;
    hm.drag = null;
    drag.ghost?.remove();
    drag.balloon.classList.remove('dragging');
    hmHighlight(null);
    try { drag.balloon.releasePointerCapture(event.pointerId); } catch {}
    if (!drag.moved) return;
    hm.muteClick = true;
    setTimeout(() => { hm.muteClick = false; }, 350);
    const slot = hmSlotAt(event.clientX, event.clientY);
    if (slot) hmPlace(drag.number, +slot.dataset.slot);
    else feedback.textContent = '동물 머리 위 자리에 풍선을 놓아 봐요.';
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
    if (mode === 'howmany') {
      if (button.dataset.hm) { hmNew(+button.dataset.hm); return; }
      if (button.hasAttribute('data-hm-again')) { hmNew(hm.start); return; }
      if (button.classList.contains('hm-slot')) {
        const index = +button.dataset.slot;
        if (hm.filled[index]) { speakEN(`${numberWords[hm.filled[index]]}!`); return; }
        if (!hm.selected) {
          feedback.textContent = '아래 숫자 풍선을 먼저 골라요.';
          hmMarkNext();
          return;
        }
        hmPlace(hm.selected, index);
        return;
      }
      if (button.matches('.hm-tray .hm-balloon')) {
        if (hm.muteClick) { hm.muteClick = false; return; }
        const number = +button.dataset.balloon;
        const nextIndex = hm.done ? -1 : hm.filled.findIndex(value => !value);
        if (nextIndex >= 0 && hmNumbers()[nextIndex] === number) { hmPlace(number, nextIndex); return; }
        hm.selected = hm.selected === number ? 0 : number;
        activity.querySelectorAll('.hm-tray .hm-balloon').forEach(balloon => {
          balloon.setAttribute('aria-pressed', String(+balloon.dataset.balloon === hm.selected));
        });
        feedback.textContent = hm.selected ? `${hm.selected}번 풍선을 들었어요. 어느 자리에 달까요?` : '';
        return;
      }
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
      if (mode === 'todo') tdNew(true);
      else {
        newQuestion();
        renderQuestion();
      }
      feedback.textContent = '';
      activity.querySelector('button').focus();
    }
  });

  activity.addEventListener('pointerdown', hmDragStart);
  activity.addEventListener('pointermove', hmDragMove);
  activity.addEventListener('pointerup', hmDragEnd);
  activity.addEventListener('pointercancel', hmDragEnd);

  window.addEventListener('hashchange', navigate);
  window.addEventListener('pagehide', stopAudio);
  navigate();
})();
