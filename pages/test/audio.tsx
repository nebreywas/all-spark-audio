import React, { useEffect, useState } from 'react';
import { initSoundManager, SoundManager, setAriaEnabled } from '../../lib/sound/SoundManager';
import { useSoundState } from '../../lib/sound/useSoundState';

/**
 * AllSpark Audio Test Page
 *
 * This page provides a comprehensive suite of test elements for all SoundManager features.
 * Add your sound files to /public/sfx/, /public/music/, or /public/ as needed for testing.
 */
const AudioTestPage: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [ariaEnabled, setAria] = useState(true);
  const [dynamicKey, setDynamicKey] = useState('');
  const [dynamicSrc, setDynamicSrc] = useState('');
  const [dynamicCategory, setDynamicCategory] = useState<'music' | 'sfx' | 'multitrack'>('sfx');
  const [dynamicSubcat, setDynamicSubcat] = useState<'core' | 'interface' | 'aria' | ''>('core');
  const [debounceTestCount, setDebounceTestCount] = useState(0);
  const [dynamicUpdateCount, setDynamicUpdateCount] = useState(0);
  const audioState = useSoundState();

  useEffect(() => {
    initSoundManager().then(() => {
      console.log('initSoundManager resolved, setting ready to true');
      setReady(true);
    });
  }, []);

  // Helper to render sound state and controls for a given registry
  const renderSoundControls = (state: Record<string, any>, category: string, subcat?: string, forceKey?: number) => {
    // Only render if there is at least one sound
    if (!state || Object.keys(state).length === 0) return null;
    // Helper to get the correct SoundManager API for each category/subcat
    let api: any = null;
    if (category === 'music') api = SoundManager.music;
    else if (category === 'sfx' && subcat === 'core') api = SoundManager.sfx.core;
    else if (category === 'sfx' && subcat === 'interface') api = SoundManager.sfx.interface;
    else if (category === 'sfx' && subcat === 'aria') api = SoundManager.sfx.aria;
    else if (category === 'multitrack') api = SoundManager.multitrack;

    return (
      <div className="mb-8" key={forceKey ?? 0}>
        <div className="mb-2 font-bold text-lg capitalize">{category}{subcat ? `: ${subcat}` : ''}</div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Key</th>
                <th>State</th>
                <th>Volume</th>
                <th>Loop</th>
                <th>Rate</th>
                <th>Last Played</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(state).map(key => (
                <tr key={key}>
                  <td className="font-mono">{key}</td>
                  <td>
                    {state[key]?.playing ? '✅' : ''}
                    {state[key]?.paused ? '⏸️' : ''}
                    {state[key]?.stopped ? '⏹️' : ''}
                  </td>
                  <td>{typeof state[key]?.volume === 'number' ? state[key].volume.toFixed(2) : ''}</td>
                  <td>{state[key]?.loop ? '🔁' : ''}</td>
                  <td>{typeof state[key]?.rate === 'number' ? state[key].rate.toFixed(2) : ''}</td>
                  <td>{state[key]?.lastPlayed ? new Date(state[key].lastPlayed).toLocaleTimeString() : ''}</td>
                  <td className="flex flex-wrap gap-1">
                    <button className="btn btn-xs btn-primary" onClick={() => api?.play?.(key)} disabled={!ready}>▶️</button>
                    <button className="btn btn-xs btn-secondary" onClick={() => api?.pause?.(key)} disabled={!ready}>⏸️</button>
                    <button className="btn btn-xs btn-error" onClick={() => api?.stop?.(key)} disabled={!ready}>⏹️</button>
                    <button className="btn btn-xs" onClick={() => api?.volume?.(key, 0.5)} disabled={!ready}>🔉0.5</button>
                    <button className="btn btn-xs" onClick={() => api?.volume?.(key, 1)} disabled={!ready}>🔊1</button>
                    <button className="btn btn-xs" onClick={() => api?.fade?.(key, 1, 0, 1000)} disabled={!ready}>Fade Out</button>
                    <button className="btn btn-xs" onClick={() => api?.loop?.(key, !state[key]?.loop)} disabled={!ready}>Toggle Loop</button>
                    <button className="btn btn-xs" onClick={() => api?.rate?.(key, state[key]?.rate === 2 ? 1 : 2)} disabled={!ready}>Rate x2</button>
                    {/* Sprite test button (if sprite exists) */}
                    <button className="btn btn-xs btn-accent" onClick={() => SoundManager.playSprite(category as any, subcat || null, key, 'default')} disabled={!ready}>Play Sprite</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Import the actual registry from SoundManager (for demo purposes only)
  const { music, sfx, multitrack } = (SoundManager as any).__DEBUG__sounds || { music: {}, sfx: { core: {}, interface: {}, aria: {} }, multitrack: {} };

  // Debounce test: rapid-fire play
  const handleDebounceTest = () => {
    setDebounceTestCount(c => c + 1);
    for (let i = 0; i < 10; i++) {
      setTimeout(() => SoundManager.sfx.core.play('click'), i * 30);
    }
  };

  // Dynamic sound registration
  const handleDynamicRegister = () => {
    console.log('Register button clicked', { dynamicKey, dynamicSrc, dynamicCategory, dynamicSubcat, ready });
    if (!dynamicKey || !dynamicSrc) return;
    // Auto-prepend leading slash if missing
    let src = dynamicSrc.startsWith('/') ? dynamicSrc : '/' + dynamicSrc;
    SoundManager.registerHowl(dynamicCategory, dynamicCategory === 'sfx' ? dynamicSubcat : null, dynamicKey, { src: [src] });
    setDynamicKey('');
    setDynamicSrc('');
    setDynamicUpdateCount(c => c + 1);
  };

  return (
    <div className="p-8 font-sans bg-base-200 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">🔊 AllSpark Audio Test Suite</h1>
        </div>
        <div className="divider">Global Controls</div>
        <div className="mb-4 flex flex-wrap gap-2">
          <button className="btn btn-sm btn-outline btn-error" onClick={() => SoundManager.muteAll()} disabled={!ready}>🔇 Mute All</button>
          <button className="btn btn-sm btn-outline btn-success" onClick={() => SoundManager.unmuteAll()} disabled={!ready}>🔊 Unmute All</button>
          <button className="btn btn-sm btn-outline btn-warning" onClick={() => SoundManager.stopAll()} disabled={!ready}>⏹️ Stop All</button>
          <button className="btn btn-sm btn-outline btn-info" onClick={() => SoundManager.pauseAll()} disabled={!ready}>⏸️ Pause All</button>
          <button className="btn btn-sm btn-outline btn-primary" onClick={() => SoundManager.playAll()} disabled={!ready}>▶️ Play All</button>
          <button className="btn btn-sm btn-outline" onClick={() => SoundManager.volumeAll(0.5)} disabled={!ready}>🔉 Set Volume All 0.5</button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" checked={ariaEnabled} onChange={e => { setAria(e.target.checked); setAriaEnabled(e.target.checked); }} />
          <span className="label-text font-medium">Enable ARIA/Accessibility SFX</span>
        </div>
        <div className="divider">Dynamic Sound Registration</div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <input className="input input-bordered input-sm w-48" placeholder="Key" value={dynamicKey} onChange={e => setDynamicKey(e.target.value)} />
          <input className="input input-bordered input-sm w-64" placeholder="/sfx/yourfile.mp3" value={dynamicSrc} onChange={e => setDynamicSrc(e.target.value)} />
          <select className="select select-bordered select-sm" value={dynamicCategory} onChange={e => setDynamicCategory(e.target.value as any)}>
            <option value="sfx">SFX</option>
            <option value="music">Music</option>
            <option value="multitrack">Multitrack</option>
          </select>
          {dynamicCategory === 'sfx' && (
            <select className="select select-bordered select-sm" value={dynamicSubcat} onChange={e => setDynamicSubcat(e.target.value as any)}>
              <option value="core">core</option>
              <option value="interface">interface</option>
              <option value="aria">aria</option>
            </select>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleDynamicRegister} disabled={!ready}>Register</button>
        </div>
        <div className="divider">Debounce/Rate Limiting Test</div>
        <div className="mb-6 flex items-center gap-4">
          <button className="btn btn-accent btn-sm" onClick={handleDebounceTest} disabled={!ready}>Rapid Play Click (10x)</button>
          <span className="text-sm">Test count: <span className="font-mono">{debounceTestCount}</span></span>
        </div>
        <div className="divider">Music</div>
        {renderSoundControls(audioState.music, 'music', undefined, dynamicUpdateCount)}
        <div className="divider">SFX</div>
        {renderSoundControls(audioState.sfx.core, 'sfx', 'core', dynamicUpdateCount)}
        {renderSoundControls(audioState.sfx.interface, 'sfx', 'interface', dynamicUpdateCount)}
        {renderSoundControls(audioState.sfx.aria, 'sfx', 'aria', dynamicUpdateCount)}
        <div className="divider">Multitrack</div>
        {renderSoundControls({}, 'multitrack', undefined, dynamicUpdateCount)}
        <div className="divider">Live Audio State</div>
        <pre className="bg-base-300 p-4 rounded text-xs overflow-x-auto">{JSON.stringify(audioState, null, 2)}</pre>
        <div className="mt-8 text-center text-sm text-base-content/60">
          This page is a comprehensive test suite for AllSpark SoundManager.<br />
          Add your own sound files and try all features.<br />
          <b>State is live and updates automatically.</b>
        </div>
      </div>
    </div>
  );
};

export default AudioTestPage; 