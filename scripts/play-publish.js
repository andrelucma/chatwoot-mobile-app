// Publishes an already-built AAB to a Google Play track via the Play
// Developer API, using a service account JSON key for auth (no gcloud/
// fastlane dependency). Used by .github/workflows/android-play-release.yml.
//
// Required env vars: GOOGLE_PLAY_KEY_PATH, PACKAGE_NAME, AAB_PATH, TRACK,
// VERSION_CODE, RELEASE_NAME, RELEASE_NOTES_PT_BR

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function postForm(hostname, urlPath, formBody) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formBody),
        },
      },
      res => {
        let data = '';
        res.on('data', d => (data += d));
        res.on('end', () => {
          if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          resolve(JSON.parse(data));
        });
      },
    );
    req.on('error', reject);
    req.write(formBody);
    req.end();
  });
}

function apiRequest(method, urlPath, accessToken, body) {
  return new Promise((resolve, reject) => {
    const payloadStr = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'androidpublisher.googleapis.com',
        path: urlPath,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...(payloadStr ? { 'Content-Length': Buffer.byteLength(payloadStr) } : {}),
        },
      },
      res => {
        let data = '';
        res.on('data', d => (data += d));
        res.on('end', () => {
          if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} ${method} ${urlPath}: ${data}`));
          resolve(data ? JSON.parse(data) : null);
        });
      },
    );
    req.on('error', reject);
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

function uploadBundle(urlPath, accessToken, filePath) {
  return new Promise((resolve, reject) => {
    const stat = fs.statSync(filePath);
    const req = https.request(
      {
        hostname: 'androidpublisher.googleapis.com',
        path: urlPath,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': stat.size,
        },
      },
      res => {
        let data = '';
        res.on('data', d => (data += d));
        res.on('end', () => {
          if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} upload: ${data}`));
          resolve(JSON.parse(data));
        });
      },
    );
    req.on('error', reject);
    fs.createReadStream(filePath).pipe(req);
  });
}

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const headerB64 = base64url(Buffer.from(JSON.stringify(header)));
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), key.private_key);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const formBody = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`;
  const tokenResp = await postForm('oauth2.googleapis.com', '/token', formBody);
  return tokenResp.access_token;
}

async function main() {
  const {
    GOOGLE_PLAY_KEY_PATH,
    PACKAGE_NAME,
    AAB_PATH,
    TRACK,
    VERSION_CODE,
    RELEASE_NAME,
    RELEASE_NOTES_PT_BR,
  } = process.env;

  const key = JSON.parse(fs.readFileSync(GOOGLE_PLAY_KEY_PATH, 'utf8'));
  const accessToken = await getAccessToken(key);
  console.log('Got access token.');

  const edit = await apiRequest('POST', `/androidpublisher/v3/applications/${PACKAGE_NAME}/edits`, accessToken, {});
  const editId = edit.id;
  console.log(`Edit id: ${editId}`);

  const uploadPath = `/upload/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/bundles?uploadType=media`;
  const bundle = await uploadBundle(uploadPath, accessToken, AAB_PATH);
  console.log(`Uploaded bundle, versionCode=${bundle.versionCode}`);

  await apiRequest('PUT', `/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/tracks/${TRACK}`, accessToken, {
    track: TRACK,
    releases: [
      {
        name: RELEASE_NAME,
        versionCodes: [String(VERSION_CODE)],
        status: 'completed',
        releaseNotes: [{ language: 'pt-BR', text: RELEASE_NOTES_PT_BR }],
      },
    ],
  });
  console.log(`Track ${TRACK} updated with versionCode ${VERSION_CODE}`);

  await apiRequest('POST', `/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}:commit`, accessToken, {});
  console.log('Edit committed. Release is live on the track.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
