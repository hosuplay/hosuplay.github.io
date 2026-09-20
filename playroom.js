/* Both the illustrated objects and the lower menu read the same destinations.
   Replace these values with independent domain URLs when those are available. */
const HOSU_DESTINATIONS = Object.freeze({
  animal: '#animals',
  math: './math/',
  puzzle: '#puzzle'
});
document.querySelectorAll('[data-room-link]').forEach(link => {
  link.href = HOSU_DESTINATIONS[link.dataset.roomLink];
});
function routePlayroom() {
  if (location.hash === '#animals') showScreen('homeScreen');
  else if (location.hash === '#puzzle') openPuzzle();
  else if (!location.hash || location.hash === '#room') showScreen('roomScreen');
}
window.addEventListener('hashchange', () => {
  speechSynthesis.cancel();
  routePlayroom();
});
routePlayroom();
