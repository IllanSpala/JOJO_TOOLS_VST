export const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const NOTES_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const ROOTS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

// Ported from ../JOJO_TOOLS/ferramentas/js/scale.js.
export const SCALES = {
  'Major (Ionian)': { name:'Maior (Jônio)', intervals:[0,2,4,5,7,9,11], degrees:['1','2','3','4','5','6','7'] },
  'Natural Minor': { name:'Menor Natural', intervals:[0,2,3,5,7,8,10], degrees:['1','2','b3','4','5','b6','b7'] },
  'Harmonic Minor': { name:'Menor Harmônica', intervals:[0,2,3,5,7,8,11], degrees:['1','2','b3','4','5','b6','7'] },
  'Melodic Minor': { name:'Menor Melódica', intervals:[0,2,3,5,7,9,11], degrees:['1','2','b3','4','5','6','7'] },
  'Pentatonic Major': { name:'Pentatônica Maior', intervals:[0,2,4,7,9], degrees:['1','2','3','5','6'] },
  'Pentatonic Minor': { name:'Pentatônica Menor', intervals:[0,3,5,7,10], degrees:['1','b3','4','5','b7'] },
  Blues: { name:'Blues', intervals:[0,3,5,6,7,10], degrees:['1','b3','4','b5','5','b7'] },
  Dorian: { name:'Dórico', intervals:[0,2,3,5,7,9,10], degrees:['1','2','b3','4','5','6','b7'] },
  Phrygian: { name:'Frígio', intervals:[0,1,3,5,7,8,10], degrees:['1','b2','b3','4','5','b6','b7'] },
  Lydian: { name:'Lídio', intervals:[0,2,4,6,7,9,11], degrees:['1','2','3','#4','5','6','7'] },
  Mixolydian: { name:'Mixolídio', intervals:[0,2,4,5,7,9,10], degrees:['1','2','3','4','5','6','b7'] },
  Locrian: { name:'Lócrio', intervals:[0,1,3,5,6,8,10], degrees:['1','b2','b3','4','b5','b6','b7'] },
  'Whole Tone': { name:'Tons Inteiros', intervals:[0,2,4,6,8,10], degrees:['1','2','3','#4','#5','b7'] },
  'Diminished (HW)': { name:'Diminuta (Semitom/Tom)', intervals:[0,1,3,4,6,7,9,10], degrees:['1','b2','b3','3','b5','5','6','b7'] }
};

export const TUNINGS = {
  guitar: {
    'Standard (E A D G B E)':[40,45,50,55,59,64], 'Drop D (D A D G B E)':[38,45,50,55,59,64],
    'Open G (D G D G B D)':[38,43,50,55,59,62], 'Open D (D A D F# A D)':[38,45,50,54,57,62],
    DADGAD:[38,45,50,55,57,62], 'Half Step Down (Eb)':[39,44,49,54,58,63], 'Full Step Down (D)':[38,43,48,53,57,62]
  },
  bass: {
    'Standard (E A D G)':[28,33,38,43], 'Drop D (D A D G)':[26,33,38,43], '5-string (B E A D G)':[23,28,33,38,43],
    'Half Step Down (Eb)':[27,32,37,42], 'Full Step Down (D)':[26,31,36,41]
  }
};

const NATURAL_PC = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const LETTERS = ['C','D','E','F','G','A','B'];

export function pitchClass(note) {
  const match = String(note).replace(/♯/g,'#').replace(/♭/g,'b').match(/^([A-G])([#b]{0,2})$/);
  if (!match) return -1;
  return (NATURAL_PC[match[1]]+[...match[2]].reduce((sum,a)=>sum+(a==='#'?1:-1),0)+24)%12;
}
function spellPitch(pc,letter) {
  const diff=(pc-NATURAL_PC[letter]+12)%12;
  return diff===0?letter:diff===1?`${letter}#`:diff===2?`${letter}##`:diff===11?`${letter}b`:diff===10?`${letter}bb`:null;
}
export function scaleNotes(root,scaleKey) {
  const rootPc=pitchClass(root),scale=SCALES[scaleKey],rootLetterIndex=LETTERS.indexOf(root[0]);
  return scale.intervals.map((interval,index)=>{
    const pc=(rootPc+interval)%12,degree=scale.degrees[index];
    if(index===0)return {note:root,pc,degree,interval};
    const degreeNumber=Number(degree.replace(/[^0-9]/g,'')),letter=LETTERS[(rootLetterIndex+degreeNumber-1)%7];
    return {note:spellPitch(pc,letter)||(root.includes('b')?NOTES_FLAT[pc]:NOTES_SHARP[pc]),pc,degree,interval};
  });
}
export function chromaticName(pc,root){const normalized=((pc%12)+12)%12;if(pitchClass(root)===normalized)return root;return root.includes('b')?NOTES_FLAT[normalized]:NOTES_SHARP[normalized]}
export const midiFrequency=midi=>440*2**((midi-69)/12);
export const midiOctave=midi=>Math.floor(midi/12)-1;
export const stepIntervals=scaleKey=>SCALES[scaleKey].intervals.map((value,index,array)=>(index===array.length-1?12:array[index+1])-value);
export const stepLabel=semitones=>semitones===1?'ST':semitones===2?'T':semitones===3?'T½':String(semitones);
export function ascendingScaleMidis(root,scaleKey,base=48){const rootPc=pitchClass(root),values=scaleNotes(root,scaleKey).map(({pc})=>base+pc+(pc<rootPc?12:0));return [...values,base+rootPc+12]}
const PERFECT_DEGREES=new Set([1,4,5,8]);
const PERFECT_NAMES={0:'JUSTA',1:'AUMENTADA','-1':'DIMINUTA'};
const MAJOR_NAMES={0:'MAIOR','-1':'MENOR',1:'AUMENTADA','-2':'DIMINUTA'};
export function intervalQuality(degree,semitones){
  const number=Number(String(degree).match(/\d+/)?.[0]);
  if(!number)return '';
  if(number===1&&semitones===0)return 'TÔNICA';
  const simple=((number-1)%7)+1,octaves=Math.floor((number-1)/7),natural={1:0,2:2,3:4,4:5,5:7,6:9,7:11}[simple]+octaves*12,delta=semitones-natural;
  return (PERFECT_DEGREES.has(number)?PERFECT_NAMES[delta]:MAJOR_NAMES[delta])||`${delta>0?'+':''}${delta}`;
}
export function scaleFormula(root,scaleKey){return [...scaleNotes(root,scaleKey).map(note=>({...note,quality:intervalQuality(note.degree,note.interval)})),{note:root,pc:pitchClass(root),degree:'8',interval:12,quality:'JUSTA'}]}
export const additionalStringCount=instrument=>instrument==='bass'?5:7;
export function tuningFor(state){const preset=TUNINGS[state.instrument]?.[state.tuningName]||Object.values(TUNINGS[state.instrument])[0];const base=Array.isArray(state.customMidis)&&state.customMidis.length===preset.length?[...state.customMidis]:[...preset],target=additionalStringCount(state.instrument);if(!state.chugActive||base.length>=target)return base;return [Number.isInteger(state.chugMidi)?state.chugMidi:base[0]-5,...base]}
export function lowestRootMidi(tuning,frets,root){const target=pitchClass(root);return tuning.flatMap(open=>Array.from({length:frets+1},(_,f)=>open+f)).filter(midi=>((midi%12)+12)%12===target).sort((a,b)=>a-b)[0]??null}
export function randomizeScaleState(state,random=Math.random){const roots=ROOTS,scales=Object.keys(SCALES);return {...state,root:roots[Math.floor(random()*roots.length)],scale:scales[Math.floor(random()*scales.length)]}}
