/* Public entry points are real static directories, including on refresh. */
const HOSU_DESTINATIONS = Object.freeze({ animal: '/animals/', math: '/math/', insect: '/insects/', puzzle: '/puzzle/' });
document.querySelectorAll('[data-room-link]').forEach(link => {
  link.href = HOSU_DESTINATIONS[link.dataset.roomLink];
});
function routePlayroom() {
  const legacy = { '#animals': '/animals/', '#puzzle': '/puzzle/', '#room': '/' };
  const path = legacy[location.hash] || location.pathname;
  if (location.hash) history.replaceState(null, '', path + location.search);
  speechSynthesis.cancel();
  if (path === '/animals/') showScreen('homeScreen');
  else if (path === '/puzzle/') openPuzzle();
  else showScreen('roomScreen');
}
window.addEventListener('hashchange', routePlayroom);
window.addEventListener('popstate', routePlayroom);
routePlayroom();
