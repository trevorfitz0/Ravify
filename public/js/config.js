// Site settings. Everything here is safe to be public: never put a client SECRET in this file.
window.RV = window.RV || {};
RV.config = {
  // Small credit line at the bottom of every poster.
  watermark: 'simplefest.net',

  // Optional imports. Leave blank to hide the button.
  // Spotify: the app's Client ID (not the secret). Add  <your site>/callback/  as a Redirect URI in the Spotify dashboard.
  // Note: Spotify limits apps in Development Mode to a handful of named test users.
  spotifyClientId: '',
  // Last.fm: a free API key from https://www.last.fm/api/account/create
  lastfmApiKey: '',
};
