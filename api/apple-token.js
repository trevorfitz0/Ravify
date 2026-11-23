// Signs a short-lived Apple Music developer token so the private key stays on the host.
// Set these on the host (Vercel: Project > Settings > Environment Variables):
//   APPLE_TEAM_ID      your Apple Developer Team ID
//   APPLE_KEY_ID       the ID of the MusicKit key
//   APPLE_PRIVATE_KEY  the contents of the .p8 file
// Until they are set this answers 501 and the site hides the Apple Music button.
const crypto = require('crypto');

const b64 = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

module.exports = (req, res) => {
  const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } = process.env;
  if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
    return res.status(501).json({ error: 'Apple Music is not set up on this site.' });
  }
  try {
    const now = Math.floor(Date.now() / 1000);
    const head = b64({ alg: 'ES256', kid: APPLE_KEY_ID });
    const body = b64({ iss: APPLE_TEAM_ID, iat: now, exp: now + 60 * 60 * 24 });
    const sig = crypto
      .sign('sha256', Buffer.from(head + '.' + body), { key: APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'), dsaEncoding: 'ieee-p1363' })
      .toString('base64url');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    res.status(200).json({ token: `${head}.${body}.${sig}` });
  } catch (e) {
    res.status(500).json({ error: 'Could not sign the Apple Music token.' });
  }
};
