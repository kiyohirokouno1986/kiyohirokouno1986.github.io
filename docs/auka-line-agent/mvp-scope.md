# MVPスコープ（C-2）

> Auka × LINE AIエージェント / 家作り夫婦グループ常駐AI
> v0.1 (2026-04-25)

## 0. MVPの目的

**仮説検証**：「夫婦が自分たちのLINEグループにAukaを招き入れて、家作り相談に使い続ける」が成立するかを8週間で検証する。

KPIは [onboarding-ux.md](./onboarding-ux.md) のもの。特に：
- グループ招待完了率 > 40%
- 招待後7日アクティブ率 > 50%
- 招待後30日以内の来店予約率 > 15%

## 1. MVP は何を **やらない** か（先に明確化）

スコープを引き締めるため、Phase 2以降に回す機能を先に定義：

- ❌ カレンダー連携／自動日程調整
- ❌ 工務店マッチング（嗜好ベースのレコメンド）
- ❌ LIFFカード（比較表・間取り提案）
- ❌ 進捗管理ダッシュボード
- ❌ 着工後・引渡し後の伴走機能
- ❌ 音声・動画入力
- ❌ 多言語対応
- ❌ 工務店向け管理画面（B側プロダクト）

→ MVPは **C向け（夫婦）の体験のみ** に絞る。Auka社内向けの最小限ハンドオフ機能は含む。

## 2. MVPで **やる** こと（機能スコープ）

### A. オンボーディング（[onboarding-ux.md](./onboarding-ux.md) 準拠）
- A1. 友だち追加 → 1:1ウェルカム（3バブル＋Quick Reply）
- A2. 軽量プロファイリング（時期・エリアの2問のみ・任意）
- A3. LIFFによるグループ招待ガイド（GIF入りチュートリアル3画面）
- A4. グループ参加イベント検知 → 自己紹介
- A5. 沈黙モード（メンション・呼び出し検知のみ応答）

### B. AI応答コア
- B1. 意図分類：相談 / 雑談 / 操作（黙って・退出など） / SOS（プロ判断必要）
- B2. RAGベースの家作り相談応答
  - ナレッジ範囲（MVPは最低限）：
    - 住宅ローン基礎・住宅ローン控除
    - 工法比較（木造・鉄骨・RC）
    - 主要な補助金（こどもエコすまい等の最新版）
    - 土地探しチェックリスト
    - 契約前確認事項
- B3. 夫婦間の論点整理（メンション時のみ）
- B4. ハルシネーション抑制ガードレール（「分からない時は分からないと言う」）

### C. データと文脈管理
- C1. groupId 単位の長期メモリ（重要決定ログ・未解決論点）
- C2. メンバー識別（夫・妻・その他）— 1:1自己申告 + メンション解析
- C3. **添付ファイル即時取得＆自社保存**（LINEは1〜2週間で消えるため）
- C4. 検討フェーズの自動推定（初期検討/土地/設計/契約/着工）

### D. 来店誘導と引き継ぎ
- D1. リッチメニューに「Aukaカウンター予約」常設
- D2. AIが「プロ判断必要」と検知したら来店誘導CTA（押し付けない）
- D3. **Auka社内向け管理画面（最小）**：
  - グループ一覧（フェーズ・最終アクティブ日）
  - 会話履歴の要約（カウンセラー向け）
  - 「カウンセラー同席リクエスト」ボタン

### E. プライバシーと運用
- E1. プライバシーポリシー＋同意フロー
- E2. 「Auka 退出」「データも削除して」コマンド
- E3. 監査ログ（削除依頼・ハンドオフ履歴）

## 3. 技術スタック

| レイヤ | 採用技術 | 理由 |
|---|---|---|
| LINE連携 | Messaging API + LIFF | LINE OA AIモード前なので標準APIで先行 |
| Webhook受信・LIFFホスト | Next.js 14 (App Router) on Vercel | 速度優先・サーバレス |
| DB | Supabase (Postgres) | 認証・Storage・pgvectorまで一本化 |
| ベクタ検索 (RAG) | pgvector on Supabase | 別サービスを足さない |
| ファイル保存 | Supabase Storage | LINE添付の即時転送先 |
| LLM | Claude Sonnet 4.6 (with Prompt Caching) | 日本語品質・長文文脈・コスト |
| エージェント枠組み | Claude Agent SDK | ツール呼び出し・メモリ・ガードレールが標準実装済 |
| 認証 (LIFF→DB) | LINE Login + Supabase Auth (JWT連携) | 標準的構成 |
| 監視 | Vercel Analytics + Sentry | 最小構成 |
| LLM観測 | Langfuse (or Helicone) | プロンプト改善のため必須 |

> 補足：これは ShiftB等の業界記事で「LINE OA AIモード時代に必要」とされているスタックとも整合（Messaging API/LIFF + Claude Agent SDK + Next.js+Supabase+Vercel）。

## 4. データモデル（最小）

```sql
-- ユーザー（LINE userId 単位）
create table users (
  user_id text primary key,           -- LINE userId
  display_name text,
  added_at timestamptz default now(),
  initial_profile jsonb              -- 1:1で取得した時期・エリア等
);

-- グループ
create table groups (
  group_id text primary key,          -- LINE groupId
  invited_by text references users,   -- 招待者
  joined_at timestamptz default now(),
  phase text default 'initial',       -- initial/land/design/contract/construction
  silent boolean default false,       -- 「Auka 黙って」でtrue
  policy_consent_at timestamptz       -- 同意取得日時
);

-- グループメンバー（夫婦識別含む）
create table group_members (
  group_id text references groups,
  user_id text references users,
  role text,                          -- husband/wife/family/unknown
  primary key (group_id, user_id)
);

-- メッセージログ（必要最小限）
create table messages (
  id uuid primary key default gen_random_uuid(),
  group_id text references groups,
  user_id text,                       -- 発言者(LINEのuserId)、AIならnull
  type text,                          -- text/image/file/sticker
  content text,
  attachment_url text,                -- Supabase Storageに保存後のURL
  source_message_id text,             -- LINE側のmessageId
  created_at timestamptz default now()
);

-- 重要決定ログ（夫婦の合意事項）
create table decisions (
  id uuid primary key default gen_random_uuid(),
  group_id text references groups,
  topic text,                          -- 例: 予算 / エリア / 工法
  decision text,                       -- 合意内容
  source_message_id text,              -- 抽出元
  decided_at timestamptz default now()
);

-- 未解決論点
create table open_issues (
  id uuid primary key default gen_random_uuid(),
  group_id text references groups,
  topic text,
  description text,
  status text default 'open',          -- open/resolved/escalated
  created_at timestamptz default now()
);

-- ナレッジ（RAG用）
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  category text,
  source text,
  content text,
  embedding vector(1536),
  updated_at timestamptz default now()
);

-- ハンドオフ
create table handoffs (
  id uuid primary key default gen_random_uuid(),
  group_id text references groups,
  reason text,
  summary text,                        -- AIが生成した要約
  status text default 'pending',
  assigned_to text,                    -- カウンセラーID
  created_at timestamptz default now()
);
```

## 5. 主要フロー

### 5.1 Webhookの基本処理
```
[LINE Webhook]
  → 署名検証 (X-Line-Signature)
  → イベント種別ルーティング
      - follow      → 1:1ウェルカム送信
      - message     → 意図分類 → AI応答 or 沈黙
      - join        → グループ初期化 + 自己紹介
      - leave       → グループのマーク
      - memberJoined → メンバー追加
      - postback    → Quick Reply / リッチメニュー処理
  → 添付があれば即時取得 → Supabase Storage保存
  → 全イベントを messages テーブルに記録
  → 200 を5秒以内に返す（重い処理はキューへ）
```

### 5.2 AI応答（メンション or 直接呼び出し時）
```
1. 直近 N 件のグループメッセージ取得
2. 重要決定ログ・未解決論点を要約してコンテキストに注入
3. 質問を意図分類
   - 相談    → RAG検索 → Claude Sonnetで応答生成
   - 操作    → コマンド処理（黙って/退出 など）
   - SOS    → ハンドオフ起票 + 来店誘導CTA
4. ガードレール：「分からない」「専門家に相談すべき」を許容
5. 応答送信
6. 重要発言だったら decisions / open_issues を更新
```

### 5.3 「黙って」「退出」処理
- 「Auka 黙って」→ groups.silent = true、以降はメンション以外無視
- 「Auka 戻って」→ silent = false
- 「Auka 退出」→ leaveGroup API呼び出し、グループ状態を archived に
- 「データも削除して」→ groupId配下を物理削除

## 6. 開発スケジュール（8週間）

| 週 | テーマ | 主な成果物 |
|---|---|---|
| 1 | 基盤 | リポジトリ・CI・Vercel/Supabase接続・LINEチャネル発行 |
| 2 | Webhook基盤 | 署名検証・イベントルーティング・DBスキーマ・添付取得 |
| 3 | オンボA | 1:1ウェルカム・Quick Reply・軽量プロファイリング |
| 4 | オンボB | LIFFチュートリアル・グループ招待UI・joinイベント処理 |
| 5 | AI応答 | 意図分類・RAG（pgvector）・Claude Sonnet統合・ガードレール |
| 6 | 沈黙運用 | メンション検知・操作コマンド・コンテキスト管理・決定ログ抽出 |
| 7 | 管理画面 | カウンセラー向けグループ一覧・会話要約・ハンドオフ起票 |
| 8 | クローズドβ | 実夫婦5〜10組で検証・観測・改善 |

## 7. リリース判定基準（Go/No-Go）

クローズドβ（5〜10組）で以下を達成したら、社内ベータ→限定公開へ：

- グループ招待完了率 > 40%（招待ガイド到達者ベース）
- 招待後7日のアクティブ率 > 50%
- 重大な誤情報（補助金額・法令解釈）の発生率 0件
- 平均応答時間 < 5秒（中央値）
- 「うざい」「黙ってほしい」フィードバックが招待組の30%未満

## 8. リスクと先回り対応

| リスク | 影響 | 先回り |
|---|---|---|
| LINE OA AIモード（夏）と機能が重複し、後から作り直しになる | 中 | オーケストレーション層を **抽象化**しておき、後でLINE側に置換可能な設計に |
| Claude API のコスト超過 | 中 | Prompt Caching必須・1グループあたりの月次トークン上限を設定 |
| 工務店から「うちのグループにも入れたい」とB営業の圧 | 中 | MVP期間はC向け固定、Bは Phase 2 検討 |
| 夫婦の私的会話を保存することへの規制リスク | 高 | プライバシーポリシー法務確認・**個人情報の最小化**を初期から徹底 |
| 「料金が発生する」誤解 | 中 | 1:1ウェルカムで「無料」「営業しない」を明示 |
| LINEの規約変更（公式アカウントのグループ参加制限強化） | 中 | LINE Developers の規約・お知らせを週次でウォッチする運用ルール |

## 9. 開発開始前のブロッカー（要意思決定）

会食からお戻り後にご判断いただきたい項目：

1. **開発リソース**：内製 / 業務委託 / パートナー会社
2. **LINE公式アカウント**：Aukaの既存アカウントを使うか、新規発行か
3. **Anthropic APIキー**：法人契約の有無、Prompt Caching前提のコスト試算が必要
4. **クローズドβの被験者調達**：Auka既存顧客から募集？新規募集？
5. **法務レビュー**：プライバシーポリシー雛形をいつ誰が作るか
6. **管理画面のホスト先**：Vercel に同居するか、社内システムに寄せるか
7. **B側プロダクト（工務店向け）の優先度**：MVP後すぐ作るか、まずC側を1〜2四半期回すか

## 10. このドキュメントの位置付け

- 本ドキュメントは v0.1（叩き台）
- 上記「9. ブロッカー」が決まり次第 v0.2 で具体スケジュールに落とす
- 関連：[onboarding-ux.md](./onboarding-ux.md), [README.md](./README.md)
