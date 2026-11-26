import {firebaseConfig, editorEmails, passwordEditorEmails} from '../firebase-config.js';
export function configured() {
  return ['GOOGLE_DRIVE_CLIENT_ID','GOOGLE_DRIVE_CLIENT_SECRET','GOOGLE_DRIVE_REFRESH_TOKEN','GOOGLE_DRIVE_FOLDER_ID'].every(key => process.env[key]);
}
export async function editor(req) {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token || token.length > 10000) throw Object.assign(Error('Please sign in again.'),{status:401});
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({idToken:token}), signal:AbortSignal.timeout(10000)
  });
  const user = response.ok ? (await response.json()).users?.[0] : null;
  let passwordEditorSignIn = false;
  if (passwordEditorEmails.includes(user?.email?.toLowerCase()) && !user.emailVerified) {
    try {
      const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
      passwordEditorSignIn = claims.sub === user.localId && claims.firebase?.sign_in_provider === 'password';
    } catch { /* Invalid tokens are already rejected by the account lookup. */ }
  }
  if ((!user?.emailVerified && !passwordEditorSignIn) || !editorEmails.includes(user.email?.toLowerCase()) || user.disabled) throw Object.assign(Error('An approved editor account is required.'),{status:403});
  return user;
}
let cached;
export async function driveToken() {
  if (!configured()) throw Object.assign(Error('Photo uploads need Max to finish connecting Google Drive.'),{status:503});
  if (cached && cached.expires > Date.now()) return cached.token;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST', body:new URLSearchParams({client_id:process.env.GOOGLE_DRIVE_CLIENT_ID,client_secret:process.env.GOOGLE_DRIVE_CLIENT_SECRET,refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN,grant_type:'refresh_token'}), signal:AbortSignal.timeout(10000)
  });
  if (!response.ok) throw Object.assign(Error('Google Drive needs to be reconnected by Max.'),{status:503});
  const result = await response.json();
  cached = {token:result.access_token, expires:Date.now()+(Math.min(result.expires_in || 3600,3600)-60)*1000};
  return cached.token;
}
export function fail(res, error) {
  res.setHeader('Cache-Control','no-store');
  res.status(error.status || 502).json({error:error.status ? error.message : 'The photo request failed. Please try again.'});
}
export function validId(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{10,150}$/.test(id); }
