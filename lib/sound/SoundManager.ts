// SoundManager: Unified interface for all sound playback in AllSpark.
// Provides SSR safety, modularity, and a robust, extensible API for browser-based audio in the AllSpark framework.
// Supports nested categories: music, sfx.core, sfx.interface, sfx.aria for fine-grained control and future extensibility.
// All sound logic is centralized here to enable easy integration, testing, and future backend swaps (e.g., replacing Howler.js).

import type { Howl } from 'howler';

// --- Sound Registry ---
// All registered Howl instances are stored here, organized by category and subcategory.
// Extend this structure to add new categories or subcategories as your project grows.
const sounds = {
  music: {} as Record<string, Howl>,
  sfx: {
    core: {} as Record<string, Howl>,
    interface: {} as Record<string, Howl>,
    aria: {} as Record<string, Howl>
  },
  multitrack: {} as Record<string, Howl>,
};

let HowlClass: typeof Howl | undefined;
let Howler: any;

// --- State Management Types ---
// These types define the shape of the audio state tracked by SoundManager.
// Extend SoundState to track additional properties as needed (e.g., error, duration).
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

// --- Internal state object ---
// This object is the single source of truth for all audio state in the app.
let audioState: AudioState = {
  globalMute: false,
  globalVolume: 1,
  music: {},
  sfx: {
    core: {},
    interface: {},
    aria: {}
  }
};

// --- Simple event emitter for state changes ---
// Used to notify React hooks and other listeners of state updates.
type StateListener = (state: AudioState) => void;
const listeners: StateListener[] = [];
function emitState() {
  listeners.forEach(fn => fn(audioState));
}
/**
 * Subscribe to audio state changes. Returns an unsubscribe function.
 * Used by React hooks and dev tools for live updates.
 */
export function subscribeToAudioState(fn: StateListener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

// --- Helper to update state for a sound ---
// Call this whenever a sound's state changes (e.g., on play, pause, stop, end).
function updateSoundState(category: 'music' | 'sfx' | 'multitrack', subcategory: string | null, key: string, partial: Partial<SoundState>) {
  if (category === 'music') {
    audioState.music[key] = { ...audioState.music[key], ...partial };
  } else if (category === 'sfx' && subcategory && audioState.sfx[subcategory]) {
    audioState.sfx[subcategory][key] = { ...audioState.sfx[subcategory][key], ...partial };
  } else if (category === 'multitrack') {
    // TODO: Add state tracking for multitrack sounds if needed in the future.
    // For now, skip updating state for multitrack.
  }
  emitState();
}

// --- Patch Howl registration to initialize state and add event listeners ---
// Use this function to register all new sounds in initSoundManager.
// It ensures state is initialized and kept in sync with Howler events.
function registerHowl(category: 'music' | 'sfx' | 'multitrack', subcategory: string | null, key: string, howl: Howl) {
  console.log('registerHowl called', { category, subcategory, key, howl });
  // Initialize state for this sound
  const state: SoundState = {
    playing: false,
    paused: false,
    stopped: true,
    volume: howl.volume(),
    loop: howl.loop(),
    rate: howl.rate(),
    lastPlayed: null
  };
  if (category === 'music') {
    sounds.music[key] = howl;
    audioState.music[key] = state;
  } else if (category === 'sfx' && subcategory && sounds.sfx[subcategory]) {
    sounds.sfx[subcategory][key] = howl;
    audioState.sfx[subcategory][key] = state;
  } else if (category === 'multitrack') {
    sounds.multitrack[key] = howl;
    // Optionally, add state tracking for multitrack if needed in the future
  }
  // Attach Howler event listeners to keep state in sync
  howl.on('play', (id: number) => {
    console.log('Howler event: play', { category, subcategory, key, id });
    updateSoundState(category as any, subcategory, key, {
      playing: true,
      paused: false,
      stopped: false,
      lastPlayed: Date.now()
    });
  });
  howl.on('pause', (id: number) => {
    console.log('Howler event: pause', { category, subcategory, key, id });
    updateSoundState(category as any, subcategory, key, {
      playing: false,
      paused: true
    });
  });
  howl.on('stop', (id: number) => {
    console.log('Howler event: stop', { category, subcategory, key, id });
    updateSoundState(category as any, subcategory, key, {
      playing: false,
      paused: false,
      stopped: true
    });
  });
  howl.on('end', (id: number) => {
    console.log('Howler event: end', { category, subcategory, key, id });
    updateSoundState(category as any, subcategory, key, {
      playing: false,
      paused: false,
      stopped: true
    });
  });
  // Add error event handler
  howl.on('loaderror', (id: number, err: any) => {
    console.error('Howler failed to load sound', { category, subcategory, key, err, src: (howl as any)._src });
  });
  emitState(); // Ensure state is updated after registration
}

/**
 * Initializes the SoundManager by dynamically importing Howler and registering sounds.
 * Call this once on the client (e.g., in a useEffect in your app or test page).
 * Extend this function to register more sounds or categories as needed.
 *
 * Example usage:
 *   useEffect(() => { initSoundManager(); }, []);
 */
export async function initSoundManager() {
  if (typeof window !== 'undefined' && !HowlClass) {
    const howler = await import('howler');
    HowlClass = howler.Howl;
    Howler = howler.Howler;
    // --- Register SFX: Core Game Sounds ---
    registerHowl('sfx', 'core', 'click', new HowlClass({ src: ['/sfx/click.mp3'] }));
    registerHowl('sfx', 'core', 'alert', new HowlClass({ src: ['/sfx/alert.wav'] }));
    // --- Register SFX: Interface/UI Effects ---
    // registerHowl('sfx', 'interface', 'button', new HowlClass({ src: ['/sfx/button.mp3'] }));
    // --- Register SFX: ARIA/Accessibility ---
    // registerHowl('sfx', 'aria', 'screenReaderCue', new HowlClass({ src: ['/sfx/aria-cue.mp3'] }));
    // --- Register Music ---
    // registerHowl('music', null, 'intro', new HowlClass({ src: ['/music/intro.mp3'], loop: true, volume: 0.3 }));
  }
}

// --- Helper to safely get a Howl instance by category and key ---
// Used internally by the SoundManager API to access registered sounds.
type SoundCategory = 'music' | 'sfx' | 'multitrack';
function getHowl(category: SoundCategory, subcategory: string | null, key: string): Howl | undefined {
  if (category === 'music') return sounds.music[key];
  if (category === 'sfx' && subcategory && sounds.sfx[subcategory]) return sounds.sfx[subcategory][key];
  if (category === 'multitrack') return sounds.multitrack[key];
  return undefined;
}

// --- Category-specific APIs ---
// These APIs provide fine-grained control for each sound category and subcategory.
// Extend with more methods as needed (e.g., per-category mute, analytics, etc.).
export const SoundManager = {
  music: {
    play: (key: string, ...args: any[]) => { console.log('SoundManager.music.play', { key, args }); return getHowl('music', null, key)?.play(...args); },
    pause: (key: string, id?: number) => { console.log('SoundManager.music.pause', { key, id }); return getHowl('music', null, key)?.pause(id); },
    stop: (key: string) => { console.log('SoundManager.music.stop', { key }); return getHowl('music', null, key)?.stop(); },
    volume: (key: string, vol?: number, id?: number) => {
      const howl = getHowl('music', null, key);
      if (!howl) return;
      if (typeof vol === 'number') return howl.volume(vol, id);
      return howl.volume(id);
    },
    fade: (key: string, from: number, to: number, ms: number, id?: number) => getHowl('music', null, key)?.fade(from, to, ms, id),
    rate: (key: string, rate?: number, id?: number) => {
      const howl = getHowl('music', null, key);
      if (!howl) return;
      if (typeof rate === 'number') return howl.rate(rate, id);
      return howl.rate(id);
    },
    loop: (key: string, loop?: boolean, id?: number) => {
      const howl = getHowl('music', null, key);
      if (!howl) return;
      if (typeof loop === 'boolean') return howl.loop(loop, id);
      return howl.loop(id);
    },
    playing: (key: string, id?: number) => !!getHowl('music', null, key)?.playing(id),
    // Add more music-specific methods as needed
  },
  sfx: {
    core: {
      play: (key: string, ...args: any[]) => { console.log('SoundManager.sfx.core.play', { key, args }); return getHowl('sfx', 'core', key)?.play(...args); },
      pause: (key: string, id?: number) => { console.log('SoundManager.sfx.core.pause', { key, id }); return getHowl('sfx', 'core', key)?.pause(id); },
      stop: (key: string) => { console.log('SoundManager.sfx.core.stop', { key }); return getHowl('sfx', 'core', key)?.stop(); },
      volume: (key: string, vol?: number, id?: number) => {
        const howl = getHowl('sfx', 'core', key);
        if (!howl) return;
        if (typeof vol === 'number') return howl.volume(vol, id);
        return howl.volume(id);
      },
      fade: (key: string, from: number, to: number, ms: number, id?: number) => getHowl('sfx', 'core', key)?.fade(from, to, ms, id),
      rate: (key: string, rate?: number, id?: number) => {
        const howl = getHowl('sfx', 'core', key);
        if (!howl) return;
        if (typeof rate === 'number') return howl.rate(rate, id);
        return howl.rate(id);
      },
      loop: (key: string, loop?: boolean, id?: number) => {
        const howl = getHowl('sfx', 'core', key);
        if (!howl) return;
        if (typeof loop === 'boolean') return howl.loop(loop, id);
        return howl.loop(id);
      },
      playing: (key: string, id?: number) => !!getHowl('sfx', 'core', key)?.playing(id),
      // Add more core SFX-specific methods as needed
    },
    interface: {
      play: (key: string, ...args: any[]) => { console.log('SoundManager.sfx.interface.play', { key, args }); return getHowl('sfx', 'interface', key)?.play(...args); },
      pause: (key: string, id?: number) => { console.log('SoundManager.sfx.interface.pause', { key, id }); return getHowl('sfx', 'interface', key)?.pause(id); },
      stop: (key: string) => { console.log('SoundManager.sfx.interface.stop', { key }); return getHowl('sfx', 'interface', key)?.stop(); },
      volume: (key: string, vol?: number, id?: number) => {
        const howl = getHowl('sfx', 'interface', key);
        if (!howl) return;
        if (typeof vol === 'number') return howl.volume(vol, id);
        return howl.volume(id);
      },
      fade: (key: string, from: number, to: number, ms: number, id?: number) => getHowl('sfx', 'interface', key)?.fade(from, to, ms, id),
      rate: (key: string, rate?: number, id?: number) => {
        const howl = getHowl('sfx', 'interface', key);
        if (!howl) return;
        if (typeof rate === 'number') return howl.rate(rate, id);
        return howl.rate(id);
      },
      loop: (key: string, loop?: boolean, id?: number) => {
        const howl = getHowl('sfx', 'interface', key);
        if (!howl) return;
        if (typeof loop === 'boolean') return howl.loop(loop, id);
        return howl.loop(id);
      },
      playing: (key: string, id?: number) => !!getHowl('sfx', 'interface', key)?.playing(id),
      // Add more interface SFX-specific methods as needed
    },
    aria: {
      play: (key: string, ...args: any[]) => { console.log('SoundManager.sfx.aria.play', { key, args }); return getHowl('sfx', 'aria', key)?.play(...args); },
      pause: (key: string, id?: number) => { console.log('SoundManager.sfx.aria.pause', { key, id }); return getHowl('sfx', 'aria', key)?.pause(id); },
      stop: (key: string) => { console.log('SoundManager.sfx.aria.stop', { key }); return getHowl('sfx', 'aria', key)?.stop(); },
      volume: (key: string, vol?: number, id?: number) => {
        const howl = getHowl('sfx', 'aria', key);
        if (!howl) return;
        if (typeof vol === 'number') return howl.volume(vol, id);
        return howl.volume(id);
      },
      fade: (key: string, from: number, to: number, ms: number, id?: number) => getHowl('sfx', 'aria', key)?.fade(from, to, ms, id),
      rate: (key: string, rate?: number, id?: number) => {
        const howl = getHowl('sfx', 'aria', key);
        if (!howl) return;
        if (typeof rate === 'number') return howl.rate(rate, id);
        return howl.rate(id);
      },
      loop: (key: string, loop?: boolean, id?: number) => {
        const howl = getHowl('sfx', 'aria', key);
        if (!howl) return;
        if (typeof loop === 'boolean') return howl.loop(loop, id);
        return howl.loop(id);
      },
      playing: (key: string, id?: number) => !!getHowl('sfx', 'aria', key)?.playing(id),
      // Add more aria SFX-specific methods as needed
    }
  },
  multitrack: {
    play: (key: string, ...args: any[]) => getHowl('multitrack', null, key)?.play(...args),
    stop: (key: string) => getHowl('multitrack', null, key)?.stop(),
    playSprite: (key: string, spriteName: string) => playSprite('multitrack', null, key, spriteName),
  },
  // --- Global controls for all sounds (music + SFX) ---
  muteAll: () => { if (Howler) Howler.mute(true); },
  unmuteAll: () => { if (Howler) Howler.mute(false); },
  stopAll: () => { if (Howler) Howler.stop(); },
  volumeAll: (vol: number) => { if (Howler) Howler.volume(vol); },
  pauseAll: () => {
    // Pause all music
    Object.values(sounds.music).forEach(howl => howl.pause());
    // Pause all SFX (all subcategories)
    Object.values(sounds.sfx).forEach(subcat =>
      Object.values(subcat).forEach(howl => howl.pause())
    );
  },
  playAll: () => {
    // Play all music
    Object.values(sounds.music).forEach(howl => howl.play());
    // Play all SFX (all subcategories)
    Object.values(sounds.sfx).forEach(subcat =>
      Object.values(subcat).forEach(howl => howl.play())
    );
  },
  registerHowl: registerHowlPublic,
  setAriaEnabled,
  playSprite: (category: SoundCategory, subcategory: string | null, key: string, spriteName: string) => playSprite(category, subcategory, key, spriteName),
  tts: {
    /**
     * Speak the given text using the browser's default TTS voice.
     * Options: rate (0.1-10), pitch (0-2), volume (0-1). All optional.
     */
    speak: (text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
      if (!window.speechSynthesis) {
        console.warn('SpeechSynthesis API not supported in this browser.');
        return;
      }
      SoundManager.tts.stop(); // Stop any current speech
      const utter = new window.SpeechSynthesisUtterance(text);
      if (options) {
        if (typeof options.rate === 'number') utter.rate = options.rate;
        if (typeof options.pitch === 'number') utter.pitch = options.pitch;
        if (typeof options.volume === 'number') utter.volume = options.volume;
      }
      utter.onstart = () => { ttsState.speaking = true; };
      utter.onend = utter.onerror = () => { ttsState.speaking = false; ttsState.utterance = null; };
      ttsState.utterance = utter;
      window.speechSynthesis.speak(utter);
    },
    /** Stop any ongoing speech immediately. */
    stop: () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      ttsState.speaking = false;
      ttsState.utterance = null;
    },
    /** Pause ongoing speech. */
    pause: () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.pause();
    },
    /** Resume paused speech. */
    resume: () => {
      if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();
    },
    /** Returns true if currently speaking. */
    isSpeaking: () => {
      return !!(window.speechSynthesis && window.speechSynthesis.speaking);
    },
  },
};

// ---
// To add a new sound, register it in the appropriate category in initSoundManager().
// To add a new category or subcategory, extend the sounds registry and SoundManager API accordingly.
// This structure is designed for easy extension and integration into the AllSpark framework.
// ---

// This module is designed for easy extension and integration into the AllSpark framework.
// Add music, TTS, or advanced features by extending this file or creating sibling modules in /lib/sound/. 

// --- Expose state accessors ---
/**
 * Returns a deep copy of the current audio state for safe external use.
 * Use this in React hooks, dev tools, or anywhere you need to inspect audio state.
 */
export function getAudioState(): AudioState {
  return JSON.parse(JSON.stringify(audioState)); // Return a deep copy to prevent mutation
}

// --- Centralized Config ---
// All configurable options for SoundManager (debounce, ARIA, etc.) are stored here.
const soundManagerConfig = {
  debounce: {
    // Example: 'click': 100 (ms)
  } as Record<string, number>,
  ariaEnabled: true,
};

// --- Multitrack Music System ---
// Allows multiple music tracks to play in sync (for advanced music systems).
// Does not replace 'music', which is for single-track focus.
sounds.multitrack = {} as Record<string, Howl>;

// --- Dynamic Sound Registration ---
/**
 * Public method to register a new sound at runtime.
 * Example: SoundManager.registerHowlPublic('sfx', 'core', 'newSfx', howlOptions)
 */
type RegisterHowlInternalCategory = SoundCategory;
export function registerHowlPublic(category: RegisterHowlInternalCategory, subcategory: string | null, key: string, howlOptions: any) {
  console.log('registerHowlPublic called', { category, subcategory, key, howlOptions, HowlClass });
  if (!HowlClass) {
    console.error('HowlClass is not loaded! Cannot register sound:', { category, subcategory, key, howlOptions });
    return;
  }
  const howl = new HowlClass(howlOptions);
  registerHowl(category, subcategory, key, howl);
}

// --- Sprite Support ---
// To use sprites, register a Howl with a 'sprite' option and use playSprite.
function playSprite(category: SoundCategory, subcategory: string | null, key: string, spriteName: string) {
  const howl = getHowl(category, subcategory, key);
  if (howl) howl.play(spriteName);
}

// --- ARIA Enable/Disable ---
/**
 * Enable or disable ARIA/assistive sounds globally.
 */
export function setAriaEnabled(enabled: boolean) {
  soundManagerConfig.ariaEnabled = enabled;
}

// --- Debounce/Rate Limiting ---
// All debounce configs are stored in soundManagerConfig.debounce.
// Debounce logic should be checked in play methods (TODO: implement logic).

// --- TODO: Routing/Scene Integration ---
// Provide hooks or methods to stop/pause music/SFX on route/scene changes.
// This should be called from the app's router or scene manager.

// --- TODO: Ducking/Priority ---
// Consider adding a ducking system to lower music volume when SFX or TTS play.

// --- Event System Documentation ---
/**
 * Howler.js provides per-Howl event listeners (on('play'), on('end'), etc.).
 * SoundManager listens to these events to update its own state and emits global events for app/UI state.
 * Use Howler events for low-level sound logic; use SoundManager's event system for app-wide state and UI.
 */

// --- TTS (Text-to-Speech) API ---
// Provides a simple wrapper around the browser's SpeechSynthesis API for basic TTS support.
// No voice selection yet; uses the browser's default voice.
const ttsState = {
  utterance: null as SpeechSynthesisUtterance | null,
  speaking: false,
};

const tts = {
  /**
   * Speak the given text using the browser's default TTS voice.
   * Options: rate (0.1-10), pitch (0-2), volume (0-1). All optional.
   */
  speak: (text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis API not supported in this browser.');
      return;
    }
    tts.stop(); // Stop any current speech
    const utter = new window.SpeechSynthesisUtterance(text);
    if (options) {
      if (typeof options.rate === 'number') utter.rate = options.rate;
      if (typeof options.pitch === 'number') utter.pitch = options.pitch;
      if (typeof options.volume === 'number') utter.volume = options.volume;
    }
    utter.onstart = () => { ttsState.speaking = true; };
    utter.onend = utter.onerror = () => { ttsState.speaking = false; ttsState.utterance = null; };
    ttsState.utterance = utter;
    window.speechSynthesis.speak(utter);
  },
  /** Stop any ongoing speech immediately. */
  stop: () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    ttsState.speaking = false;
    ttsState.utterance = null;
  },
  /** Pause ongoing speech. */
  pause: () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.pause();
  },
  /** Resume paused speech. */
  resume: () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();
  },
  /** Returns true if currently speaking. */
  isSpeaking: () => {
    return !!(window.speechSynthesis && window.speechSynthesis.speaking);
  },
};
// Integrate TTS with SoundManager's global controls
// Stop/pause TTS when stopAll/pauseAll is called
// Patch stopAll and pauseAll to also stop/pause TTS
const origStopAll = SoundManager.stopAll;
SoundManager.stopAll = () => { origStopAll(); tts.stop(); };
const origPauseAll = SoundManager.pauseAll;
SoundManager.pauseAll = () => { origPauseAll(); tts.pause(); };

// Add tts to SoundManager export
SoundManager.tts = tts; 