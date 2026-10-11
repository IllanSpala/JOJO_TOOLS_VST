import test from 'node:test';
import assert from 'node:assert/strict';
import { scalePlaybackEvents } from './bridge.js';
import { ascendingScaleMidis } from './music.js';

test('playback events are the single ordered source for five through eight-note formulas',()=>{
  for(const scale of ['Pentatonic Major','Blues','Major (Ionian)','Diminished (HW)']){
    const midis=ascendingScaleMidis('C',scale),events=scalePlaybackEvents(midis);
    assert.equal(events.length,midis.length);
    assert.deepEqual(events.map(e=>e.index),midis.map((_,index)=>index));
    assert.deepEqual(events.map(e=>e.midi),midis);
    assert.ok(events.every((event,index)=>event.start===index*.42&&event.duration===.55));
  }
});
