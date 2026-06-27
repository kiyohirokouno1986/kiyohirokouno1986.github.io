# カロリーダッシュボード

パーソナルトレーニングのカロリー管理・体組成追跡・トレーニング記録を一元管理するWebアプリ。
Coworkアーティファクト（単一HTML 約2,452行）を、ビルド不要のスタンドアロン静的サイトとして移行したもの。

公開URL（GitHub Pages）: https://kiyohirokouno1986.github.io/

## 特徴

- **ビルド不要・依存ゼロ** … `index.html` を開くだけで動作。Node やビルドツールは不要。
- **オフライン動作** … Chart.js をローカル同梱（`assets/vendor/chart.umd.js`）。CDN 不通でも動く。
- **データはブラウザに保存** … `localStorage` に保存（体組成・トレーニング・ウエスト・日次計測・食事）。
- 初回起動時は同梱のシードデータ（体組成22件 / トレーニング19件 / ウエスト24件 / 日次計測204件）を自動投入。

## タブ構成（5タブ・デフォルトは「トレーニング」）

| タブ | データ源 | 状態 |
|---|---|---|
| 目標設計 | 定数・計画 | ✅ シードのみで動作 |
| 食事実績 | 食事データ（取り込み） | ⚠️ 食事データ取り込みが必要 |
| 日次計測 | Tanita日次計測 | ✅ シードで動作 |
| GAP分析 | 食事データ＋計画 | ⚠️ 食事データ取り込みが必要 |
| トレーニング | トレ記録・体組成・ウエスト | ✅ シードで動作 |

## 食事データの取り込み（Slack自動連携の代替）

Cowork では Slack #河野食事管理 と Google Calendar を MCP 経由で自動取得していたが、
スタンドアロンでは MCP が使えないため **API連携は次フェーズ**とし、当面は手動取り込みで代替する。

「食事実績」タブの取り込み欄に Slack の食事記録テキストを貼り付けて「テキストから取り込む」を押す。
複数日分（`M/D 食事レコード` ブロックの連続）や Slack エクスポート（`=== Message from` 区切り）に対応。
JSON 配列ファイル（`extractDays` 出力形式の日次オブジェクト）のインポートも可能。

取り込んだ食事データは `localStorage`（キー `calGuide_meals`）に保存され、リロード後も保持される。

## ディレクトリ構成

```
index.html                 マークアップ（タブバー + #app）
assets/
  styles.css               スタイル（元の <style> を抽出）
  dashboard.js             ロジック（元の <script> を抽出・改修）
  vendor/chart.umd.js      Chart.js v4.5.0（ローカル同梱）
data/                      エクスポート済みシード/設定（参照・将来のAPI取込用）
  seed_body_comp.json, seed_training.json, seed_waist.json,
  seed_daily.json, seed_cal_supplement.json,
  constants.json, exercise_categories.json
```

> 注: 現状 `assets/dashboard.js` 内のインラインシード（`SEED_DATA` 等）が起動時の真実源。
> `data/*.json` は同一内容のエクスポート控えで、将来のAPI/インポート実装の入力として保持している。

## Cowork版からの主な変更

- 単一HTML → `index.html` / `assets/styles.css` / `assets/dashboard.js` に分割。
- `window.cowork.callMcpTool`（Slack/Calendar 自動取得）を撤去し、食事データのローカル管理＋取り込みに置換。
- PFCパーサーのバグ修正（`P/F/C` のコロンをオプショナルに）を適用。
- PFC補完データ（`SEED_CAL_SUPPLEMENT` 11日分）を統合し、取得できない日のP/F/Cを補完。
- Chart.js をローカル同梱（オフライン動作・CDN障害耐性）。
- 食事データ未取り込み時、GAP分析・食事実績タブにクリーンな案内を表示。

## ローカルで開く

```
# どちらでも可
python3 -m http.server 8099   # → http://localhost:8099/
# もしくは index.html をブラウザで直接開く
```

## 次フェーズ候補

- Slack Bot Token / Google OAuth による食事・カレンダーの自動取得（別途バックエンド or プロキシが必要）。
- GAP分析のレーダーチャート等、未実装機能の追加。
