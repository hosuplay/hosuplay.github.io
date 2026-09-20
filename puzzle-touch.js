// Horizontal swipes scroll the tray; upward drags carry a piece onto the board.
(() => {
  const tray = document.getElementById('puzzleTray');
  const board = document.getElementById('puzzleBoard');
  let gesture = null;
  let suppressClickUntil = 0;
  function clear() {
    if (!gesture) return;
    const { piece, pointerId, ghost, target } = gesture;
    gesture = null;
    ghost?.remove();
    target?.classList.remove('puzzle-drop-target');
    piece.classList.remove('puzzle-drag-source');
    if (piece.hasPointerCapture(pointerId)) piece.releasePointerCapture(pointerId);
  }
  function update(e) {
    const g = gesture;
    g.ghost.style.left = `${e.clientX}px`;
    g.ghost.style.top = `${e.clientY}px`;
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('.puzzle-slot');
    const target = hit && board.contains(hit) && !hit.disabled ? hit : null;
    if (target !== g.target) {
      g.target?.classList.remove('puzzle-drop-target');
      target?.classList.add('puzzle-drop-target');
      g.target = target;
    }
  }
  tray.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || !e.isPrimary || gesture) return;
    const piece = e.target.closest('.puzzle-piece');
    if (!piece || piece.disabled) return;
    gesture = { piece, pointerId: e.pointerId, x: e.clientX, y: e.clientY,
      index: Number(piece.dataset.piece), token: puzzleToken, ghost: null, target: null };
    piece.setPointerCapture(e.pointerId);
  });
  tray.addEventListener('pointermove', e => {
    if (!gesture || e.pointerId !== gesture.pointerId) return;
    const g = gesture;
    if (g.token !== puzzleToken || !document.getElementById('puzzleScreen').classList.contains('active')) {
      clear(); return;
    }
    if (!g.ghost) {
      const dx = Math.abs(e.clientX - g.x), dy = Math.abs(e.clientY - g.y);
      if (Math.max(dx, dy) < 8) return;
      if (dx > dy) { clear(); return; }
      selectPuzzlePiece(g.index);
      const ghost = document.createElement('div');
      ghost.className = 'puzzle-touch-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      ['backgroundImage', 'backgroundSize', 'backgroundPosition'].forEach(key => {
        ghost.style[key] = g.piece.style[key];
      });
      const size = board.firstElementChild.getBoundingClientRect().width;
      ghost.style.width = ghost.style.height = `${size}px`;
      document.body.append(ghost);
      g.ghost = ghost;
      g.piece.classList.add('puzzle-drag-source');
    }
    e.preventDefault();
    update(e);
  }, { passive: false });
  tray.addEventListener('pointerup', e => {
    if (!gesture || e.pointerId !== gesture.pointerId) return;
    if (gesture.ghost) {
      e.preventDefault();
      suppressClickUntil = Date.now() + 500;
      if (gesture.token === puzzleToken && document.getElementById('puzzleScreen').classList.contains('active')) {
        update(e);
        if (gesture.target) placePuzzlePiece([...board.children].indexOf(gesture.target));
      }
    }
    clear();
  });
  tray.addEventListener('click', e => {
    if (e.detail !== 0 && Date.now() < suppressClickUntil) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  tray.addEventListener('pointercancel', clear);
  tray.addEventListener('lostpointercapture', clear);
  window.addEventListener('blur', clear);
  window.addEventListener('hashchange', clear);
  new MutationObserver(() => {
    if (gesture && (!gesture.piece.isConnected || !document.getElementById('puzzleScreen').classList.contains('active'))) clear();
  }).observe(document.getElementById('puzzleScreen'), { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
})();
