# AllSpark Framework: Sound, Music, and TTS Integration in Next.js

This guide outlines the best practices and required architecture for handling **sound**, **music**, and **text-to-speech (TTS)** in a Next.js-based application within the AllSpark framework.

---

## ✅ 1. Client-Only Audio Systems

Next.js runs both on the server and the client, but browser-based audio APIs only exist client-side.

* Wrap all usage of `Audio`, `window.speechSynthesis`, or `Howl` in `useEffect()` or `typeof window !== 'undefined'` guards.
* Avoid initializing audio in global scope or during SSR.

```ts
useEffect(() => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/audio/click.wav');
    audio.play();
  }
}, []);
```

---

## ✅ 2. Dynamic Imports for Audio Libraries

Some libraries (like `howler.js`) fail during SSR. Always dynamically import them:

```ts
const Howl = dynamic(() => import('howler').then(mod => mod.Howl), { ssr: false });
```

---

## ✅ 3. Static File Handling

* Store all audio assets in `/public/audio/`, `/public/sfx/`, or `/public/music/`
* Access them using root-relative paths:

```ts
const sound = new Audio('/audio/notification.mp3');
```

---

## ✅ 4. Environment-Sensitive Behavior

* Disable automatic sound in development to avoid clutter
* Guard playback triggers in dev environments

```ts
if (process.env.NODE_ENV !== 'development') {
  playSound();
}
```

---

## ✅ 5. TTS Support in Next.js

Use native browser TTS (`speechSynthesis`) with safety guards:

```ts
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const utterance = new SpeechSynthesisUtterance('Hello AllSpark');
  window.speechSynthesis.speak(utterance);
}
```

* Wrap this in a `TTSManager` module
* Consider fallback if no speech API is available

---

## ✅ 6. Optional API-Based TTS (e.g. OpenAI, ElevenLabs)

* API calls must route through `/api/tts.js` or similar server routes
* Never expose secret keys in frontend
* Use async fetch on the client only to access your protected routes

---

## ✅ 7. Audio Lifecycle & Navigation

* React to Next.js route changes for background music/sound

```ts
import { useRouter } from 'next/router';
useEffect(() => {
  const stop = () => soundManager.stop();
  router.events.on('routeChangeStart', stop);
  return () => router.events.off('routeChangeStart', stop);
}, []);
```

* Always require user gesture before initiating sound on mobile

---

## ✅ 8. SSR Safety Summary

* Never reference `window`, `Audio`, or `speechSynthesis` outside a hook
* Keep all sound logic modular and client-only
* Test audio components only in the browser

---

## ✅ Suggested Folder Layout

```
/lib/sound/
  SoundManager.js
  MusicManager.js
  TTSManager.js
/public/audio/
  click.wav
  intro.mp3
/components/audio/
  MuteToggle.js
```

---

## 🧩 Bonus: useSoundManager() Hook

Create a React hook that exposes:

* `playSFX(name)`
* `playMusic(trackId)`
* `speak(text)`
* `muteAll()` / `unmuteAll()`
* `stopAll()`

Hook manages global sound state and abstracts internal logic.

---

## 🚧 Coming Soon

* Centralized volume & mute controls
* Route-aware playback logic
* Music crossfade support
* Optional analytics of sound usage (client-only)

---

## Summary

AllSpark sound and TTS must:

* Be **client-only**, never SSR'd
* Be **modular** and hook-driven
* Use **static paths** for files
* Integrate with routing and gesture policies

This document ensures sound systems are safely integrated, extensible, and declarative inside any AllSpark application or game.

## SoundManager Code Review & Status (2024-xx-xx)

### Architecture & Best Practices
- **Centralized, SSR-safe SoundManager** wraps Howler.js and exposes a modular, extensible API for all browser-based audio.
- **Category-based registry**: Sounds are organized as `music`, `sfx.core`, `sfx.interface`, and `sfx.aria` for fine-grained control and future extensibility.
- **No direct Howler usage in components**: All sound logic is abstracted through SoundManager, making it easy to swap out the backend or add features.
- **State management**: Tracks global, per-category, and per-sound state (playing, paused, stopped, volume, etc.) and exposes a subscription/event system for React and dev tools.
- **React integration**: `useSoundState()` hook provides live, reactive access to audio state for any component.
- **Test/dev tools**: `/pages/test/audio.tsx` for QA and `/pages/test/dev.tsx` for diagnostics (WIP).

### Improvements & Comments
- **Comments and documentation** have been improved throughout the codebase for onboarding and maintainability.
- **Event-driven state**: All state changes (play, pause, stop, end) are tracked and can be subscribed to for UI/dev tools.
- **Extensibility**: The registry and API are designed for easy addition of new categories, subcategories, or features (e.g., analytics, crossfading, per-category mute).
- **Global controls**: `muteAll`, `pauseAll`, `playAll`, `stopAll`, and `volumeAll` are implemented for full-system control.
- **Future-proofing**: All logic is centralized and decoupled from Howler, enabling future backend swaps or advanced audio features.

### Open Issues & Technical Considerations
- **Per-category and per-sound volume/mute**: Only global controls are implemented; category-specific controls are a logical next step.
- **Persistence**: User preferences (mute, volume) are not yet persisted (e.g., localStorage, Zustand).
- **Event logs/analytics**: Not yet implemented, but the event system is ready for extension.
- **Memory usage and diagnostics**: Dev page is stubbed; memory and Howler version reporting are TODOs.
- **Dynamic sound registration**: All sounds are currently registered at init; runtime registration is not yet supported.
- **Accessibility**: ARIA/assistive cues are supported in the registry, but more features (e.g., toggling, user settings) could be added.
- **Crossfading/music transitions**: Not yet implemented.
- **Debounce/rate limiting**: Not yet implemented for SFX.

### Next Steps
- Implement per-category and per-sound volume/mute controls.
- Add persistence for user audio preferences.
- Expand dev diagnostics (Howler version, memory, event logs).
- Add analytics/event logging for sound usage.
- Support dynamic sound registration at runtime.
- Add crossfading and music transition utilities.
- Implement debounce/rate limiting for SFX.
- Continue improving accessibility features.

### Summary
SoundManager is now a robust, extensible, and well-documented foundation for AllSpark's audio subsystem. It is ready for integration, further feature development, and serves as a model for modular, future-proof browser audio management.
