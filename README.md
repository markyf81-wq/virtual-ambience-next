# Virtual Ambience

A new web version of the original Virtual Ambience sound scene generator. React, TypeScript, Vite and native Web Audio. All audio processing happens in the listener's browser; hosting only serves the application and recordings.

## Local development

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

The public app is hosted at https://markyf81-wq.github.io/virtual-ambience-next/ on GitHub Pages. The GitHub Actions workflow builds and deploys `dist` whenever `main` is pushed; it can also be run manually. Repository Settings → Pages must use GitHub Actions as the source.

For a local production preview matching the GitHub Pages subdirectory:

```sh
npm run build -- --mode github-pages
npm run preview
```

Open `/virtual-ambience-next/` on the preview server. The default development and build commands still serve from `/`, allowing other static hosts or a custom domain. The `github-pages` mode sets Vite's base path, which is also used by all audio URLs. If the repository is renamed, update that path in `vite.config.ts`.

No environment variables, database or server functions are required. Audio is fetched on demand and decoded buffers are reused for the session; long listening sessions do not repeatedly download loops. Shared mixes use the URL fragment and personal saved mixes use browser storage. A future community of published scenes and votes would need a separate backend; GitHub Pages can continue to serve its interface.

## Included

- Three sound collections: Nature, Urban and Space. There are 60 recordings (38 loops and 22 effects, up to 64 layers per mix), organised into separate Ambience loops and Sound effects tabs. The add-sound library first selects a collection, then offers its categories and search. Mixes can contain sounds from any collection. Existing saved mixes and links keep their sound IDs and settings.
- Nine curated scenes plus one “All sounds” preset per collection: five Nature scenes, two Urban scenes and two Space scenes. Curated mixes contain 11–17 layers, and every recording appears in at least one of them. The scene browser filters by collection, and changing its filter does not switch the playing mix. Selecting a preset or loading a saved mix sets the library’s default collection to that scene’s collection.
- “Start blank” is available above the collection selector. It clears all sound layers, pauses playback and cancels the sleep timer while keeping master volume and Auto mode preferences. Blank mixes can be saved and shared; resetting one returns it to an empty soundscape.
- Continuous loops with a short boundary crossfade. Ordinary Auto mode loop volume changes use a steady 10-second linear fade, including transitions to silence. Loop target changes are spaced at least 10 seconds apart so each fade can finish; manual volume and mute changes remain responsive. The “Auto mode” master control sits above both tabs. Its on/off switch enables automation, and its intensity slider stays visible and is disabled while Auto mode is off; when enabled, it controls how often participating sounds change; each loop has Min volume / Max volume limits and Chance to silence as knobs, with Slow / Medium / Frequent timing underneath, shown only while auto mode is enabled. Sliders support mouse, touch and native keyboard adjustment. Turning off master automation returns loops to their chosen manual volume. Automation settings and the master intensity value are preserved. There are no per-sound auto opt-out switches; all sounds follow the master.
- At the default master setting of 35, Slow changes occur approximately every 45–90 seconds, Medium every 20–45 seconds, and Frequent every 8–20 seconds. Higher master settings shorten these intervals. Saved percentage settings are migrated to these choices. The master controls all sounds: loops vary volume, while effects vary frequency. With the master off, effects keep their chosen rate with random timing.
- Random occasional sounds with a chosen mean occurrence rate, pitch variation and a per-layer voice limit. Auto mode smoothly drifts effect occurrence rates within per-effect Min frequency / Max frequency limits while master evolution is enabled. Frequency and its Min frequency / Max frequency limits are displayed as activity percentages. Internally, 100% maps to 20 mean occurrences per minute (so 30% maps to 6); Frequency is the manual rate and starting point; when automation starts it is clamped to the chosen limits. Automatic limits range from 0% to 100% (0 to 20 mean occurrences per minute), maintain their ordering, and are hidden while master evolution is off. Existing mixes migrate their old implicit range into explicit limits. Manual mute is always respected. With auto mode off, zero Frequency silences an effect; with auto mode on, its auto frequency limits govern the rate. Effects also have Chance to silence. Each automatic pass can set Frequency to 0% for a temporary quiet period, even with a nonzero Min frequency. Existing sounds finish playing; no new occurrences are scheduled until a later pass chooses an active frequency. Manual mute stays unchanged. Bounds edits preserve the quiet period, and turning Auto mode off restores the manual Frequency.
- Sound controls form the primary workspace, with playback and master controls at the top and global Auto mode beside them when space allows, two independent sound card columns on wider screens so expanded controls only move cards in their own column, and scene selection in a smaller secondary column. On narrow screens, controls appear before scenes.
- Main numeric controls use sliders, including master volume, Auto mode intensity, loop Volume and effect Frequency. The three limits inside each sound’s Auto mode panel use mouse-angle rotary knobs: loops have Min volume, Max volume and Chance to silence; effects have Min frequency, Max frequency and Chance to silence. Knobs support keyboard adjustment and capture the pointer so a drag stays on the knob first grabbed. Loops and effects share compact headers, main slider groups, green automation boxes and action rows. Loop Volume and effect Frequency stay visible. Remaining controls sit in a “More controls” section that starts collapsed; automation boxes inside it have no separate collapse toggle and appear when Auto mode is enabled.
- Nature combines the smaller themes into Forest day (15 layers), Forest storm (17), Night wetlands (13), Jungle rain (11) and Forest retreat (11). Forest storm copies Mark’s saved “Best” mix: nine loops and eight effects, including its volumes, automation limits, silence chances, pitch and spatial settings. Forest day combines birds, summer insects and a river; Night wetlands combines dusk, night and frog themes; Forest retreat brings together fire, evening wildlife and occasional music or gongs. Supporting layers use quieter levels and more silence chances so a richer mix can still have space.
- Former preset IDs map to their closest consolidated scene when loading saved mixes or shared links. Their saved sound layers, names and settings remain intact; only the associated scene artwork and collection reference migrate.
- Urban combines its recordings into City life (12 layers) and Rainy city (13), including traffic, crowds, birds, machinery, vehicles and bells. Rainy city also uses Nature rain, wind and distant thunder. Space combines ship and station sounds into Starship voyage (11 layers), with cosmic and alien textures in Deep space (11). Urban retains skyline artwork and Space retains starfields, planets and station artwork.
- “All Nature sounds” contains the original 33-sound mix and keeps its `all` scene ID. “All Urban sounds” and “All Space sounds” contain their respective 13 and 14 recordings. These exploration presets set every effect to 0–60% volume, 5% pitch variation, 5% Frequency, 0–10% auto frequency and 8% Chance to silence; every loop uses 5–50% Auto mode volume limits.
- Each effect has four primary sliders: Frequency, Min volume, Max volume and Pitch variation. Every event and preview chooses a volume within the explicit limits; there is no extra overall effect volume multiplier. Old mixes migrate their former volume into corresponding 70–100% limits. Auto-frequency limits are hidden unless master auto mode is enabled.
- Effect Frequency and loop Volume sliders turn gold and glow only during an Auto mode update, returning to green between updates and while paused. Instant frequency changes briefly highlight the update; slow fades and frequency drifts stay highlighted until they settle. Reduced-motion preferences disable the animation. During playback, these sliders follow live engine values and are read-only. Manual settings are retained and return when automation is switched off. Live values are presentation state, not saved mix settings.
- A spatial audio on/off switch on each occasional sound. When enabled, every playback (including previews) gets a new random direction over the full 3D sphere around the listener, at a fixed distance of 3 audio units. Distance attenuation is disabled so Min/Max volume remains responsible for loudness variation. Continuous ambience keeps its stereo field. No direction, distance, height or boundary controls.
- Saved mixes and links from the first prototype are migrated: the former global spatial setting becomes the default for each effect, and former position controls are discarded.
- While Auto mode is on, Shuffle picks every loop Volume and effect Frequency within its configured limits. Normal playing-loop changes keep their 10-second fades; effect frequencies update immediately. Paused values are shown as read-only Auto values and applied on playback. Editing bounds clamps queued values immediately; disabling Auto mode or removing a layer clears its queued values. Manual settings and bounds are preserved; muted sounds stay muted. Chance to silence applies to both sound types during Shuffle: selected loops fade to 0% and selected effects stop new occurrences at Frequency 0%; otherwise each value stays within its Min/Max limits.
- Auto mode keeps at least one eligible, unmuted loop active, including during Shuffle and paused Shuffle values. If every automatic choice is silent or too quiet, the safeguard raises one loop to its configured Max volume. It treats 10% as the normal activity threshold; when all maxima are below that, the highest available maximum sets the threshold instead. An outgoing audible loop is held until another has faded up, so a handover cannot send all loops to silence. Startup or recovery from an already quiet mix uses a brief fade; normal volume changes remain slow. Manual mute, zero maximum volume and master volume remain intentional controls; no loops are forced on when every loop is muted or has a zero maximum. Effect silence chances remain independent.
- Master volume and a compressor to manage combined peaks.
- Both add-sound libraries have separate Preview/Stop buttons. Previews play up to 10 seconds at the master volume, one at a time, and stop when the dialog closes, a sound is added, or filtering hides the previewed sound.
- Local saved scenes, shareable links, JSON export/import and a sleep timer.
- Keyboard controls, labelled sliders, responsive layout and reduced motion support.

Headphones give the best spatial effect. Browser HRTFs are generic, so front/back and elevation perception vary by person. There is no headset tracking. Background and screen-locked playback depends on browser/OS policies, especially on mobile. Worker scheduling reduces interference from UI activity, but browser suspension can still interrupt occasional events. A sleep timer finishes when the page is able to run again if the browser has suspended it.

The original audio is retained from Mark's 2015 prototype in `~/Sites/misc/virtual-ambience`. Source assets have not been replaced or relicensed. The additional “Crackling fire” loop comes from Mark’s downloaded `444127__lurpsis__lit-fireplace.flac`; it was converted to stereo 48 kHz MP3 with a 1.5-second wraparound crossfade. Four further CC0 recordings—forest birdsong, Malaysian jungle at night, rain on leaves and layered gongs—were converted with wraparound crossfades and constant peak gain. Sources and edit details are recorded in `public/audio/CREDITS.md`. Before a wider public release, confirm the original recording rights and evaluate playback on target phones and headphones.

Mark supplied 27 Urban and Space OGG recordings in `~/Downloads/Urban` and `~/Downloads/Space`. Their Ambience folders become loops and their Sounds folders become effects. Converted app assets are stored under `public/audio/urban` and `public/audio/space`, with filenames and conversion details in `public/audio/IMPORTED-SOURCES.md`. Originals were left untouched.

## Source layout

- `src/data.ts`: sound catalogue, scene templates, mix types and import validation.
- `src/importedSounds.ts`: Urban and Space sound metadata and asset paths.
- `src/CollectionPicker.tsx`: collection selectors for scenes and sound libraries.
- `src/audio/engine.ts`: audio graph, buffers, looping, fading and spatial events.
- `src/audio/clock.ts`: scheduling heartbeat worker.
- `src/App.tsx`: scene selection, playback state, dialogs and sharing.
- `src/SoundColumns.tsx`: independent sound card columns and a single ordered column on narrow screens.
- `src/SoundLayer.tsx`: loop/effect controls and Auto mode settings.
- `src/LibrarySounds.tsx`: add-sound rows and short, cancellable audio previews.
- `src/Modal.tsx` and `src/SoundIcon.tsx`: shared interface components.
- `src/storage.ts`: saved mixes and initial scene loading.
- `src/Slider.tsx`: shared percentage sliders and live automated values.
- `src/Knob.tsx`: rotary knobs for per-sound Auto mode limits.
- `src/Scenery.tsx`: original SVG landscape artwork.
- `src/CollectionScenery.tsx`: Urban skylines and Space artwork.
- `src/styles.css`: responsive interface.
