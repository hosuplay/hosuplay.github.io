(()=>{
  const feedback=document.getElementById('feedback');
  const nextButton=document.getElementById('nextButton');
  let queued=false;
  let lastText='';
  setInterval(()=>{
    if(!feedback||!nextButton)return;
    const isCorrect=feedback.classList.contains('good') && /정답/.test(feedback.textContent||'') && !nextButton.hidden;
    if(!isCorrect){
      queued=false;
      lastText=feedback.textContent||'';
      return;
    }
    if(queued)return;
    queued=true;
    const text=feedback.textContent||'';
    lastText=text;
    setTimeout(()=>{
      if(feedback.classList.contains('good') && !nextButton.hidden && (feedback.textContent||'')===text){
        nextButton.click();
      }
      queued=false;
    },700);
  },100);
})();
