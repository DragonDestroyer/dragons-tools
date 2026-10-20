# Dragons Tools - TimeStretch Player

Desktop version inspired by [29a.ch/timestretch](https://29a.ch/timestretch/).

## Features
- Similar UI and feel to the original web app
- Load single tracks or entire folders as playlists
- Sequential playback of songs in a folder
- Stretch (speed), Pitch, Tune, and Volume controls
- Runs as a native EXE (no browser required)

## Setup & Build

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development:
   ```bash
   npm start
   ```

3. Build Windows EXE:
   ```bash
   npm run dist
   ```

The built EXE will be in the `dist/` folder.

## Notes
- Current stretch uses `playbackRate` (affects pitch). For true independent time-stretching (like the original), integrate a library such as SoundTouch or a phase vocoder.
- Waveform is a simple placeholder; full waveform rendering can be added with peaks.js or similar.
- Original TimeStretch Player is copyrighted by Jonas Wagner. This is an independent recreation with added playlist features.

## License
MIT