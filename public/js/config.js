// Site settings. Everything here is safe to be public: never put a client SECRET in this file.
window.RV = window.RV || {};
RV.config = {
  // Small credit line at the bottom of every poster.
  watermark: 'simplefest.net',

  // Spotify: the app's Client ID (a public identifier, not the secret). Each address the site runs on needs
  //  <address>/callback/  added as a Redirect URI in the Spotify developer dashboard.
  // While the Spotify app is in Development Mode, only the test users listed in that dashboard can sign in.
  spotifyClientId: '0c1e9fe4084c46e2ae474fc762e689ad',
  // Apple Music needs no setting here: it switches on when the APPLE_* values are set on the host (see README).
  // Last.fm (optional, hidden while blank): a free API key from https://www.last.fm/api/account/create
  lastfmApiKey: '',
};
