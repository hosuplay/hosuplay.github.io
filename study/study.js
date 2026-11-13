(() => {
  const key = 'hosu-study-v1';
  const subjects = {math:'수학', hangul:'한글', english:'영어'};
  const items = [
    ['rug','무지개 러그','🌈',2,'/study/art/rug.webp'], ['plant','새싹 화분','🪴',2,'/study/art/plant.webp'],
    ['lamp','달빛 조명','🌙',3,'/study/art/lamp.webp'], ['sofa','포근한 소파','🛋️',3,'/study/art/sofa.webp'],
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
      scene.setAttribute('role','group');
      scene.setAttribute('aria-label','별 방');
      const savePosition = (id, position) => update(state => {
        const owner = current(state);
        if (owner?.id !== profile.id || !owner.placed.includes(id)) return false;
        (owner.positions ||= {})[id] = position;
        return true;
      });
      for (const [id,name,icon,,art] of items.filter(([id]) => profile.placed.includes(id))) {
        const prop = make('button',icon);
        prop.type = 'button';
        prop.title = name;
        prop.setAttribute('aria-label',name + ' 위치 옮기기');
        prop.className = 'room-item item-' + id;
        if (art) prop.replaceChildren(figure(art));
        function positionAt(x, y) {
          prop.style.left = x + '%';
          prop.style.top = y + '%';
          prop.style.right = 'auto';
          prop.style.bottom = 'auto';
        }
        const position = profile.positions?.[id];
        if (position) positionAt(position.x, position.y);
        scene.append(prop);
        function place(left, top) {
          const x = Math.max(0, Math.min(left, scene.clientWidth - prop.offsetWidth));
          const y = Math.max(0, Math.min(top, scene.clientHeight - prop.offsetHeight));
          const position = {x:100*x/scene.clientWidth, y:100*y/scene.clientHeight};
          positionAt(position.x, position.y);
          return position;
        }
        let drag;
        prop.onpointerdown = event => {
          if (!event.isPrimary || event.button !== 0) return;
          drag = {id:event.pointerId, x:event.clientX, y:event.clientY, left:prop.offsetLeft, top:prop.offsetTop};
          prop.setPointerCapture(event.pointerId);
        };
        prop.onpointermove = event => {
          if (event.pointerId !== drag?.id) return;
          drag.position = place(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
        };
        prop.onpointerup = event => {
          if (event.pointerId !== drag?.id) return;
          const position = drag.position;
          drag = null;
          if (position) savePosition(id, position);
        };
        prop.onpointercancel = () => {
          if (!drag) return;
          place(drag.left, drag.top);
          drag = null;
        };
        prop.onkeydown = event => {
          const delta = {ArrowLeft:[-8,0], ArrowRight:[8,0], ArrowUp:[0,-8], ArrowDown:[0,8]}[event.key];
          if (!delta) return;
          event.preventDefault();
          savePosition(id, place(prop.offsetLeft + delta[0], prop.offsetTop + delta[1]));
          host.querySelector('.item-' + id)?.focus();
        };
      }
      host.append(scene);
      if (profile.placed.length) host.append(make('p','가구를 끌어서 원하는 곳에 놓아요.'));
      host.append(make('h2','내 창고'));
      const storage = document.createElement('div');
      storage.className = 'study-storage';
      function togglePlacement(id, name) {
        update(state => {
          const owner = current(state);
          if (owner?.id !== profile.id || !owner.owned.includes(id)) return false;
          const placed = owner.placed.includes(id);
          if (placed) owner.placed = owner.placed.filter(item => item !== id);
          else owner.placed.push(id);
          message = name + (placed ? ' · 창고에 보관했어요.' : ' · 방에 놓았어요.');
          return true;
        });
      }
      for (const [id,name] of items.filter(([id]) => profile.owned.includes(id))) {
        const placed = profile.placed.includes(id);
        const row = document.createElement('div');
        row.append(make('span',name), button(placed ? '창고에 보관' : '방에 놓기', () => togglePlacement(id,name)));
        storage.append(row);
      }
      if (!profile.owned.length) storage.append(make('p','상점에서 산 가구가 여기에 모여요.'));
      host.append(storage);
      if (!profile.placed.length) host.append(make('p','상점에서 첫 가구를 골라 방을 꾸며요.'));
      host.append(make('h2','별 상점'));
      const shop = document.createElement('div');
      shop.className = 'study-shop';
      for (const [id,name,icon,price,art] of items) {
        const card = document.createElement('article');
        card.dataset.price = price;
        if (art) card.append(figure(art));
        card.append(make('strong', (art ? '' : icon + ' ') + name));
        const owned = profile.owned.includes(id);
        const action = button(owned ? '구매했어요' : '⭐ ' + price + ' · 사기', () => {
          update(state => {
            const owner = current(state);
            if (owner?.id !== profile.id || owner.owned.includes(id) || owner.stars < price) return false;
            owner.stars -= price;
            owner.owned.push(id);
            owner.placed.push(id);
            message = name + ' · 방에 놓았어요!';
            return true;
          });
        });
        action.disabled = owned || profile.stars < price;
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
