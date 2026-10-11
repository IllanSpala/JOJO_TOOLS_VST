import { midiFrequency } from './music.js';

export function scalePlaybackEvents(midis,stepSeconds=.42,noteSeconds=.55){return midis.map((midi,index)=>({midi,index,start:index*stepSeconds,duration:noteSeconds}))}
class MockBridge {
  constructor() { this.context=null; this.notesOutputDb=0; this.outputDb=0; this.voices=new Set(); this.playTimers=new Set(); this.generation=0; }
  async setParameter(id, db) {
    this[`${id}Db`] = db;
    localStorage.setItem(`jojo:${id}Db`, String(db));
  }
  getParameter(id) { return Number(localStorage.getItem(`jojo:${id}Db`) ?? 0); }
  async playNote(midi, duration=0.8, at=0,runId=this.generation) {
    this.context ??= new AudioContext();
    await this.context.resume();
    if(runId!==this.generation)return;
    const start = this.context.currentTime + at;
    const osc = this.context.createOscillator(), gain = this.context.createGain();
    osc.type = 'triangle'; osc.frequency.value = midiFrequency(midi);
    const notesGain=10**(this.notesOutputDb/20);
    gain.gain.setValueAtTime(0.0001,start); gain.gain.exponentialRampToValueAtTime(.18*notesGain,start+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain).connect(this.context.destination); osc.start(start); osc.stop(start+duration+.02);
    this.voices.add(osc); osc.onended=()=>this.voices.delete(osc);
  }
  playScale(midis,listeners={}) { this.stopNotes(); const runId=this.generation,events=scalePlaybackEvents(midis); events.forEach(event=>{this.playNote(event.midi,event.duration,event.start,runId);const timer=setTimeout(()=>{this.playTimers.delete(timer);listeners.onStep?.(event)},event.start*1000);this.playTimers.add(timer)});const duration=(events.at(-1)?.start+events.at(-1)?.duration||0)*1000,end=setTimeout(()=>{this.playTimers.delete(end);listeners.onEnd?.()},duration);this.playTimers.add(end);return {events,duration}; }
  stopNotes() { this.generation+=1;this.playTimers.forEach(clearTimeout);this.playTimers.clear();this.voices.forEach(osc=>{ try { osc.stop(); } catch {} }); this.voices.clear(); }
  requestInput() { return Promise.resolve({available:false, message:'A análise da entrada será fornecida pelo backend JUCE.'}); }
}

class JuceBridge {
  constructor(){this.playTimers=new Set()}
  nativeId(id){return id==='notesOutput'?'notesOutputGain':id==='output'?'mainOutputGain':id}
  setParameter(id,value) { window.__JUCE__.backend.emitEvent('setParameter',{id:this.nativeId(id),value}); }
  getParameter(id) { const key=this.nativeId(id),initial=window.__JUCE__.initialisationData?.[key],value=Array.isArray(initial)?initial[0]:initial;return Number(value ?? window.__JOJO_STATE__?.[key] ?? 0); }
  onParameterChange(listener){if(!window.__JUCE__.backend.addEventListener)return()=>{};const remove=window.__JUCE__.backend.addEventListener('parameterChanged',event=>listener(event));return typeof remove==='function'?remove:()=>{} }
  playNote(midi,duration=.8) { window.__JUCE__.backend.emitEvent('playNote',{midi,duration}); }
  playScale(midis,listeners={}) { this.stopNotes();const events=scalePlaybackEvents(midis);window.__JUCE__.backend.emitEvent('playScale',{midis,events});const duration=(events.at(-1)?.start+events.at(-1)?.duration||0)*1000;events.forEach(event=>{const timer=setTimeout(()=>{this.playTimers.delete(timer);listeners.onStep?.(event)},event.start*1000);this.playTimers.add(timer)});const end=setTimeout(()=>{this.playTimers.delete(end);listeners.onEnd?.()},duration);this.playTimers.add(end);return {events,duration}; }
  stopNotes() { this.playTimers.forEach(clearTimeout);this.playTimers.clear();window.__JUCE__.backend.emitEvent('stopNotes',{}); }
  requestInput() { window.__JUCE__.backend.emitEvent('requestPitchAnalysis',{}); return Promise.resolve({available:true}); }
}

const browserWindow=globalThis.window;
export const bridge = browserWindow?.__JUCE__?.backend ? new JuceBridge() : new MockBridge();
export const isNative = bridge instanceof JuceBridge;
