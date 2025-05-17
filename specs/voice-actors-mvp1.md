# AllSpark Voice Configuration Schema v1.0 — Local-Only Implementation Guide

This document outlines the voice specification and implementation plan for AllSpark's **local-only voice synthesis system**, forming the foundation of the voice engine in version 1.0. It is designed to work with browser-native speech synthesis (Web Speech API) and eventual local model-based systems (e.g., VITS-Web). Future versions will layer in online/cloud-based TTS services and deeper AI integrations.

---

## 🎯 Goals of v1.0 (Local-Only)

* Provide deterministic, expressive, cross-browser speech synthesis.
* Allow game/app designers to control voices through external JSON.
* Avoid dependency on any cloud service or API key.
* Be fully functional offline using system/native speech synthesis.

> **Note:** v2.0 will expand this schema with support for cloud TTS APIs (e.g., Amazon Polly, Google TTS) and locally run AI-based voice engines like VITS or Coqui.

---

## 🔧 Core Concepts

### `speechactors`

The top-level object. Each key (e.g., `"Sarah"`) represents a uniquely named voice profile used by the app/game.

### `variants`

Variants describe emotional or contextual voice states (e.g., "default", "agitated", "whisper"). These contain fallback logic, expressive tuning (pitch, rate, volume), and voice lists.

### `platformVoices`

An **array of one or more local/native browser voices** the system will attempt to use. These must be usable with `speechSynthesis.getVoices()`.

---

## 🧾 Schema Example (Local-Focused)

```jsonc
{
  "speechactors": {
    "Sarah": {
      "label": "Sarah, main character voice",
      "defaultProfile": "default",
      "fallbackStrategy": "platform-priority",

      "variants": {
        "default": {
          "label": "Sarah, default",
          "selectionStrategy": "first-available",
          "language": "en-US",
          "gender": "female",
          "offlineAvailability": true,
          "pitchvalue": 1.0,
          "ratevalue": 1.0,
          "volumePercent": 1.0,

          "platformVoices": [
            {
              "platform": "Google",
              "type": "browser",
              "voiceURI": "Google US English",
              "name": "Google US English",
              "engine": "local",
              "voiceSpecificId": "google::us-english-a"
            },
            {
              "platform": "Apple",
              "type": "browser",
              "voiceURI": "com.apple.ttsbundle.Samantha-compact",
              "name": "Samantha",
              "engine": "local",
              "voiceSpecificId": "apple::samantha"
            }
          ]
        },

        "whisper": {
          "label": "Sarah, whisper",
          "pitchvalue": 0.95,
          "ratevalue": 0.8,
          "volumePercent": 0.4
        }
      }
    }
  }
}
```

---

## 🔁 `fallbackStrategy` (for voice matching)

| Value                 | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `"platform-priority"` | Try known good platforms in a preset order (e.g., Apple → Google → Microsoft). |
| `"sequential"`        | Try voices in the order they appear in `platformVoices`.                       |
| `"first-available"`   | Use the first voice present in the system's list.                              |
| `"random"`            | Randomly pick from available matches.                                          |
| `"settings-only"`     | Restrict to voices pre-approved by system settings or user profile.            |
| `"settings-first"`    | Prefer settings-defined voices, fallback to variant definition.                |

---

## 🔀 `selectionStrategy` (for choosing within matches)

| Value                 | Description                                 |
| --------------------- | ------------------------------------------- |
| `"first-available"`   | Use the first matching voice present.       |
| `"sequential"`        | Rotate through entries over time.           |
| `"random"`            | Randomly pick one.                          |
| `"platform-priority"` | Pick the first match in the platform order. |

---

## ⚙️ `preferredEngine`

Since this is v1.0 and **local only**, only the following values are relevant:

| Value     | Description                         |
| --------- | ----------------------------------- |
| `"local"` | Prefer native browser/system voice. |
| `"any"`   | Accept whatever matches.            |

> Cloud-specific values like `"neural"` and `"standard"` will be introduced in v2.0.

---

## 🎚️ Voice Controls

| Field           | Role                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `pitchvalue`    | A number like `1.0`, `0.8`, or `1.2` representing relative pitch.                                  |
| `ratevalue`     | Speech rate; `1.0` is normal. Lower = slower.                                                      |
| `volumePercent` | A percent scale (0.0–1.0) limiting volume vs system max. Used for whispering or background voices. |

---

## 🧠 Implementation Notes

* On init, fetch `speechSynthesis.getVoices()` and compare against the voice list.
* Use `voiceSpecificId` when comparing if you want to resolve duplicate or ambiguous voice names.
* Speech synthesis utterances should set:

```js
utterance.voice = matchedVoice;
utterance.pitch = pitchvalue;
utterance.rate = ratevalue;
utterance.volume = Math.min(1.0, volumePercent);
```

* If a matching voice cannot be found, fall back to the system-wide default voice.

---

## 📘 What's Coming in v2.0

* Cloud engine support (Amazon Polly, Google TTS, Azure, ElevenLabs).
* Local AI synthesis models (VITS-Web, Coqui TTS) with preload/coldstart support.
* SSML proxy rendering for expressive controls.
* Live fallback monitoring with voice telemetry.
* Custom voice training hooks.

---

This version gives AllSpark the right foundation for reliable, expressive, offline-capable voice synthesis, with clean separation of logic and configuration.
