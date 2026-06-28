// スモークテスト：全タブがJSエラーなく描画され、チャートが出ることを確認する。
import { test, expect } from '@playwright/test';

test('全5タブがエラーなく描画される', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  // [タブのラベル, タブの中身セレクタ, 中に必ず含まれるテキスト]
  const tabs = [
    ['目標設計', '#tab-sim', 'Plan C'],
    ['食事実績', '#tab-tracker', 'カロリー推移'],
    ['日次計測', '#tab-daily', '毎日'],
    ['GAP分析', '#tab-gap', 'リコンプ'],
    ['トレーニング', '#tab-training', 'セッション'],
  ];
  for (const [label, sel, text] of tabs) {
    await page.click(`button.main-tab:has-text("${label}")`);
    await expect(page.locator(sel)).toContainText(text, { timeout: 5000 });
  }

  expect(errors, 'JSエラーが発生:\n' + errors.join('\n')).toEqual([]);
});

test('チャートが描画される', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  expect(canvasCount).toBeGreaterThan(0);
});
