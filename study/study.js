(() => {
  const key = 'hosu-study-v1';
  const subjects = {math:'수학', hangul:'한글', english:'영어'};
  const items = [
    ['rug','무지개 러그','🌈',2], ['plant','새싹 화분','🪴',2],
    ['lamp','달빛 조명','🌙',3], ['sofa','포근한 소파','🛋️',3],
    ['dragon','세종대왕 피규어','👑',10,'/playroom-sejong.webp'],
    ['unicorn','자유의 여신상 피규어','🗽',10,'/playroom-liberty.webp'],
  ];
  const empty = () => ({active:null, profiles:[]});
  let memory = empty();
  const listeners = new Set();
  function read() {
    try { return JSON.parse(localStorage.getItem(key)) || memory; }
    catch { return memory; }
  }
  function update(change) {
    const data = read();
    const result = change(data);
    if (!result) return false;
    memory = data;
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
    listeners.forEach(render => render());
    return true;
  }
  const current = data => data.profiles.find(profile => profile.id === data.active);
  function award(subject) {
    if (confirmedProfile && confirmedProfile !== current(read())?.id) return false;
    return update(data => {
      const profile = current(data);
      if (!profile || !Object.hasOwn(subjects, subject)) return false;
      profile.stars++;
      profile.completed[subject]++;
      return true;
    });
  }
  function make(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  }
  function figure(art) {
    const image = new Image();
    image.src = art;
    image.alt = '';
    image.className = 'study-figure';
    return image;
  }
  function button(text, action) {
    const element = make('button', text);
    element.type = 'button';
    element.onclick = action;
    return element;
  }
  let confirmedProfile;
  function mount() {
    const host = document.querySelector('[data-study]');
    if (!host) return;
    const content = document.querySelector('[data-study-content]');
    const room = host.dataset.study === 'room';
    let choosing = true;
    let confirmed = null;
    let message = '';
    function render() {
      const data = read();
      const profile = current(data);
      const entered = !!profile && !choosing && confirmed === profile.id;
      if (content) content.hidden = !entered;
      host.replaceChildren();
      if (!entered) {
        host.append(make('h2', '누가 공부할까요?'));
        for (const saved of data.profiles) {
          host.append(button(saved.name + ' · 시작하기', () => {
            choosing = false;
            confirmedProfile = confirmed = saved.id;
            update(state => { state.active = saved.id; return true; });
            content?.focus();
          }));
        }
        const form = document.createElement('form');
        const input = document.createElement('input');
        input.placeholder = '새 닉네임';
        input.setAttribute('aria-label','새 닉네임');
        input.required = true;
        input.maxLength = 16;
        form.append(input, make('button','저장하고 시작'));
        form.onsubmit = event => {
          event.preventDefault();
          const name = input.value.trim();
          if (!name) return;
          choosing = false;
          update(state => {
            let saved = state.profiles.find(person => person.name === name);
            if (!saved) {
              saved = {id:crypto.randomUUID(), name, stars:0, completed:{math:0, hangul:0, english:0}, owned:[], placed:[]};
              state.profiles.push(saved);
            }
            state.active = confirmedProfile = confirmed = saved.id;
            return true;
          });
        };
        host.append(form, make('p','닉네임·별·방 꾸미기 기록은 이 브라우저에 저장돼요.'));
        return;
      }
      host.append(make('strong', profile.name + ' · ⭐ ' + profile.stars));
      host.append(button('닉네임 바꾸기', () => {
        choosing = true;
        message = '';
        if (!room) {
          location.reload();
          return;
        }
        render();
      }));
      if (!room) {
        const link = make('a','내 방 · 상점 · 랭킹');
        link.href = '/study/';
        host.append(link);
        return;
      }
      host.append(make('h2','내 방'));
      const scene = document.createElement('div');
      scene.className = 'study-room';
      if (!profile.placed.length) scene.append(make('p','가구를 놓으면 여기에 보여요.'));
      for (const [id,name,icon,,art] of items.filter(([id]) => profile.placed.includes(id))) {
        const prop = make('span',icon);
        prop.title = name;
        prop.setAttribute('aria-label',name);
        prop.className = 'room-item item-' + id;
        if (art) prop.replaceChildren(figure(art));
        scene.append(prop);
      }
      host.append(scene, make('h2','별 상점'));
      const shop = document.createElement('div');
      shop.className = 'study-shop';
      for (const [id,name,icon,price,art] of items) {
        const card = document.createElement('article');
        if (art) card.append(figure(art));
        card.append(make('strong', (art ? '' : icon + ' ') + name));
        const owned = profile.owned.includes(id);
        const placed = profile.placed.includes(id);
        const action = button(owned ? (placed ? '보관하기' : '방에 놓기') : '⭐ ' + price + ' · 사기', () => {
          update(state => {
            const owner = current(state);
            if (owner?.id !== profile.id) return false;
            if (owner.owned.includes(id)) {
              if (owner.placed.includes(id)) owner.placed = owner.placed.filter(item => item !== id);
              else owner.placed.push(id);
              message = name + ' 배치를 바꿨어요.';
            } else {
              if (owner.stars < price) return false;
              owner.stars -= price;
              owner.owned.push(id);
              owner.placed.push(id);
              message = name + '을(를) 방에 놓았어요!';
            }
            return true;
          });
        });
        action.disabled = !owned && profile.stars < price;
        card.append(action);
        shop.append(card);
      }
      host.append(shop);
      const status = make('p',message);
      status.setAttribute('role','status');
      host.append(status, make('h2','이 기기 랭킹'));
      for (const [subject,label] of Object.entries(subjects)) {
        host.append(make('h3',label + ' · 완료한 공부'));
        const ranking = document.createElement('ol');
        const ranked = data.profiles.filter(person => person.completed[subject] > 0)
          .sort((a,b) => b.completed[subject] - a.completed[subject]);
        if (!ranked.length) host.append(make('p','아직 완료 기록이 없어요.'));
        for (const person of ranked) ranking.append(make('li',person.name + ' · ' + person.completed[subject] + '회'));
        host.append(ranking);
      }
    }
    if (new URLSearchParams(location.search).has('profile')) choosing = true;
    else if (room && current(read())) {
      choosing = false;
      confirmed = current(read()).id;
    }
    listeners.add(render);
    window.addEventListener('storage', event => { if (event.key === key) render(); });
    render();
  }
  window.HosuStudy = {award, active:() => confirmedProfile};
  document.addEventListener('DOMContentLoaded', mount);
})();
