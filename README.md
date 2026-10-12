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

Import the repository into Vercel as a Vite project. The included configuration builds to `dist` and caches audio assets. No environment variables, database or server functions are required. Vercel Hobby is for personal, non-commercial use. Audio is fetched on demand and decoded buffers are reused for the session; long listening sessions do not repeatedly download loops.

## Included

- Seven scene presets, including an “All sounds” scenario containing every loop and sound effect, editable mixes and 28 original recordings (up to 32 layers per mix), organised into separate Ambience loops and Sound effects tabs with matching add-sound libraries.
- Continuous loops with a short boundary crossfade. Every automated loop volume change uses a steady 10-second linear fade, including transitions to silence. Loop target changes are spaced at least 10 seconds apart so each fade can finish; manual volume and mute changes remain responsive. The “Auto mode” master control sits above both tabs. Its on/off switch enables automation, and its intensity slider stays visible and is disabled while Auto mode is off; when enabled, it controls how often participating sounds change; each loop has Min volume / Max volume limits and Chance to silence as sliders, with Slow / Medium / Frequent timing underneath, shown only while auto mode is enabled. Sliders support mouse, touch and native keyboard adjustment. Turning off master automation returns loops to their chosen manual volume. Automation settings and the master intensity value are preserved. There are no per-sound auto opt-out switches; all sounds follow the master.
- At the default master setting of 35, Slow changes occur approximately every 45–90 seconds, Medium every 20–45 seconds, and Frequent every 8–20 seconds. Higher master settings shorten these intervals. Saved percentage settings are migrated to these choices. The master controls all sounds: loops vary volume, while effects vary frequency. With the master off, effects keep their chosen rate with random timing.
- Random occasional sounds with a chosen mean occurrence rate, pitch variation and a per-layer voice limit. Auto mode smoothly drifts effect occurrence rates within per-effect Min auto frequency / Max auto frequency limits while master evolution is enabled. Frequency and its Min auto frequency / Max auto frequency limits are displayed as activity percentages. Internally, 100% maps to 20 mean occurrences per minute (so 30% maps to 6); Frequency is the manual rate and starting point; when automation starts it is clamped to the chosen limits. Automatic limits range from 0% to 100% (0 to 20 mean occurrences per minute), maintain their ordering, and are hidden while master evolution is off. Existing mixes migrate their old implicit range into explicit limits. Manual mute is always respected. With auto mode off, zero Frequency silences an effect; with auto mode on, its auto frequency limits govern the rate. Effects also have Chance to silence. Each automatic pass can set Frequency to 0% for a temporary quiet period, even with a nonzero Min auto frequency. Existing sounds finish playing; no new occurrences are scheduled until a later pass chooses an active frequency. Manual mute stays unchanged. Bounds edits preserve the quiet period, and turning Auto mode off restores the manual Frequency.
- All numeric controls use sliders, including master volume, auto-mode intensity, loop volume and auto-frequency limits. Loops and effects share compact headers, main slider groups, green automation boxes and action rows. Loop Volume and effect Frequency stay visible. Remaining controls sit in a “More controls” section that starts collapsed; automation boxes inside it have no separate collapse toggle and appear when Auto mode is enabled.
- The “All sounds” scenario sets every effect to 0–60% volume, 5% pitch variation, 5% Frequency, 0–10% auto frequency and 8% Chance to silence; every loop uses 5–50% Auto mode volume limits.
- Each effect has four primary sliders: Frequency, Min volume, Max volume and Pitch variation. Every event and preview chooses a volume within the explicit limits; there is no extra overall effect volume multiplier. Old mixes migrate their former volume into corresponding 70–100% limits. Auto-frequency limits are hidden unless master auto mode is enabled.
- While Auto mode is enabled, effect Frequency and loop Volume sliders have flowing gold fills and thumbs; reduced-motion preferences keep the gold styling without animation. During playback, these sliders follow live engine values and are read-only. Manual settings are retained and return when automation is switched off. Live values are presentation state, not saved mix settings.
- A spatial audio on/off switch on each occasional sound. When enabled, every playback (including previews) gets a new random direction over the full 3D sphere around the listener, at a fixed distance of 3 audio units. Distance attenuation is disabled so Min/Max volume remains responsible for loudness variation. Continuous ambience keeps its stereo field. No direction, distance, height or boundary controls.
- Saved mixes and links from the first prototype are migrated: the former global spatial setting becomes the default for each effect, and former position controls are discarded.
- While Auto mode is on, Randomise picks every loop Volume and effect Frequency within its configured limits. Playing loops keep their 10-second fades; effect frequencies update immediately. Paused values are shown as read-only Auto values and applied on playback. Editing bounds clamps queued values immediately; disabling Auto mode or removing a layer clears its queued values. Manual settings and bounds are preserved; muted sounds stay muted. Chance to silence applies to both sound types during Randomise: selected loops fade to 0% and selected effects stop new occurrences at Frequency 0%; otherwise each value stays within its Min/Max limits.
- Master volume and a compressor to manage combined peaks.
- Local saved scenes, shareable links, JSON export/import and a sleep timer.
- Keyboard controls, labelled sliders, responsive layout and reduced motion support.

Headphones give the best spatial effect. Browser HRTFs are generic, so front/back and elevation perception vary by person. There is no headset tracking. Background and screen-locked playback depends on browser/OS policies, especially on mobile. Worker scheduling reduces interference from UI activity, but browser suspension can still interrupt occasional events. A sleep timer finishes when the page is able to run again if the browser has suspended it.

The original audio is retained from Mark's 2015 prototype in `~/Sites/misc/virtual-ambience`. Source assets have not been replaced or relicensed. Before a wider public release, confirm the original recording rights and evaluate playback on target phones and headphones.

## Source layout

- `src/data.ts`: sound catalogue, scene templates, mix types and import validation.
- `src/audio/engine.ts`: audio graph, buffers, looping, fading and spatial events.
- `src/audio/clock.ts`: scheduling heartbeat worker.
- `src/App.tsx`: scene selection, playback state, dialogs and sharing.
- `src/SoundLayer.tsx`: loop/effect controls and Auto mode settings.
- `src/Modal.tsx` and `src/SoundIcon.tsx`: shared interface components.
- `src/storage.ts`: saved mixes and initial scene loading.
- `src/Slider.tsx`: shared percentage sliders and live automated values.
- `src/Scenery.tsx`: original SVG landscape artwork.
- `src/styles.css`: responsive interface.
