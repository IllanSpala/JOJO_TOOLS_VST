# Porting map

Reference root: `../JOJO_TOOLS/` (read-only).

| Reference | Classification | Destination / treatment |
|---|---|---|
| `ScaleMachine.html` | DOM shell and feature inventory | React scale mode; site header/auth removed |
| `css/scale.css` | identity, modal and layout styles | Adapted in `frontend/src/styles.css`; proportional no-scroll fret grid |
| `css/instrument-ui.css` | shared fretboard geometry | Adapted to CSS Grid; 7 x 24 fits at 1600 x 900 |
| `css/menu.css` | palette/type/glass controls | Palette and Space Grotesk retained; plugin header replaces site nav |
| `js/scale.js` | music data plus strongly DOM-coupled controllers | Scales, degree-aware enharmonic spelling, formula steps, CHUG and tuning behavior ported to `music.js`/React |
| `js/instrument-tunings.js` | pure data | Selected presets ported to `music.js`; full preset parity remains |
| `js/audio-engine.js` | Web Audio output | Browser-only behavior behind `MockBridge`; must become native voices in JUCE |
| `FretboardTrainer.html` / CSS | trainer feature and layout | Integrated as second shared-state mode |
| `fretboard-trainer-core.js` | pure mapping, targets and YIN | Algorithm documented for native port; browser UI currently supports click-response practice |
| `fretboard-trainer.js` | DOM, getUserMedia, Web Audio analyser, localStorage | DAW input replaces getUserMedia in native layer; settings lifted to shared React state |
| `chord-designer.js` / `chord-preview.js` | chord UI plus shared math | UI intentionally omitted per requirement; no dependency imported |
| Firebase/auth/store | service/persistence coupling | Removed from plugin frontend; DAW state will use APVTS/state chunks |
| camera/MediaPipe modules | remote/camera coupling | Not exposed as an active feature; retained as a documented future product scope |

The frontend makes no runtime network request. It prefers Space Grotesk when installed and falls back to the system sans-serif; a bundled font asset may be added later without changing the offline contract.
