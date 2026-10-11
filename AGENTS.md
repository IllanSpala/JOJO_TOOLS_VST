# JOJO_TOOLS_VST contributor notes

- `../JOJO_TOOLS/` is the immutable reference application. Never edit, move, rename, delete, format, or run mutating Git commands in that sibling repository.
- Port only the files and ideas required by this plugin. Do not mirror the whole reference repository.
- The suite root owns shared build configuration; each product lives in `plugins/<id>/` with its own frontend and native implementation.
- The initial editor design size is 1600 x 900. The primary fretboard must fit seven strings and 24 frets without scrollbars.
- Keep musical logic independent from React and JUCE UI code. Browser development uses `MockBridge`; the plugin uses `JuceBridge`.
- Never call a WebView or allocate/block from the audio thread. UI-to-audio reference notes use the fixed-capacity command FIFO.
- Keep physical artifact names Windows-safe. The first product target/bundle is `OndeEQueEuTo`; its host-facing name remains `Onde é que eu tô?`.
- A Windows/REAPER build is not validated until it is actually built and run there.
