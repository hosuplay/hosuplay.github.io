/* Run from repo root: node dinosaurs/tests/quiz-core.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const dinos=require('../data.js');
const core=require('../quiz-core.js');
assert.equal(dinos.length,12,'starter image catalog has 12 identified species');
assert.equal(new Set(dinos.map(d=>d.id)).size,dinos.length,'no duplicated species ids');
const ids=dinos.map(d=>d.id);
for(const mode of ['name','period','diet']){
  for(let run=0;run<20;run++){
    const questions=core.createQuestions(dinos,mode,10);
    assert.equal(questions.length,10);
    assert.equal(new Set(questions.map(q=>q.id)).size,10);
    for(const q of questions){
      assert.ok(ids.includes(q.id));
      assert.ok(q.choices.includes(q.answer));
      assert.equal(new Set(q.choices).size,q.choices.length);
      assert.equal(core.evaluate(q,q.answer,false).award,1);
      assert.equal(core.evaluate(q,q.answer,true).award,0);
      const wrong=q.choices.find(choice=>choice!==q.answer);
      assert.equal(core.evaluate(q,wrong,false).correct,false);
      assert.equal(core.evaluate(q,wrong,false).award,0);
    }
  }
}
assert.ok(!core.speechText('🦕 정답! 티라노사우루스 ⭐ 1점').includes('🦕'));
assert.ok(!core.speechText('🦕 정답! 티라노사우루스 ⭐ 1점').includes('⭐'));
assert.throws(()=>core.createQuestions(dinos,'unknown',10),/Unknown/);
assert.throws(()=>core.createQuestions(dinos.slice(0,3),'name',10),/At least/);
console.log('Dinosaur quiz logic: all checks passed');
