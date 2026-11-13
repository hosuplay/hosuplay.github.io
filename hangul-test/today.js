(() => {
  const panel = document.querySelector('#today-hangul');
  const steps = [
    {title:'아 소리를 들어요', prompt:'입을 크게 벌려 따라 해 봐요.', sound:'아'},
    {title:'나를 만들어요', prompt:'ㄴ에 어떤 모음을 붙일까요?', sound:'나', options:['ㅏ','ㅗ'], answer:'ㅏ', result:'ㄴ + ㅏ = 나'},
    {title:'마를 만들어요', prompt:'ㅏ 앞에 어떤 자음을 놓을까요?', sound:'마', options:['ㄴ','ㅁ'], answer:'ㅁ', result:'ㅁ + ㅏ = 마'},
    {title:'듣고 골라요', prompt:'들리는 글자를 찾아요.', sound:'나', options:['마','나'], answer:'나'},
    {title:'마지막 글자 찾기', prompt:'이번에는 어떤 글자일까요?', sound:'마', options:['마','나'], answer:'마'},
  ];
  let index = 0;
  let owner;
  let advance;
  function speak(text) {
    playHangul(text, panel.querySelector('[role="status"]'));
  }
  function add(tag,text) {
    const node = document.createElement(tag);
    node.textContent = text;
    panel.append(node);
    return node;
  }
  function button(text,action) {
    const control = add('button',text);
    control.type = 'button';
    control.onclick = action;
    return control;
  }
  function start() {
    owner = HosuStudy.active();
    index = 0;
    render();
  }
  function render() {
    clearTimeout(advance);
    panel.replaceChildren();
    const step = steps[index];
    if (!step) {
      const awarded = owner === HosuStudy.active() && HosuStudy.award('hangul');
      add('h2',awarded ? '나와 마 한 판 끝! ⭐ 별 하나' : '나와 마 한 판 끝!');
      button('다시 놀이하기',start);
      return;
    }
    add('p',`${index + 1} / ${steps.length}`);
    add('h2',step.title);
    add('p',step.prompt);
    button('🔊 소리 듣기',() => speak(step.sound));
    const controls = (step.options || []).map(option => button(option,() => {
      if (option !== step.answer) {
        feedback.textContent = '두 소리를 다시 들어볼까요?';
        speak(step.sound);
        return;
      }
      feedback.textContent = step.result || '찾았어요! ' + step.sound;
      controls.forEach(control => control.disabled = true);
      speak(step.sound);
      next.disabled = false;
      advance = setTimeout(() => next.click(), 1550);
    }));
    const feedback = add('p','');
    feedback.setAttribute('role','status');
    const next = button(index === steps.length - 1 ? '한 판 마치기' : '다음',() => { index++; render(); });
    next.disabled = !!step.options;
  }
  button('오늘의 한글 놀이 · 나와 마',start);
})();
