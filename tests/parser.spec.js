// Slack食事パーサの単体テスト。マークダウン装飾付きのPFC表記でも取れることを担保する。
// 注: パーサは .mjs（ネイティブESM）なので、Playwrightのトランスパイルを避けるため動的importで読み込む。
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const loadParser = () => import(pathToFileURL(resolve('scripts/fetch-slack-meals.mjs')).href);
const mk = (iso, text) => ({ ts: String(new Date(iso).getTime() / 1000), text });

test('PFC値が個別にマークダウン太字（P: *149.2g*）でも抽出できる', async () => {
  const { parseDays } = await loadParser();
  const msg = mk('2026-07-12T12:00:00Z', [
    '*7/12 食事記録*', '',
    '総カロリー: *1417 kcal（○）*',
    'P: *149.2g* / F: *42.0g* / C: *82.5g*', '',
    '【食事内容】', '・プロテイン30g', '・鶏むね肉（皮なし）207g',
    '*使用して送信されました* ChatGPT',
  ].join('\n'));
  const [d] = await parseDays([msg]);
  expect(d.date).toBe('2026-07-12');
  expect(d.kcal).toBe(1417);
  expect(d.protein).toBe(149.2);
  expect(d.fat).toBe(42);
  expect(d.carb).toBe(82.5);
});

test('従来書式（*P：約157g｜…*）も引き続き取れる（回帰チェック）', async () => {
  const { parseDays } = await loadParser();
  const msg = mk('2026-07-11T12:00:00Z', [
    '*7/11 食事記録*', '',
    '*総摂取カロリー：約1,938kcal｜判定：×*',
    '*P：約157g｜F：約59g｜C：約158g*', '',
    '*食事内容*', '• プロテイン30g',
    '*使用して送信されました* ChatGPT',
  ].join('\n'));
  const [d] = await parseDays([msg]);
  expect(d.kcal).toBe(1938);
  expect(d.protein).toBe(157);
  expect(d.fat).toBe(59);
  expect(d.carb).toBe(158);
});
