(()=>{
  const feedback=document.getElementById('feedback');
  const nextButton=document.getElementById('nextButton');
  let timer=null;
  const schedule=()=>{
    clearTimeout(timer);
    if(feedback && nextButton && feedback.classList.contains('good') && !nextButton.hidden){
      timer=setTimeout(()=>{
        if(feedback.classList.contains('good') && !nextButton.hidden) nextButton.click();
      },700);
    }
  };
  if(feedback){
    new MutationObserver(schedule).observe(feedback,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
})();
