// Googleカレンダーを取得し、会食/出張などに分類して data/calendar.json を生成する。
// GitHub Actions から定期実行。サービスアカウント認証（依存ゼロ。node:crypto でJWT署名）。
// Secrets: GOOGLE_SA_KEY（サービスアカウントJSON文字列）, GOOGLE_CALENDAR_ID（任意・既定 primary）。
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';

const SA_RAW = process.env.GOOGLE_SA_KEY;
const CAL_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const OUT = 'data/calendar.json';
const DAYS_BACK = 160, DAYS_FWD = 3; // 取得範囲（食事データの範囲をカバー）

if (!SA_RAW) { console.error('GOOGLE_SA_KEY が未設定です。GitHub Secrets に登録してください。'); process.exit(1); }
let sa;
try { sa = JSON.parse(SA_RAW); } catch (e) { console.error('GOOGLE_SA_KEY がJSONとして読めません。'); process.exit(1); }

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(sa.private_key))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const data = await res.json();
  if (!data.access_token) { console.error('アクセストークン取得失敗:', JSON.stringify(data)); process.exit(1); }
  return data.access_token;
}

async function fetchEvents(token, timeMin, timeMax) {
  const items = []; let pageToken = '';
  for (let i = 0; i < 12; i++) {
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`);
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '250');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.error) {
      console.error('Calendar APIエラー:', JSON.stringify(data.error));
      if (data.error.code === 404) console.error('→ カレンダーIDを確認、またはサービスアカウントにカレンダーを共有してください。');
      process.exit(1);
    }
    items.push(...(data.items || []));
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return items;
}

// 分類ルール（優先度順＝食事に効く順）。食べ方に影響する予定だけ拾う。
const RULES = [
  { re: /海外|台湾|COMPUTEX|出国|入国/i, short: '海外' },
  { re: /出張|✈|Flight|フライト|搭乗|空港|羽田|成田|千歳|桃園|松山|ANA\s?\d|JAL\s?\d|NH\s?\d|CI\s?\d/i, short: '出張' },
  { re: /懇親/i, short: '懇親会' },
  { re: /会食/i, short: '会食' },
  { re: /飲み会|飲み(?!物)/i, short: '飲み会' },
  { re: /ディナー|ランチ会|食事会|宴/i, short: '食事会' },
  { re: /訪問/i, short: '訪問' },
  { re: /【支援】|ご支援|支援先|コンサル/i, short: '支援' },
];
const cleanSummary = (s) => s.replace(/^[🚕🚖✈️🏨🍽️📅🎯\s]+/, '').trim();

function classify(items) {
  const byDate = {};
  for (const ev of items) {
    if (ev.status === 'cancelled') continue;
    const summary = ev.summary || '';
    if (!summary || /kcal|食事記録/.test(summary)) continue; // 食事ログは除外
    const date = ev.start?.date || (ev.start?.dateTime ? ev.start.dateTime.slice(0, 10) : null);
    if (!date) continue;
    for (let i = 0; i < RULES.length; i++) {
      if (RULES[i].re.test(summary)) {
        const prev = byDate[date];
        if (!prev || i < prev.prio) {
          byDate[date] = { short: RULES[i].short, full: cleanSummary(summary), prio: i };
        } else if (prev.short === RULES[i].short && prev.full.length < 120 && !prev.full.includes(cleanSummary(summary))) {
          prev.full += ' ／ ' + cleanSummary(summary);
        }
        break;
      }
    }
  }
  const out = {};
  for (const date of Object.keys(byDate).sort()) out[date] = { short: byDate[date].short, full: byDate[date].full };
  return out;
}

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const now = new Date();
const timeMin = new Date(now.getTime() - DAYS_BACK * 86400000).toISOString();
const timeMax = new Date(now.getTime() + DAYS_FWD * 86400000).toISOString();

const token = await getAccessToken();
const items = await fetchEvents(token, timeMin, timeMax);
const map = classify(items);

mkdirSync('data', { recursive: true });
const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
const next = JSON.stringify(map, null, 2) + '\n';
if (prev === next) {
  console.log(`変更なし（${Object.keys(map).length}日分、イベント ${items.length}件）。`);
} else {
  writeFileSync(OUT, next);
  console.log(`更新: ${Object.keys(map).length}日分を ${OUT} に書き出し（イベント ${items.length}件）。`);
}
