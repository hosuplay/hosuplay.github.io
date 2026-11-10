/* Pure quiz logic: independent of DOM, usable in browser and Node tests. */
(function(root){
  'use strict';
  const PERIODS=Object.freeze(['트라이아스기','쥐라기','백악기']);
  const DIETS=Object.freeze(['초식','육식','물고기 중심의 육식']);
  function shuffle(items,rng=Math.random){
    const copy=[...items];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  }
  function createQuestions(dinosaurs,mode,limit=10,rng=Math.random){
    if(!['name','period','diet'].includes(mode))throw new Error('Unknown dinosaur quiz mode');
    if(!Array.isArray(dinosaurs)||dinosaurs.length<4)throw new Error('At least four species required');
    const unique=new Set(dinosaurs.map(d=>d.id));
    if(unique.size!==dinosaurs.length)throw new Error('Duplicate dinosaur identifiers');
    return shuffle(dinosaurs,rng).slice(0,Math.min(limit,dinosaurs.length)).map(d=>{
      const answer=mode==='name'?d.name:mode==='period'?d.period:d.diet;
      const choices=mode==='name'
        ?shuffle([d.name,...shuffle(dinosaurs.filter(other=>other.id!==d.id),rng).slice(0,3).map(other=>other.name)],rng)
        :shuffle(mode==='period'?PERIODS:DIETS,rng);
      if(!choices.includes(answer)||new Set(choices).size!==choices.length)throw new Error('Invalid choices for '+d.id);
      return {id:d.id,mode,name:d.name,answer,choices,clue:d.clue,photo:'images/'+d.id+'.webp'};
    });
  }
  function evaluate(question,choice,hadWrongAnswer=false){
    const correct=question.answer===choice;
    return {correct,award:correct&&!hadWrongAnswer?1:0};
  }
  function speechText(text){
    return String(text||'')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu,'')
      .replace(/[^\S\r\n]+/g,' ').trim();
  }
  const api=Object.freeze({PERIODS,DIETS,shuffle,createQuestions,evaluate,speechText});
  root.HOSU_DINO_CORE=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
