/* Adapters only: scoring, hints, TTS and results use the existing quiz engines. */
function seaQuestions(mode){
 const sea=window.HOSU_ANIMAL_CATEGORIES.sea;
 if(!sea.ready||!sea.modes.includes(mode))return [];
 return sea.questions.filter(q=>q.id?.startsWith('sea-')&&q.answer&&Array.isArray(q.choices)&&q.choices.includes(q.answer)&&new Set(q.choices).size>=4&&
  (mode==='description'?q.base&&q.hints?.length===4:mode==='photo'?!!q.photo:!!q.photo&&!!q.silhouette));
}
function seaEngineQuestions(mode){return seaQuestions(mode).map(q=>({...q,
 distractors:q.choices.filter(name=>name!==q.answer),silhouetteSrc:q.silhouette,
 variants:[{id:q.id+'-crop',src:q.photo,focus:q.focus||[.5,.5],stages:[[.4,.4,.2,.2],[.35,.35,.3,.3],[.25,.25,.5,.5],[.15,.15,.7,.7],[0,0,1,1]]}]
}));}
function openSeaMenu(){
 speechSynthesis.cancel();showScreen('seaMenu');
 for(const button of document.querySelectorAll('[data-sea-mode]'))button.disabled=!seaQuestions(button.dataset.seaMode).length;
 document.getElementById('seaStatus').textContent=HOSU_ANIMAL_CATEGORIES.sea.ready?'어떤 놀이를 해 볼까요?':'바다동물 친구들을 만날 수 있도록 준비하고 있어요.';
}
function startSeaQuiz(mode){
 const questions=seaEngineQuestions(mode);if(!questions.length)return;
 if(mode==='description')startHintQuiz(questions);
 else if(mode==='photo')startPhotoQuiz(questions);
 else if(mode==='silhouette')startSilhouetteQuiz(questions);
}
