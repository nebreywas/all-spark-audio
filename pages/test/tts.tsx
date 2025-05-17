import React, { useState } from 'react';
import { SoundManager } from '../../lib/sound/SoundManager';

/**
 * TTS Test Page
 *
 * This page allows you to test browser-based Text-to-Speech (TTS) via SoundManager.
 * No voice selection yet; uses the browser's default voice.
 */
const TTSTestPage: React.FC = () => {
  const [text, setText] = useState('Hello, this is a TTS test!');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Helper to update speaking state
  const updateSpeaking = () => setIsSpeaking(SoundManager.tts.isSpeaking());

  // Speak the current text with options
  const handleSpeak = () => {
    SoundManager.tts.speak(text, { rate, pitch, volume });
    setTimeout(updateSpeaking, 100); // Update state after a short delay
  };
  // Stop, pause, resume handlers
  const handleStop = () => { SoundManager.tts.stop(); updateSpeaking(); };
  const handlePause = () => { SoundManager.tts.pause(); updateSpeaking(); };
  const handleResume = () => { SoundManager.tts.resume(); updateSpeaking(); };

  return (
    <div className="p-8 font-sans bg-base-200 min-h-screen">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🗣️ TTS Test Page</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Text to Speak:</label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block text-xs">Rate</label>
            <input type="range" min={0.5} max={2} step={0.01} value={rate} onChange={e => setRate(Number(e.target.value))} />
            <div className="text-xs text-center">{rate.toFixed(2)}</div>
          </div>
          <div>
            <label className="block text-xs">Pitch</label>
            <input type="range" min={0} max={2} step={0.01} value={pitch} onChange={e => setPitch(Number(e.target.value))} />
            <div className="text-xs text-center">{pitch.toFixed(2)}</div>
          </div>
          <div>
            <label className="block text-xs">Volume</label>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))} />
            <div className="text-xs text-center">{volume.toFixed(2)}</div>
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <button className="btn btn-primary" onClick={handleSpeak}>Speak</button>
          <button className="btn btn-warning" onClick={handlePause}>Pause</button>
          <button className="btn btn-success" onClick={handleResume}>Resume</button>
          <button className="btn btn-error" onClick={handleStop}>Stop</button>
        </div>
        <div className="mb-2">
          <span className="font-mono">Speaking: </span>
          <span className={isSpeaking ? 'text-success' : 'text-error'}>{isSpeaking ? 'Yes' : 'No'}</span>
        </div>
        <div className="mt-8 text-center text-sm text-base-content/60">
          This page uses the browser's default TTS voice.<br />
          Rate, pitch, and volume are adjustable.<br />
          Voice selection and advanced features coming soon!
        </div>
      </div>
    </div>
  );
};

export default TTSTestPage; 