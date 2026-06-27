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

// 投稿は「品目ごとの内訳 ＋ 合計」の二段構成が多いので、合計セクションだけを解析対象にする。
// 「合計／今日の合計／合計見積もり／総カロリー」以降を切り出し、メモ・品目行は除外する。
function summaryBlock(text) {
  const anchor = text.search(/今日の合計|合計見積|合計|総カロリー|総摂取|トータル/);
  if (anchor < 0) return text; // 合計表記が無ければ全文で解析（簡易フォーマット用）
  let block = text.slice(anchor);
  const cut = block.search(/メモ|コメント|食べたもの|使用して送信されました/);
  if (cut > 0) block = block.slice(0, cut);
  return block;
}
// kcal を取得。範囲（2,258〜2,948kcal）は平均、それ以外は合計優先で先頭一致。
function kcalFromBlock(block) {
  const rng = block.match(/約?([\d,]+)\s*[〜~～\-]\s*([\d,]+)\s*kcal/i);
  if (rng) { const v = Math.round((parseInt(rng[1].replace(/,/g, '')) + parseInt(rng[2].replace(/,/g, ''))) / 2); if (v > 200 && v < 10000) return v; }
  for (const cp of [/総カロリー[^\d]*約?\s*([\d,]+)\s*kcal/i, /合計[^\d]*約?\s*([\d,]+)\s*kcal/i, /カロリー[^\d]*約?\s*([\d,]+)\s*kcal/i, /([\d,]+)\s*kcal/i]) {
    const mm = block.match(cp);
    if (mm) { const v = parseInt(mm[1].replace(/,/g, '')); if (v > 200 && v < 10000) return v; }
  }
  return null;
}
// P/F/C を取得。範囲（158〜187g）は平均。コロンは任意。
function macroFromBlock(block, letter) {
  const re = new RegExp(letter + '\\s*[：:]?\\s*約?\\s*([\\d.]+)(?:\\s*[〜~～\\-]\\s*([\\d.]+))?', 'i');
  const m = block.match(re);
  if (!m) return null;
  let v = parseFloat(m[1]);
  if (m[2]) v = (v + parseFloat(m[2])) / 2;
  return Math.round(v * 10) / 10;
}

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
    const sb = summaryBlock(block);
    let kcal = kcalFromBlock(sb) || kcalFromBlock(block); // 合計セクション → だめなら全文
    if (!kcal) continue;
    const protein = macroFromBlock(sb, 'P');
    const fat = macroFromBlock(sb, 'F');
    const carb = macroFromBlock(sb, 'C');
    let memo = '';
    const mmo = block.match(/メモ[：:\s]*\n?\s*([^\n*]+)/) || block.match(/コメント[：:\s]*\n?\s*([^\n*]+)/);
    if (mmo) memo = mmo[1].replace(/\*使用して送信されました\*.*/, '').trim();
    const hasDrink = /ビール|ハイボール|日本酒|ワイン|サワー|酒|ウィスキー|ウイスキー|焼酎|ソーダ割/i.test(block);
    const hasTrain = /トレ|筋トレ|ジム|パーソナル|スクワット|ベンチ/i.test(block);
    days.push({ date, kcal, protein, fat, carb, memo, hasDrink, hasTrain });
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
