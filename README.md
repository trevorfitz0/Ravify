# simplefest

Make a festival lineup poster with a moving background and share it to your Instagram or Snapchat story.

- Type or paste up to 30 artists; the first one headlines.
- Seven animated backgrounds, six colour sets, three lettering styles, or your own photo.
- **Save image** gives a 1080 × 1920 PNG. **Save video** records an eight-second seamless loop (MP4 in Chrome and Safari).
- On a phone, **Share to story** opens the share sheet so the file goes straight to Instagram or Snapchat.
- **Copy a link** puts the whole lineup in the URL, so anyone opening it sees the poster and can make their own.

## Run it

It is a plain static site: no build step and no server.

```
npm run dev      # serves ./public on http://localhost:3000
```

Deploys anywhere that serves a folder. `vercel.json` points Vercel at `public/`.

## Layout

| File | What it does |
| --- | --- |
| `public/index.html`, `public/css/site.css` | The page and its look |
| `public/js/backgrounds.js` | The animated backgrounds and colour sets |
| `public/js/poster.js` | Lays out the lettering on the poster |
| `public/js/export.js` | PNG and video export, sharing, download |
| `public/js/app.js` | The form, live preview and buttons |
| `public/js/import.js`, `public/callback/` | Optional Spotify and Last.fm imports |
| `public/js/config.js` | Watermark text and the optional import keys |

## Optional imports

Both are hidden until a key is set in `public/js/config.js`.

- **Last.fm**: add a free API key. Works for any public Last.fm username.
- **Spotify**: add the app's Client ID (never the secret) and register `<site>/callback/` as a Redirect URI.
  Sign-in uses PKCE, so no secret exists in this code. Spotify currently limits Development Mode apps to a
  few named test users, so this is for personal use unless the app is approved for extended access.

## Adding a background

Add a function `(ctx, w, h, t, palette)` to `backgrounds.js` and list it in `RV.backgrounds`.
`t` runs from 0 to 1; make the drawing identical at 0 and 1 so the recorded loop is seamless.
