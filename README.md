# AllSpark Audio Subsystem

This project is the audio subsystem for the AllSpark platform—a modular, extensible framework for building advanced web applications and interactive experiences.

## Purpose

- Provides a robust, extensible, and SSR-safe audio management system for browser-based sound effects, music, and accessibility cues.
- Centralizes all sound logic, state, and registration for easy integration and future-proofing.
- Designed for seamless integration with React/Next.js and for use as part of the larger AllSpark platform.

## Features

- Modular SoundManager abstraction (wraps Howler.js)
- Category-based sound organization (music, SFX, ARIA)
- Global and per-sound controls (play, pause, stop, volume, etc.)
- Live state tracking and React hooks
- Dynamic sound registration at runtime
- Comprehensive test page for interactive sound management

## Getting Started

- See the test page at `/test/audio` (or `/test`) for a live demo and interactive sound management.
- Add your sound files to the `public/sfx/` or `public/music/` directories.
- Use the UI to register, play, and control sounds in real time.

## Documentation

- See [`docs/soundmanager.md`](docs/soundmanager.md) for full API, usage, and extension details.

## About AllSpark

AllSpark is a large-scale, modular platform for building next-generation web applications, games, and interactive tools. This audio subsystem is just one part of the broader AllSpark ecosystem. 