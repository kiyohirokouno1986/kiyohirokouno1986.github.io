# カロリーダッシュボード

カロリー管理・体組成追跡・トレーニング記録を一元管理する、リコンプ（筋肉維持しながら減量）特化のWebアプリ。
Coworkアーティファクト（単一HTML 約2,452行）を、ビルド不要のスタンドアロン静的サイトとして移行・拡張したもの。

公開URL（GitHub Pages）: https://kiyohirokouno1986.github.io/

## 特徴

- **ビルド不要・依存ゼロ** … `index.html` を開くだけで動作。Node やビルドツールは不要。
- **オフライン動作** … Chart.js v4.5.0 をローカル同梱（`assets/vendor/chart.umd.js`）。CDN 不通でも動く。
- **データはブラウザに保存** … `localStorage` に保存（体組成・トレーニング・ウエスト・日次計測・食事・予定）。
- 初回起動時は同梱のシードデータ（体組成・トレーニング・ウエスト・日次計測）を自動投入。
- **食事・予定は GitHub Actions が自動同期**（下記「自動データ連携」）。

## タブ構成（5タブ・デフォルトは「トレーニング」）

| タブ | 内容 | データ源 |
|---|---|---|
| 目標設計 | リコンプ計画・カロリー設計・体脂肪率シミュレーション | 定数・計画 |
| 食事実績 | 日別カロリー/PFC推移、予定アノテーション付きカロリーチャート | 食事データ（Slack自動同期） |
| 日次計測 | 体重・体脂肪率・筋肉量・除脂肪体重の推移（7日移動平均、5/14マーカー） | Tanita日次計測（シード＋手入力） |
| GAP分析 | 計画とのGAP、溢れた日の要因診断、スケジュール別の食事傾向 | 食事データ＋予定＋計画 |
| トレーニング | トレ記録・体組成・ウエスト推移 | トレ記録・体組成・ウエスト（シード＋手入力） |

### リコンプ向け分析（GAP分析タブ）

- **目標**: 1日あたり平均アンダーカロリー約400kcal（−300〜−500のバンド）／プロテイン 100〜140g（体重の約1.5〜2倍）。
- **溢れた日の要因診断**: 2,500kcal超の日を抽出し、総カロリー×アルコール×スケジュールで要因を可視化。
  - アルコール推定は残差法（`alcoholK = max(0, kcal − (P×4 + F×9 + C×4))`）。
- **スケジュール別の食事傾向**: カレンダーの予定（会食・飲み／出張・海外／支援・訪問／通常日）ごとに平均カロリー・P・アルコール・超過率を集計。

## 自動データ連携（GitHub Actions）

食事データ（Slack）と予定（Google Calendar）は、GitHub Actions が定期実行で取得し、`data/*.json` を更新して `master` に直接コミットする。アプリは起動時にこの JSON を `fetch` して `localStorage` にマージする。

| ワークフロー | 取得元 | スクリプト | 出力 | 頻度 |
|---|---|---|---|---|
| `slack-meals.yml` | Slack #河野食事管理 | `scripts/fetch-slack-meals.mjs` | `data/meals.json` | 6時間ごと |
| `calendar-sync.yml` | Google Calendar | `scripts/fetch-calendar.mjs` | `data/calendar.json` | 12時間ごと |

- Slack パーサーは投稿の「合計／今日の合計／合計見積もり／総カロリー」ブロックのみを集計（範囲表記は平均化）。
- Google Calendar 認証はサービスアカウント（JWT を `node:crypto` で署名）。
- 手動実行も可能（Actions タブ → 各ワークフロー → "Run workflow"）。

### シークレット（GitHub Secrets のみ・コードには絶対に置かない）

本リポジトリは public のため、トークン類は必ず **GitHub Secrets** に置く。

| Secret | 用途 |
|---|---|
| `SLACK_TOKEN` | Slack API トークン |
| `SLACK_CHANNEL_ID` | 取得対象チャンネルID |
| `GOOGLE_SA_KEY` | Google サービスアカウント鍵（JSON） |
| `GOOGLE_CALENDAR_ID` | 取得対象カレンダーID（任意） |

## CI / テスト

プルリクのたびに Playwright E2E スモークテストを自動実行する（`.github/workflows/ci.yml`、ジョブ名 `e2e`）。

- 全5タブが JS エラーなく描画されること、チャートが描画されることを確認。
- ローカル実行: `npx playwright test`（`CI=1 npx playwright test` でCI相当）。

## 開発フロー

ブランチ → PR → CI（緑✓）→ マージ、で進める。詳細は [`docs/DEV_WORKFLOW.md`](docs/DEV_WORKFLOW.md)。

```
git checkout -b feature/xxx     # masterから派生
# 変更 → node --check assets/dashboard.js → npx playwright test
git push -u origin feature/xxx  # PR作成 → CI自動実行 → 緑になったらマージ（squash）
```

### ブランチ保護（推奨設定）

`master` を保護して、CI が緑のPRだけマージできるようにする。GitHub の Settings → Rules → Rulesets で設定：

- **Require a pull request before merging**（必須レビュー数は 0 でも可・ソロ運用）
- **Require status checks to pass** → `e2e` を必須チェックに指定
- **Bypass list に データ同期Bot（github-actions）を追加** … `slack-meals` / `calendar-sync` は `master` に直接 push するため、bypass に入れないと自動同期がブロックされる点に注意。

## ディレクトリ構成

```
index.html                      マークアップ（タブバー + #app）
assets/
  styles.css                    スタイル
  dashboard.js                  ロジック（全機能）
  favicon.svg                   ファビコン（💪）
  vendor/chart.umd.js           Chart.js v4.5.0（ローカル同梱）
data/
  meals.json                    Slack自動同期（食事カロリー/PFC）
  calendar.json                 Google Calendar自動同期（予定の分類マップ）
  seed_body_comp.json / seed_training.json / seed_waist.json /
  seed_daily.json / seed_cal_supplement.json   起動時シード
  constants.json / exercise_categories.json    設定・参照
scripts/
  fetch-slack-meals.mjs         Slack取得・パース
  fetch-calendar.mjs            Googleカレンダー取得・分類
.github/workflows/
  slack-meals.yml / calendar-sync.yml          自動同期
  ci.yml                        PRごとのE2Eテスト
tests/smoke.spec.js             Playwright スモークテスト
docs/DEV_WORKFLOW.md            開発フロー解説
playwright.config.js            Playwright設定
```

> 注: `assets/dashboard.js` 内のインラインシードが起動時の基準値。`data/seed_*.json` は同一内容の控え。
> `data/meals.json` と `data/calendar.json` は GitHub Actions が生成・更新する自動同期データ。

## ローカルで開く

```
python3 -m http.server 8099   # → http://localhost:8099/
# もしくは index.html をブラウザで直接開く
```

## 次フェーズ候補

- アルコール杯数の抽出（残差kcalからの推定 → 杯数換算）。
- スケジュール相関の「出張／海外」分割など、要因診断の粒度向上。
- GAP分析のレーダーチャート等、未実装ビジュアルの追加。
