// Tell Bing, Yandex, Seznam, Naver etc. (via IndexNow) about every page in sitemap.xml.
// Run after pushing changes:  node tools/indexnow.mjs
// Optional: pass specific URLs to submit only those, e.g.
//   node tools/indexnow.mjs https://spaqigames.github.io/wally/
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'spaqigames.github.io';

// The key is the name of the 32-hex-char .txt file in the site root.
const keyFile = readdirSync(root).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file missing from site root');
const key = keyFile.slice(0, -4);

let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

// Make sure the key file is live first, or the submission is rejected.
const keyLocation = `https://${HOST}/${keyFile}`;
const live = await fetch(keyLocation).then(r => r.ok ? r.text() : '').catch(() => '');
if (live.trim() !== key) {
  console.error(`Key file not live yet at ${keyLocation}. Push the site and wait for GitHub Pages to deploy.`);
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation, urlList: urls }),
});
const msg = { 200: 'OK', 202: 'Accepted (key will be checked shortly)', 400: 'Bad request', 403: 'Key not valid',
  422: 'URLs do not match host/key', 429: 'Too many requests, try later' }[res.status] || '';
console.log(`IndexNow: ${res.status} ${msg} - ${urls.length} URL(s) submitted`);
if (res.status >= 300) { console.log(await res.text()); process.exit(1); }
