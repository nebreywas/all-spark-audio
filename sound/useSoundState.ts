import { useEffect, useState } from 'react';
import { getAudioState, subscribeToAudioState } from './SoundManager';
import type { AudioState } from './SoundManager';

/**
 * useSoundState: React hook to access and subscribe to the current audio state from SoundManager.
 * Returns the latest AudioState and updates automatically on any state change.
 *
 * Usage:
 *   const audioState = useSoundState();
 */
export function useSoundState(): AudioState {
  const [state, setState] = useState<AudioState>(() => getAudioState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribeToAudioState(setState);
    return unsubscribe;
  }, []);

  return state;
} 