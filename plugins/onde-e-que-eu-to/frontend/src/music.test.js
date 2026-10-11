import test from 'node:test';
import assert from 'node:assert/strict';
import { ascendingScaleMidis, intervalQuality, lowestRootMidi, pitchClass, randomizeScaleState, scaleFormula, scaleNotes, stepIntervals, tuningFor } from './music.js';

test('contextual enharmonic spelling',()=>{
  assert.deepEqual(scaleNotes('Bb','Major (Ionian)').map(n=>n.note),['Bb','C','D','Eb','F','G','A']);
  assert.deepEqual(scaleNotes('A#','Major (Ionian)').map(n=>n.note),['A#','B#','C##','D#','E#','F##','G##']);
  assert.deepEqual(scaleNotes('F#','Major (Ionian)').map(n=>n.note),['F#','G#','A#','B','C#','D#','E#']);
  assert.deepEqual(scaleNotes('Eb','Major (Ionian)').map(n=>n.note),['Eb','F','G','Ab','Bb','C','D']);
  assert.equal(pitchClass('Bb'),pitchClass('A#'));
});
test('minor/mode steps and octave playback are derived',()=>{
  assert.deepEqual(stepIntervals('Natural Minor'),[2,1,2,2,1,2,2]);
  assert.deepEqual(stepIntervals('Dorian'),[2,1,2,2,2,1,2]);
  const a=ascendingScaleMidis('A','Major (Ionian)');assert.equal(a.at(-1)-a[0],12);
});
test('CHUG adds one real low string and never creates an eighth string',()=>{
  const six={instrument:'guitar',tuningName:'Standard (E A D G B E)',customMidis:null,chugActive:true,chugMidi:null};
  assert.deepEqual(tuningFor(six),[35,40,45,50,55,59,64]);
  assert.equal(tuningFor({...six,customMidis:[35,40,45,50,55,59,64]}).length,7);
});
test('additional string follows guitar and bass tuning/register',()=>{
  const cases=[
    ['guitar','Standard (E A D G B E)',40,35,7],['guitar','Half Step Down (Eb)',39,34,7],['guitar','Full Step Down (D)',38,33,7],
    ['bass','Standard (E A D G)',28,23,5],['bass','Half Step Down (Eb)',27,22,5],['bass','Full Step Down (D)',26,21,5]
  ];
  for(const [instrument,tuningName,low,extra,count] of cases){const result=tuningFor({instrument,tuningName,customMidis:null,chugActive:true,chugMidi:null});assert.equal(result[1],low);assert.equal(result[0],extra);assert.equal(result.length,count)}
  assert.equal(tuningFor({instrument:'bass',tuningName:'5-string (B E A D G)',customMidis:null,chugActive:true,chugMidi:null}).length,5);
});
test('20 randomizations preserve every state field except root and scale',()=>{
  const initial={instrument:'guitar',tuningName:'Drop D (D A D G B E)',customMidis:[37,45,50,55,59,64],chugActive:true,chugMidi:32,frets:24,notesOutputDb:-3,outputDb:2,root:'A',scale:'Major (Ionian)'};
  let state=initial;
  for(let i=0;i<20;i++){const previous=state;state=randomizeScaleState(state,()=>((i*7+3)%97)/97);for(const key of Object.keys(initial))if(!['root','scale'].includes(key))assert.deepEqual(state[key],previous[key],key)}
});
test('interval qualities respect written scale degrees and enharmonic spelling',()=>{
  const qualities=scale=>Object.fromEntries(scaleFormula('C',scale).slice(0,-1).map(n=>[n.note,n.quality]));
  assert.deepEqual({...qualities('Major (Ionian)')},{C:'TÔNICA',D:'MAIOR',E:'MAIOR',F:'JUSTA',G:'JUSTA',A:'MAIOR',B:'MAIOR'});
  assert.equal(qualities('Natural Minor').Eb,'MENOR');assert.equal(qualities('Natural Minor').Ab,'MENOR');assert.equal(qualities('Natural Minor').Bb,'MENOR');
  assert.equal(qualities('Lydian')['F#'],'AUMENTADA');assert.equal(qualities('Locrian').Gb,'DIMINUTA');assert.equal(qualities('Whole Tone')['G#'],'AUMENTADA');
  assert.equal(intervalQuality('8',12),'JUSTA');
});
test('CHUG confirmation is the lowest available tonic, not necessarily the open low string',()=>{
  const tuning=[35,40,45,50,55,59,64];
  assert.equal(lowestRootMidi(tuning,22,'A'),45);
  assert.equal(lowestRootMidi([23,28,33,38,43],22,'C'),24);
});
