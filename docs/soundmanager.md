# AllSpark SoundManager Documentation

## Overview

**SoundManager** is the core audio abstraction for the AllSpark framework. It wraps Howler.js to provide a modular, SSR-safe, and extensible interface for all browser-based audio, including sound effects (SFX), music, and accessibility cues. SoundManager is designed to be the single source of truth for audio management, enabling robust state tracking, category-based control, and future-proofing for advanced features.

---

## Philosophy & Goals

- **SSR Safety:** All audio logic is client-only, preventing Next.js SSR errors.
- **Modularity:** Centralizes all sound registration, playback, and control.
- **Abstraction:** Shields the app from direct Howler.js usage, making it easy to swap out the backend if needed.
- **Extensibility:** Supports categories, subcategories, and future features (analytics, crossfading, etc.).
- **State Management:** Tracks global, per-category, and per-sound state for UI, debugging, and advanced control.
- **React Integration:** Provides hooks and event emitters for live state updates in React components.

---

## Architecture

### Sound Registry Structure

```
sounds = {
  music: { ... },
  sfx: {
    core: { ... },
    interface: { ... },
    aria: { ... }
  }
}
```
- **music:** Background tracks, loops, etc.
- **sfx.core:** Core game sounds (e.g., explosions, actions)
- **sfx.interface:** UI/UX sounds (e.g., button clicks)
- **sfx.aria:** Accessibility/ARIA cues

### API Structure

- `SoundManager.music.play('intro')`
- `SoundManager.sfx.core.play('click')`
- `SoundManager.sfx.interface.play('button')`
- `SoundManager.sfx.aria.play('screenReaderCue')`
- Global controls: `muteAll()`, `unmuteAll()`, `pauseAll()`, `playAll()`, `stopAll()`, `volumeAll(vol)`

---

## State Management

- Tracks per-sound state: `playing`, `paused`, `stopped`, `volume`, `loop`, `rate`, `lastPlayed`
- Tracks global state: `globalMute`, `globalVolume`
- State is updated on all relevant actions and Howler events
- Exposes `getAudioState()` for current state (deep copy)
- Exposes `subscribeToAudioState(fn)` for event-driven updates

### Type Definitions

```
export type SoundState = {
  playing: boolean;
  paused: boolean;
  stopped: boolean;
  volume: number;
  loop: boolean;
  rate: number;
  lastPlayed: number | null;
};

export type AudioState = {
  globalMute: boolean;
  globalVolume: number;
  music: Record<string, SoundState>;
  sfx: {
    core: Record<string, SoundState>;
    interface: Record<string, SoundState>;
    aria: Record<string, SoundState>;
  };
};
```

---

## React Integration

- `useSoundState()` hook provides live, reactive access to audio state for any component.
- Example usage:

```tsx
import { useSoundState } from '@/lib/sound/useSoundState';
const audioState = useSoundState();
```

---

## Test & Dev Tools

### Test Page (`/pages/test/audio.tsx`)
- UI to play, pause, stop, and control all registered sounds
- Displays live state for all sounds and categories
- Useful for QA, debugging, and verifying integration

### Dev Page (`/pages/test/dev.tsx`)
- Stub for diagnostics: Howler version, memory usage, event logs, live state
- To be expanded with more reporting and debugging tools

---

## Usage Examples

### Registering Sounds
```ts
// In initSoundManager()
registerHowl('sfx', 'core', 'click', new HowlClass({ src: ['/sfx/click.mp3'] }));
registerHowl('music', null, 'intro', new HowlClass({ src: ['/music/intro.mp3'], loop: true }));
```

### Playing Sounds
```ts
SoundManager.sfx.core.play('click');
SoundManager.music.play('intro');
```

### Global Controls
```ts
SoundManager.muteAll();
SoundManager.pauseAll();
SoundManager.volumeAll(0.5);
```

### Accessing State
```ts
import { getAudioState } from '@/lib/sound/SoundManager';
const state = getAudioState();
```

---

## Extension Points & Best Practices

- **Add new categories/subcategories** by extending the registry and API.
- **Register new sounds** in `initSoundManager()` using `registerHowl()`.
- **Never use Howler directly in components**—always use SoundManager.
- **Use state and hooks** for UI, analytics, and debugging.
- **Plan for future features:** crossfading, analytics, persistence, accessibility, etc.

---

## Future Directions

- Per-category and per-sound volume/mute controls
- Crossfading and music transitions
- Debounce/rate limiting for SFX
- Analytics and event logging
- Persistence of user preferences (localStorage, Zustand, etc.)
- Accessibility enhancements (ARIA cues, screen reader support)
- Dynamic sound registration (DLC, user content)
- Integration with routing/scene changes
- Advanced audio (spatial, multi-channel, audio sprites)

---

## Dynamic Sound Registration (Runtime)

- You can register new sounds at runtime using the test page or programmatically via:
  ```ts
  SoundManager.registerHowl(category, subcategory, key, { src: ['/sfx/yourfile.wav'] });
  ```
- The file path should be relative to the `public` directory and start with `/` (e.g., `/sfx/correct1.wav`).
- The UI will auto-correct missing leading slashes.
- After registration, the sound will immediately appear in the UI and in the live audio state JSON.
- If the file cannot be loaded, a clear error will be logged in the browser console.

---

## Debugging & Error Handling

- **Debug logs** are present for:
  - Registration flow (`registerHowlPublic`, `registerHowl`)
  - All play, pause, stop actions
  - All Howler events (`play`, `pause`, `stop`, `end`, `loaderror`)
- **If a sound does not play or appear:**
  - Check the browser console for errors or logs.
  - Ensure the file exists in the correct location under `public/`.
- **State is now updated immediately after registration** (no need to trigger Play All or other actions).

---

## UI/UX Notes (Test Page)

- The test page only shows sound tables for categories with registered sounds.
- The ARIA/Accessibility toggle is next to its label for clarity.
- The registration form is robust against missing leading slashes in file paths.
- All controls (play, pause, stop, etc.) are available for each registered sound immediately after registration.

---

## Summary

SoundManager is the backbone of AllSpark's audio system, providing a safe, extensible, and powerful interface for all browser-based audio. It is designed for modularity, future-proofing, and seamless integration with React and Next.js. Use it as your single point of contact for all sound and music needs in AllSpark projects. 