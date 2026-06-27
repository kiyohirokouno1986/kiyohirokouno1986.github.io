// Slack #河野食事管理 チャンネルの投稿を取得し、食事日次データ(data/meals.json)を生成する。
// GitHub Actions から定期実行される。トークンは Secrets(SLACK_TOKEN) で渡す。
// Node 20+（グローバル fetch 使用）。
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';

const TOKEN = process.env.SLACK_TOKEN;
const CHANNEL = process.env.SLACK_CHANNEL_ID || 'C0B3VMRH2UR'; // #河野食事管理
const OUT = 'data/meals.json';
const MAX_PAGES = 5;       // 200件 × 5ページ = 最大1000件まで遡る
const PAGE_LIMIT = 200;

if (!TOKEN) {
  console.error('SLACK_TOKEN が未設定です。GitHub Secrets に SLACK_TOKEN を登録してください。');
  process.exit(1);
}

// Slack メッセージからテキストを取り出す（本文＋attachments のフォールバック）
function msgText(m) {
  let t = m.text || '';
  if (Array.isArray(m.attachments)) {
    for (const a of m.attachments) {
      if (a.text) t += '\n' + a.text;
      else if (a.fallback) t += '\n' + a.fallback;
    }
  }
  return t;
}

// dashboard.js の extractDays と同じ解析ロジック（PFCのコロンはオプショナル）
function parseDays(messages) {
  const days = [], seen = new Set();
  for (const m of messages) { // 新しい順
    const block = msgText(m);
    if (!block || block.trim().length < 20) continue;
    const tsYear = m.ts ? new Date(parseFloat(m.ts) * 1000).getFullYear() : new Date().getFullYear();
    let date = null;
    const pats = [
      /(\d{4})[年\/](\d{1,2})[月\/](\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})\s*食事/,
      /食事レコ[^\d]*(\d{1,2})\/(\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})/,
    ];
    for (const p of pats) {
      const mm = block.match(p);
      if (mm) {
        let y, mo, d;
        if (mm.length >= 4 && parseInt(mm[1]) > 100) { y = parseInt(mm[1]); mo = parseInt(mm[2]); d = parseInt(mm[3]); }
        else { mo = parseInt(mm[1]); d = parseInt(mm[2]); y = tsYear; }
        if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
          date = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          break;
        }
      }
    }
    if (!date || seen.has(date)) continue; // 同一日付は最新メッセージを優先
    seen.add(date);
    let kcal = null;
    const rng = block.match(/約?([\d,]+)\s*[〜~\-～]\s*([\d,]+)\s*kcal/i);
    if (rng) { kcal = Math.round((parseInt(rng[1].replace(/,/g, '')) + parseInt(rng[2].replace(/,/g, ''))) / 2); }
    if (!kcal) {
      for (const cp of [/総カロリー[^\d]*約?\s*([\d,]+)\s*kcal/i, /合計[^\d]*約?\s*([\d,]+)\s*kcal/i, /\*約?([\d,]+)\s*kcal/i, /([\d,]+)\s*kcal/i]) {
        const mm = block.match(cp);
        if (mm) { const v = parseInt(mm[1].replace(/,/g, '')); if (v > 200 && v < 10000) { kcal = v; break; } }
      }
    }
    if (!kcal) continue;
    const pm = block.match(/P\s*[：:]?\s*約?\s*([\d.]+)/i), fm = block.match(/F\s*[：:]?\s*約?\s*([\d.]+)/i), cm = block.match(/C\s*[：:]?\s*約?\s*([\d.]+)/i);
    let memo = '';
    const mmo = block.match(/メモ[：:\s]*\n?\s*([^\n*]+)/) || block.match(/コメント[：:\s]*\n?\s*([^\n*]+)/);
    if (mmo) memo = mmo[1].replace(/\*使用して送信されました\*.*/, '').trim();
    const hasDrink = /ビール|ハイボール|日本酒|ワイン|サワー|酒|ウィスキー|焼酎/i.test(block);
    const hasTrain = /トレ|筋トレ|ジム|パーソナル|スクワット|ベンチ/i.test(block);
    days.push({ date, kcal, protein: pm ? parseFloat(pm[1]) : null, fat: fm ? parseFloat(fm[1]) : null, carb: cm ? parseFloat(cm[1]) : null, memo, hasDrink, hasTrain });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

async function fetchHistory() {
  const all = [];
  let cursor = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL('https://slack.com/api/conversations.history');
    url.searchParams.set('channel', CHANNEL);
    url.searchParams.set('limit', String(PAGE_LIMIT));
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const data = await res.json();
    if (!data.ok) {
      console.error(`Slack API エラー: ${data.error}`);
      if (data.error === 'not_in_channel') console.error('→ Botをチャンネルに招待してください（/invite @bot）。');
      if (data.error === 'invalid_auth' || data.error === 'token_revoked') console.error('→ SLACK_TOKEN を確認してください。');
      if (data.error === 'missing_scope') console.error(`→ スコープ不足。必要: channels:history（公開）/ groups:history（非公開）。needed=${data.needed}`);
      process.exit(1);
    }
    all.push(...(data.messages || []));
    cursor = data.response_metadata?.next_cursor || '';
    if (!cursor) break;
  }
  return all;
}

const messages = await fetchHistory();
const days = parseDays(messages);

mkdirSync('data', { recursive: true });
const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
const next = JSON.stringify(days, null, 2) + '\n';
if (prev === next) {
  console.log(`変更なし（${days.length}日分、メッセージ ${messages.length}件）。`);
} else {
  writeFileSync(OUT, next);
  console.log(`更新: ${days.length}日分を ${OUT} に書き出し（メッセージ ${messages.length}件）。`);
}
