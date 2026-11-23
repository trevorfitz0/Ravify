# simplefest

Make a festival lineup poster with a moving background and share it to your Instagram or Snapchat story.

- Sign in with Spotify or Apple Music and your most-played artists become the lineup (or type up to 30 yourself).
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
| `public/js/import.js`, `public/callback/`, `api/apple-token.js` | Spotify, Apple Music and Last.fm sign-in |
| `public/js/config.js` | Watermark text and the optional import keys |

## Signing in with a music app

**Spotify** works out of the box with the Client ID in `public/js/config.js` (a public identifier; there is no
secret anywhere in this code, sign-in uses PKCE). In the Spotify developer dashboard:

1. Add `<address>/callback/` as a Redirect URI for every address the site runs on.
2. While the app is in Development Mode, add each person who should be able to sign in under User Management.
   Anyone else is refused by Spotify until the app has extended access.

**Apple Music** switches on when these are set on the host (Vercel: Project, Settings, Environment Variables):
`APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (the contents of the MusicKit `.p8` key). They need an Apple
Developer Program membership and a MusicKit key. `api/apple-token.js` signs a one-day token from them; until
they are set the Apple Music button stays hidden. Sign-in needs an Apple Music subscription.

**Last.fm** (optional): add a free API key in `config.js` to show an import by username.

Typing the names still works for everyone, under "Edit the names".

## Adding a background

Add a function `(ctx, w, h, t, palette)` to `backgrounds.js` and list it in `RV.backgrounds`.
`t` runs from 0 to 1; make the drawing identical at 0 and 1 so the recorded loop is seamless.
