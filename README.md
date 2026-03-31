# Fight Arcade

Mobile-first boxing and kickboxing interval trainer with live combo callouts, presets, history, PWA support, and optional ElevenLabs voice playback through a Vercel serverless function.

## Open It

Basic page viewing:

1. Open [index.html](C:\Users\cnrat\OneDrive\Documents\Boxing\index.html) in a browser.

PWA install and offline caching:

1. Serve the folder over local HTTP.
2. Open the served `index.html`.
3. Use the in-app `Install App` button or your browser's install menu.

## Main Files

- [index.html](C:\Users\cnrat\OneDrive\Documents\Boxing\index.html)
- [styles.css](C:\Users\cnrat\OneDrive\Documents\Boxing\styles.css)
- [app.js](C:\Users\cnrat\OneDrive\Documents\Boxing\app.js)
- [api/elevenlabs-tts.js](C:\Users\cnrat\OneDrive\Documents\Boxing\api\elevenlabs-tts.js)
- [manifest.json](C:\Users\cnrat\OneDrive\Documents\Boxing\manifest.json)
- [sw.js](C:\Users\cnrat\OneDrive\Documents\Boxing\sw.js)

## ElevenLabs Setup

Add these environment variables in Vercel:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_MODEL_ID` (optional, defaults to `eleven_flash_v2_5`)

Then in the app:

1. Open `Settings`
2. Set `Voice engine` to `ElevenLabs`
3. Paste your ElevenLabs `Voice ID`

If ElevenLabs is unavailable, the app falls back to browser speech.

## Notes

- Speech output depends on the English voices available in the browser and operating system.
- Service workers and full install behavior generally require `http://` or `https://`, not `file://`.
