// === Constants (Updated: S19 2026/06/16) ===
const CH = 'C0B3VMRH2UR';
const STRICT = 1500, FREE = 2200, TDEE = 2230;
const STRICT_DAYS = 4, FREE_DAYS_WEEK = 3;
const WEEKLY_PLAN = STRICT * STRICT_DAYS + FREE * FREE_DAYS_WEEK;
const DAILY_PLAN_AVG = Math.round(WEEKLY_PLAN / 7);
const DAILY_DEFICIT_PLAN = TDEE - DAILY_PLAN_AVG;
const PROTEIN_TARGET = 140, PROTEIN_MIN = 100;
const TRAIN_BURN = 200, AFTERBURN_MULT = 1.15;
const TRAIN_TDEE = Math.round(TDEE * AFTERBURN_MULT);
const TGT_BF = 15.0, CUR_BF = 25.7, CUR_FAT = 18.4, LEAN = 53.2;
const TGT_FAT = +(LEAN * TGT_BF / (100 - TGT_BF)).toFixed(1);
const FAT_TO_LOSE = +(CUR_FAT - TGT_FAT).toFixed(1);
const PLAN_MONTHLY = +(DAILY_DEFICIT_PLAN * 30 / 7200).toFixed(1);
const PLAN_MONTHS = Math.round(FAT_TO_LOSE / PLAN_MONTHLY);
const FAT_MIN = 17.8; // 体脂肪量の過去最小値（★★★S21更新 初の17kg台！）
const FREE_HARD_CAP = 2500; // 飲食日の絶対上限（教訓: 2026/06/11 Slack実績分析）
const ALCOHOL_CAP = 3; // アルコール杯数上限

// ===== Body Composition Storage =====
const BC_KEY = 'calGuide_bodyComp';
const SEED_DATA = [
  { date:'2025-05-01', session:'初回', weight:71.7, muscle:null, fatMass:21.2, fatPct:30.1, waist:89.0, inbody:null, note:'骨格筋量25.4kg, 基礎代謝1472kcal' },
  { date:'2025-05-20', session:'S1', weight:72.0, muscle:null, fatMass:21.0, fatPct:29.5, waist:null, inbody:null, note:'' },
  { date:'2025-06-18', session:'S2', weight:72.5, muscle:null, fatMass:20.5, fatPct:28.5, waist:null, inbody:null, note:'フォーム矯正開始' },
  { date:'2025-07-19', session:'S3', weight:73.0, muscle:null, fatMass:20.8, fatPct:28.8, waist:null, inbody:null, note:'MCTオイル再開' },
  { date:'2025-10-15', session:'S4', weight:73.0, muscle:null, fatMass:21.0, fatPct:29.0, waist:null, inbody:null, note:'隠れカロリー特定' },
  { date:'2025-11-22', session:'S5', weight:71.5, muscle:null, fatMass:19.0, fatPct:26.8, waist:null, inbody:null, note:'最大改善回' },
  { date:'2026-02-01', session:'S6', weight:71.0, muscle:null, fatMass:18.8, fatPct:26.5, waist:null, inbody:null, note:'食事管理強化' },
  { date:'2026-02-07', session:'S7', weight:null, muscle:null, fatMass:null, fatPct:null, waist:88.0, inbody:null, note:'ウエスト改善' },
  { date:'2026-03-26', session:'測定', weight:72.6, muscle:null, fatMass:18.5, fatPct:25.5, waist:null, inbody:null, note:'骨格筋量25.7kg, 基礎代謝1539kcal' },
  { date:'2026-04-11', session:'S9', weight:72.8, muscle:50.9, fatMass:18.7, fatPct:25.7, waist:86.5, inbody:72, note:'ウエスト最小値更新' },
  { date:'2026-04-18', session:'S10', weight:73.8, muscle:52.1, fatMass:18.5, fatPct:25.1, waist:87.5, inbody:null, note:'体脂肪量 過去最小タイ' },
  { date:'2026-04-26', session:'S11', weight:73.3, muscle:50.2, fatMass:20.0, fatPct:27.2, waist:87.0, inbody:null, note:'前日飲み会の影響' },
  { date:'2026-05-10', session:'S12', weight:73.5, muscle:51.5, fatMass:18.9, fatPct:25.7, waist:87.5, inbody:null, note:'家トレ開始1週目' },
  { date:'2026-05-12', session:'S13', weight:72.7, muscle:50.3, fatMass:19.3, fatPct:26.6, waist:null, inbody:null, note:'前日会食もコントロール成功' },
  { date:'2026-05-20', session:'S14', weight:73.2, muscle:51.4, fatMass:18.7, fatPct:25.5, waist:null, inbody:73, note:'カロリー管理アプリ開始' },
  { date:'2026-05-24', session:'S15', weight:73.2, muscle:50.8, fatMass:19.3, fatPct:26.3, waist:87.5, inbody:null, note:'出張後リカバリー回、ベンチ43.5kgクリア' },
  { date:'2026-05-31', session:'S16', weight:72.9, muscle:51.3, fatMass:18.5, fatPct:25.4, waist:87.0, inbody:null, note:'★体脂肪量18.5kg＝過去最小タイ' },
  { date:'2026-06-07', session:'S17', weight:72.3, muscle:50.5, fatMass:18.7, fatPct:25.9, waist:87.0, inbody:71, note:'台湾出張後、ベンチ46kg達成、GLP-1検討中' },
  { date:'2026-06-14', session:'S18', weight:72.5, muscle:50.9, fatMass:18.6, fatPct:25.6, waist:87.0, inbody:null, note:'懇親会連戦もキープ、インクライン41kg新記録、食事管理定着' },
  { date:'2026-06-16', session:'S19', weight:71.6, muscle:50.2, fatMass:18.4, fatPct:25.7, waist:null, inbody:null, note:'★体脂肪量18.4kg全期間最小値更新！体重71.6kgも最小、ロープーリー45kg、ラットプル筋肥大セット移行' },
  { date:'2026-06-21', session:'S20', weight:72.6, muscle:51.3, fatMass:18.2, fatPct:25.1, waist:86.5, inbody:null, note:'★★体脂肪量18.2kg全期間最小値更新！体脂肪率25.1%最良タイ、ウエスト86.5cm最小タイ、ラットプル45kgデビュー' },
  { date:'2026-06-24', session:'S21', weight:72.6, muscle:51.7, fatMass:17.8, fatPct:24.5, waist:null, inbody:74, note:'★★★体脂肪量17.8kg全期間最小値大幅更新（初の17kg台）！体脂肪率24.5%最良更新、ベンチ46kg補助なし10回、InBody74点最高、シックスパック出現' },
  { date:'2026-06-28', session:'S22', weight:72.9, muscle:51.9, fatMass:17.8, fatPct:24.4, waist:86.5, inbody:null, note:'★体脂肪率24.4%最良更新・体脂肪量17.8kg維持（17kg台キープ）。先生「体脂肪は横ばい→落ちるのが理想、今は理想の1周目」。インクライン41kg自力初成功。GLP-1オフで中途覚醒→就寝前プロテイン15g導入。水分増で一時的に体重増も慣れれば落ちる見込み。' },
];

function loadBodyComp() {
  let stored = null;
  try {
    const raw = localStorage.getItem(BC_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch(e) {}
  if (!stored || !stored.length) {
    // First load: seed with historical data
    localStorage.setItem(BC_KEY, JSON.stringify(SEED_DATA));
    return [...SEED_DATA];
  }
  // Merge: add any SEED_DATA entries not yet in localStorage (by date+session key)
  const existingKeys = new Set(stored.map(d => d.date + '|' + (d.session||'')));
  let merged = false;
  for (const seed of SEED_DATA) {
    const key = seed.date + '|' + (seed.session||'');
    if (!existingKeys.has(key)) {
      stored.push(seed);
      merged = true;
    }
  }
  if (merged) {
    stored.sort((a,b) => a.date.localeCompare(b.date));
    localStorage.setItem(BC_KEY, JSON.stringify(stored));
  }
  return stored;
}
function saveBodyComp(data) {
  localStorage.setItem(BC_KEY, JSON.stringify(data));
}

// ===== Training Log Storage =====
const TL_KEY = 'calGuide_trainingLog';

// Exercise categories for dropdown
const EXERCISE_CATEGORIES = {
  '胸': ['ベンチプレス（スミス）','インクラインベンチ（スミス）','インクラインダンベルフライ','ケーブルフライ/チェストフライ'],
  '背中': ['ラットプルダウン','ロープーリー'],
  '肩': ['サイドレイズ','ショルダープレス'],
  '脚': ['スクワット','モンスターウォーク','ヒップリフト'],
  '体幹': ['ハンズアップクランチ','プランク'],
};

const SEED_TRAINING = [
  { date:'2025-05-20', session:'S1', exercises:[
    {name:'ベンチプレス（スミス）',weight:25,reps:null,sets:null}
  ], comment:'初回チャレンジ。フォーム学習が中心。' },
  { date:'2025-07-19', session:'S3', exercises:[
    {name:'ベンチプレス（スミス）',weight:32.5,reps:10,sets:3}
  ], comment:'フォーム修正中。脂質不足発見→MCTオイル再開。' },
  { date:'2025-10-15', session:'S4', exercises:[
    {name:'ベンチプレス（スミス）',weight:32.5,reps:null,sets:null}
  ], comment:'フォーム維持。隠れカロリー特定。' },
  { date:'2025-11-22', session:'S5', exercises:[
    {name:'スクワット',weight:32.5,reps:10,sets:null},
    {name:'サイドレイズ',weight:4,reps:15,sets:null}
  ], comment:'★最大改善回。スクワット→次回35kgチャレンジへ。' },
  { date:'2026-02-07', session:'S7', exercises:[
    {name:'ベンチプレス（スミス）',weight:27.5,reps:null,sets:null},
    {name:'ケーブルフライ/チェストフライ',weight:15,reps:null,sets:null},
    {name:'ラットプルダウン',weight:null,reps:null,sets:null}
  ], comment:'体重減少中のキープ。ケーブルフライ10→15kgに増加。' },
  { date:'2026-04-05', session:'S8', exercises:[
    {name:'ベンチプレス（スミス）',weight:43.9,reps:null,sets:null}
  ], comment:'★5kgプレート使用、ベンチ重量更新！' },
  { date:'2026-04-11', session:'S9', waist:86.5, exercises:[
    {name:'ベンチプレス（スミス）',weight:43.5,reps:10,sets:3},
    {name:'ケーブルフライ/チェストフライ',weight:null,reps:13,sets:null},
    {name:'ラットプルダウン',weight:35,reps:15,sets:null},
    {name:'スクワット',weight:56,reps:null,sets:null}
  ], comment:'ベンチ2セット目8→10回に改善。ウエスト最小値更新。' },
  { date:'2026-04-18', session:'S10', waist:87.5, exercises:[
    {name:'インクラインベンチ（スミス）',weight:32.5,reps:10,sets:null},
    {name:'ケーブルフライ/チェストフライ',weight:null,reps:15,sets:null},
    {name:'スクワット',weight:56,reps:null,sets:null},
    {name:'サイドレイズ',weight:4,reps:null,sets:null}
  ], comment:'インクライン中心。ケーブルフライ過去最高15回。平日空腹でもインクライン上がった。' },
  { date:'2026-04-26', session:'S11', waist:87.0, exercises:[
    {name:'ベンチプレス（スミス）',weight:38.5,reps:11,sets:null},
    {name:'インクラインベンチ（スミス）',weight:32.5,reps:10,sets:null},
    {name:'ケーブルフライ/チェストフライ',weight:null,reps:15,sets:null},
    {name:'ラットプルダウン',weight:40,reps:15,sets:null},
    {name:'スクワット',weight:56,reps:12,sets:null},
    {name:'サイドレイズ',weight:4,reps:null,sets:null}
  ], comment:'体重-500gで回数キープ=100点（篠澤先生）。ラットプルダウン重量UP。' },
  { date:'2026-05-10', session:'S12', waist:87.5, exercises:[
    {name:'インクラインベンチ（スミス）',weight:38.5,reps:10,sets:2},
    {name:'ラットプルダウン',weight:40,reps:20,sets:null},
    {name:'スクワット',weight:58.5,reps:12,sets:null}
  ], comment:'★インクライン2セット目初の10回達成。ラットプル回数20回へ引上げ。スクワット+2.5kg。家トレ開始1週目。' },
  { date:'2026-05-12', session:'S13', exercises:[
    {name:'ベンチプレス（スミス）',weight:42.5,reps:10,sets:2},
    {name:'スクワット',weight:58.5,reps:12,sets:null}
  ], comment:'ベンチ10回が安定して上がるように。連続セッションでもスクワット維持。' },
  { date:'2026-05-20', session:'S14', exercises:[
    {name:'インクラインベンチ（スミス）',weight:38.5,reps:10,sets:null},
    {name:'ケーブルフライ/チェストフライ',weight:15,reps:15,sets:null},
    {name:'スクワット',weight:58.5,reps:12,sets:null}
  ], comment:'インクラインピークタイ・フォーム過去一。カロリー管理アプリ開始。' },
  { date:'2026-05-24', session:'S15', waist:87.5, exercises:[
    {name:'ベンチプレス（スミス）',weight:43.5,reps:10,sets:2},
    {name:'インクラインダンベルフライ',weight:null,reps:15,sets:null},
    {name:'ラットプルダウン',weight:40,reps:20,sets:3},
    {name:'スクワット',weight:58.5,reps:12,sets:null}
  ], comment:'★ベンチ43.5kg余裕クリア→次回46kgへ。ダンベルフライ13→15回記録更新（家トレ効果）。ラットプル3セット安定。' },
  { date:'2026-05-31', session:'S16', waist:87.0, exercises:[
    {name:'インクラインベンチ（スミス）',weight:38.5,reps:10,sets:2},
    {name:'ケーブルフライ/チェストフライ',weight:null,reps:15,sets:2},
    {name:'ラットプルダウン',weight:40,reps:17,sets:null},
    {name:'スクワット',weight:58.5,reps:12,sets:null}
  ], comment:'出張後もパワー維持。ウエスト87.0cm改善。体脂肪量18.5kg過去最小タイ。' },
  { date:'2026-06-07', session:'S17', waist:87.0, exercises:[
    {name:'ベンチプレス（スミス）',weight:46,reps:10,sets:null},
    {name:'インクラインダンベルフライ',weight:null,reps:15,sets:2},
    {name:'ラットプルダウン',weight:40,reps:20,sets:2},
    {name:'スクワット',weight:61,reps:12,sets:null}
  ], comment:'★ベンチ46kg自己ベスト更新！台湾出張疲れで粘り不足も完遂。スクワット58.5→61kgへ重量UP。' },
  { date:'2026-06-14', session:'S18', waist:87.0, exercises:[
    {name:'インクラインベンチ（スミス）',weight:41,reps:10,sets:2},
    {name:'ケーブルフライ/チェストフライ',weight:null,reps:15,sets:2},
    {name:'ラットプルダウン',weight:40,reps:null,sets:3},
    {name:'ロープーリー',weight:40,reps:15,sets:null},
    {name:'スクワット',weight:61,reps:12,sets:null}
  ], comment:'★インクライン41kg自己ベスト更新（+2.5kg）。ラットプル「今日が一番パワフル」（篠澤先生）。スクワット61kg定着。ロープーリー40kg×15回（従来35kg×20回から重量UP）。次回ロープーリー筋肥大セットへ。' },
  { date:'2026-06-16', session:'S19', exercises:[
    {name:'ロープーリー',weight:45,reps:13,sets:3},
    {name:'ラットプルダウン',weight:40,reps:12,sets:2},
    {name:'ベンチプレス（スミス）',weight:46,reps:10,sets:2},
    {name:'インクラインダンベルフライ',weight:10,reps:15,sets:2},
    {name:'サイドレイズ',weight:null,reps:12,sets:2},
    {name:'スクワット',weight:61,reps:12,sets:1},
    {name:'モンスターウォーク',weight:null,reps:null,sets:3},
    {name:'ハンズアップクランチ',weight:null,reps:15,sets:3}
  ], comment:'★体脂肪量18.4kg全期間最小値更新！ロープーリー40→45kgへ重量UP。ラットプル筋肥大セット移行（12回×2）。ベンチ46kgキープ、二の腕強化が課題。炭水化物はトレ前後に集中。篠澤先生「今までで一番いい日、おめでとうございます」' },
  { date:'2026-06-21', session:'S20', waist:86.5, exercises:[
    {name:'ラットプルダウン',weight:45,reps:12,sets:2},
    {name:'ロープーリー',weight:40,reps:15,sets:1},
    {name:'インクラインベンチ（スミス）',weight:41,reps:10,sets:2},
    {name:'ケーブルフライ/デックフライ',weight:15,reps:15,sets:2},
    {name:'サイドレイズ',weight:4,reps:15,sets:2},
    {name:'スクワット',weight:61,reps:17,sets:1},
    {name:'モンスターウォーク',weight:null,reps:null,sets:3},
    {name:'腹筋（下腹）',weight:null,reps:17,sets:3}
  ], comment:'★★体脂肪量18.2kg全期間最小値再更新！ラットプル45kgデビュー！ケーブルデックフライ「ついに脳と筋肉がつながった」MMC成立。肩のカット出てきた「河野さんの肩じゃないみたい」。スクワット61kg×17回（12→17回UP）。ウエスト86.5cm最小タイ。「この半年楽しみですよ」' },
  { date:'2026-06-24', session:'S21', exercises:[
    {name:'ロープーリー',weight:45,reps:13,sets:3},
    {name:'ラットプルダウン',weight:40,reps:12,sets:2},
    {name:'ベンチプレス（スミス）',weight:46,reps:10,sets:2},
    {name:'インクラインダンベルフライ',weight:10,reps:15,sets:2},
    {name:'ショルダープレス',weight:8,reps:12,sets:2},
    {name:'スクワット',weight:61,reps:12,sets:1},
    {name:'モンスターウォーク',weight:null,reps:null,sets:3},
    {name:'ハンズアップクランチ',weight:null,reps:15,sets:3}
  ], comment:'★★★体脂肪量17.8kg全期間最小値大幅更新（初の17kg台）！ベンチ46kg補助なし10回達成！フォーム改善（足→尻→アーチ→全身）。InBody74点最高。シックスパック出現。ショルダープレス8kg初記録。「ついにブレイク」' },
  { date:'2026-06-28', session:'S22', waist:86.5, exercises:[
    {name:'ラットプルダウン',weight:45,reps:12,sets:2},
    {name:'ロープーリー',weight:40,reps:15,sets:2},
    {name:'インクラインベンチ（スミス）',weight:41,reps:10,sets:2},
    {name:'ケーブルフライ/チェストフライ',weight:15,reps:15,sets:2},
    {name:'スクワット',weight:61,reps:12,sets:1},
    {name:'モンスターウォーク',weight:null,reps:null,sets:3},
    {name:'腹筋（下腹）',weight:null,reps:15,sets:2}
  ], comment:'★インクラインベンチ（スミス）41kg自力初成功（前回は7回＋5kg補助）！ラットプル45kg×12×2安定（3set目40kg×15）。今日はケーブルフライの日（ダンベルフライなし）。スクワットは重さより深さ＝腿と床が平行を課題に（60kgまでは深さ優先）。体脂肪量17.8kg維持・体脂肪率24.4%最良。先生「横ばいして落ちるのが理想、今は理想の1周目」。GLP-1オフで中途覚醒→就寝前プロテイン15g導入（睡眠優先、1500kcalは維持）。ウエスト86.5維持、健診まで約14日で85目標。' },
];

function loadTraining() {
  let stored = null;
  try {
    const raw = localStorage.getItem(TL_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch(e) {}
  if (!stored || !stored.length) {
    localStorage.setItem(TL_KEY, JSON.stringify(SEED_TRAINING));
    return [...SEED_TRAINING];
  }
  const existingKeys = new Set(stored.map(d => d.date + '|' + (d.session||'')));
  let merged = false;
  for (const seed of SEED_TRAINING) {
    const key = seed.date + '|' + (seed.session||'');
    if (!existingKeys.has(key)) {
      stored.push(seed);
      merged = true;
    }
  }
  if (merged) {
    stored.sort((a,b) => a.date.localeCompare(b.date));
    localStorage.setItem(TL_KEY, JSON.stringify(stored));
  }
  return stored;
}
function saveTraining(data) {
  localStorage.setItem(TL_KEY, JSON.stringify(data));
}

// === Waist (腹囲) measurement ===
const WS_KEY = 'calGuide_waist';
const SEED_WAIST = [
  { date:'2026-01-10', waist:88.0 },
  { date:'2026-01-18', waist:90.5 },
  { date:'2026-01-24', waist:88.5 },
  { date:'2026-02-01', waist:88.5 },
  { date:'2026-02-07', waist:88.0 },
  { date:'2026-02-15', waist:88.0 },
  { date:'2026-02-22', waist:87.0 },
  { date:'2026-02-28', waist:87.0 },
  { date:'2026-03-08', waist:87.0 },
  { date:'2026-03-15', waist:87.0 },
  { date:'2026-03-22', waist:87.0 },
  { date:'2026-03-28', waist:87.0 },
  { date:'2026-04-05', waist:87.5 },
  { date:'2026-04-11', waist:86.5 },
  { date:'2026-04-18', waist:87.5 },
  { date:'2026-04-22', waist:86.5 },
  { date:'2026-04-26', waist:87.0 },
  { date:'2026-05-03', waist:87.5 },
  { date:'2026-05-10', waist:87.5 },
  { date:'2026-05-24', waist:87.5 },
  { date:'2026-05-31', waist:87.0 },
  { date:'2026-06-07', waist:87.0 },
  { date:'2026-06-14', waist:87.0 },
  { date:'2026-06-21', waist:86.5 },
  { date:'2026-06-28', waist:86.5 },
];
function loadWaist() {
  let stored = null;
  try {
    const raw = localStorage.getItem(WS_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch(e) {}
  if (!stored || !stored.length) {
    localStorage.setItem(WS_KEY, JSON.stringify(SEED_WAIST));
    return [...SEED_WAIST];
  }
  const existingKeys = new Set(stored.map(d => d.date));
  let merged = false;
  for (const seed of SEED_WAIST) {
    if (!existingKeys.has(seed.date)) {
      stored.push(seed);
      merged = true;
    }
  }
  if (merged) {
    stored.sort((a,b) => a.date.localeCompare(b.date));
    localStorage.setItem(WS_KEY, JSON.stringify(stored));
  }
  return stored;
}
function saveWaist(data) {
  localStorage.setItem(WS_KEY, JSON.stringify(data));
}

// === Daily measurement (Tanita) ===
const DM_KEY = 'calGuide_dailyMeasure';
const SEED_DAILY = [
  // 2025年7月
  { date:'2025-07-01', weight:71.2, fatPct:25.6, muscle:50.3 },
  { date:'2025-07-06', weight:71.4, fatPct:24.7, muscle:51.0 },
  { date:'2025-07-08', weight:70.8, fatPct:24.6, muscle:50.6 },
  { date:'2025-07-09', weight:71.7, fatPct:25.3, muscle:50.8 },
  { date:'2025-07-10', weight:72.5, fatPct:25.1, muscle:51.5 },
  { date:'2025-07-11', weight:72.1, fatPct:24.8, muscle:51.4 },
  { date:'2025-07-15', weight:72.2, fatPct:25.2, muscle:51.2 },
  { date:'2025-07-22', weight:73.5, fatPct:25.3, muscle:52.1 },
  { date:'2025-07-31', weight:72.8, fatPct:25.7, muscle:51.3 },
  // 2025年8月
  { date:'2025-08-01', weight:73.1, fatPct:25.9, muscle:51.4 },
  { date:'2025-08-04', weight:74.2, fatPct:26.0, muscle:52.1 },
  { date:'2025-08-18', weight:74.4, fatPct:26.2, muscle:52.0 },
  { date:'2025-08-19', weight:73.8, fatPct:25.4, muscle:52.2 },
  { date:'2025-08-23', weight:73.0, fatPct:25.7, muscle:51.4 },
  { date:'2025-08-25', weight:73.0, fatPct:25.3, muscle:51.7 },
  { date:'2025-08-28', weight:71.9, fatPct:25.0, muscle:51.1 },
  // 2025年9月
  { date:'2025-09-01', weight:74.3, fatPct:25.8, muscle:52.3 },
  { date:'2025-09-04', weight:72.2, fatPct:25.6, muscle:50.9 },
  { date:'2025-09-05', weight:73.2, fatPct:25.5, muscle:51.7 },
  { date:'2025-09-08', weight:74.4, fatPct:25.8, muscle:52.3 },
  { date:'2025-09-10', weight:73.7, fatPct:25.9, muscle:51.8 },
  { date:'2025-09-11', weight:72.9, fatPct:25.4, muscle:51.6 },
  { date:'2025-09-12', weight:73.8, fatPct:25.3, muscle:52.2 },
  { date:'2025-09-15', weight:74.1, fatPct:26.5, muscle:51.6 },
  { date:'2025-09-28', weight:72.5, fatPct:25.6, muscle:51.1 },
  { date:'2025-09-30', weight:72.3, fatPct:25.3, muscle:51.2 },
  // 2025年10月
  { date:'2025-10-07', weight:71.3, fatPct:25.2, muscle:50.5 },
  { date:'2025-10-08', weight:71.8, fatPct:25.2, muscle:50.9 },
  { date:'2025-10-09', weight:71.6, fatPct:25.3, muscle:50.7 },
  { date:'2025-10-10', weight:73.3, fatPct:24.6, muscle:52.5 },
  { date:'2025-10-13', weight:73.8, fatPct:24.6, muscle:52.7 },
  { date:'2025-10-14', weight:73.2, fatPct:24.9, muscle:52.1 },
  { date:'2025-10-15', weight:74.1, fatPct:25.7, muscle:52.2 },
  { date:'2025-10-21', weight:72.0, fatPct:24.9, muscle:51.3 },
  { date:'2025-10-22', weight:71.3, fatPct:24.6, muscle:50.9 },
  { date:'2025-10-23', weight:71.5, fatPct:25.1, muscle:50.8 },
  { date:'2025-10-25', weight:72.6, fatPct:25.0, muscle:51.6 },
  { date:'2025-10-26', weight:72.4, fatPct:26.0, muscle:50.8 },
  { date:'2025-10-27', weight:71.1, fatPct:24.5, muscle:50.9 },
  { date:'2025-10-28', weight:70.8, fatPct:24.6, muscle:50.6 },
  { date:'2025-10-30', weight:70.9, fatPct:24.4, muscle:50.8 },
  { date:'2025-10-31', weight:70.6, fatPct:23.9, muscle:50.9 },
  // 2025年11月
  { date:'2025-11-01', weight:70.3, fatPct:25.0, muscle:50.0 },
  { date:'2025-11-02', weight:70.2, fatPct:24.1, muscle:50.5 },
  { date:'2025-11-03', weight:70.8, fatPct:24.2, muscle:50.8 },
  { date:'2025-11-04', weight:70.8, fatPct:24.1, muscle:51.0 },
  { date:'2025-11-05', weight:70.5, fatPct:23.9, muscle:50.9 },
  { date:'2025-11-06', weight:71.0, fatPct:25.2, muscle:50.3 },
  { date:'2025-11-07', weight:70.5, fatPct:24.4, muscle:50.5 },
  { date:'2025-11-08', weight:70.5, fatPct:24.7, muscle:50.3 },
  { date:'2025-11-09', weight:70.8, fatPct:24.2, muscle:50.8 },
  { date:'2025-11-10', weight:70.6, fatPct:24.4, muscle:50.6 },
  { date:'2025-11-11', weight:70.8, fatPct:24.4, muscle:50.7 },
  { date:'2025-11-12', weight:70.6, fatPct:24.1, muscle:50.8 },
  { date:'2025-11-14', weight:69.6, fatPct:23.9, muscle:50.2 },
  { date:'2025-11-15', weight:70.8, fatPct:24.2, muscle:50.9 },
  { date:'2025-11-16', weight:70.8, fatPct:24.1, muscle:51.0 },
  { date:'2025-11-17', weight:70.8, fatPct:24.3, muscle:50.9 },
  { date:'2025-11-21', weight:70.5, fatPct:23.9, muscle:50.9 },
  { date:'2025-11-22', weight:70.6, fatPct:24.4, muscle:50.6 },
  { date:'2025-11-23', weight:70.6, fatPct:24.2, muscle:50.7 },
  { date:'2025-11-24', weight:70.8, fatPct:24.9, muscle:50.4 },
  { date:'2025-11-25', weight:70.3, fatPct:24.1, muscle:50.5 },
  { date:'2025-11-26', weight:70.9, fatPct:23.4, muscle:51.5 },
  { date:'2025-11-27', weight:71.1, fatPct:24.0, muscle:51.2 },
  { date:'2025-11-28', weight:71.0, fatPct:25.1, muscle:50.4 },
  { date:'2025-11-29', weight:71.0, fatPct:24.4, muscle:50.9 },
  // 2025年12月
  { date:'2025-12-01', weight:71.9, fatPct:24.7, muscle:51.3 },
  { date:'2025-12-02', weight:71.0, fatPct:24.8, muscle:50.6 },
  { date:'2025-12-03', weight:70.7, fatPct:24.4, muscle:50.7 },
  { date:'2025-12-04', weight:70.4, fatPct:24.3, muscle:50.5 },
  { date:'2025-12-05', weight:70.8, fatPct:24.7, muscle:50.5 },
  { date:'2025-12-08', weight:71.1, fatPct:24.4, muscle:51.0 },
  { date:'2025-12-10', weight:70.9, fatPct:25.0, muscle:50.5 },
  { date:'2025-12-11', weight:71.6, fatPct:24.6, muscle:51.2 },
  { date:'2025-12-12', weight:72.0, fatPct:24.3, muscle:51.7 },
  { date:'2025-12-13', weight:71.6, fatPct:24.8, muscle:51.0 },
  { date:'2025-12-14', weight:72.1, fatPct:25.5, muscle:50.9 },
  { date:'2025-12-16', weight:71.3, fatPct:24.9, muscle:50.8 },
  { date:'2025-12-17', weight:72.6, fatPct:24.4, muscle:52.0 },
  { date:'2025-12-18', weight:71.8, fatPct:24.5, muscle:51.4 },
  { date:'2025-12-21', weight:72.0, fatPct:25.4, muscle:50.9 },
  { date:'2025-12-22', weight:72.7, fatPct:24.7, muscle:51.9 },
  { date:'2025-12-23', weight:72.2, fatPct:24.9, muscle:51.4 },
  { date:'2025-12-24', weight:70.9, fatPct:24.2, muscle:50.9 },
  { date:'2025-12-25', weight:71.4, fatPct:24.5, muscle:51.1 },
  { date:'2025-12-26', weight:71.0, fatPct:24.6, muscle:50.8 },
  { date:'2025-12-27', weight:73.2, fatPct:25.3, muscle:51.8 },
  { date:'2025-12-31', weight:73.3, fatPct:25.2, muscle:52.0 },
  // 2026年1月
  { date:'2026-01-07', weight:73.8, fatPct:26.7, muscle:51.3 },
  { date:'2026-01-08', weight:72.9, fatPct:25.0, muscle:51.8 },
  { date:'2026-01-09', weight:73.7, fatPct:25.5, muscle:52.0 },
  { date:'2026-01-10', weight:73.0, fatPct:25.2, muscle:51.8 },
  { date:'2026-01-12', weight:72.6, fatPct:24.6, muscle:51.9 },
  { date:'2026-01-13', weight:72.5, fatPct:24.7, muscle:51.8 },
  { date:'2026-01-14', weight:73.3, fatPct:24.9, muscle:52.2 },
  { date:'2026-01-15', weight:73.4, fatPct:24.6, muscle:52.5 },
  { date:'2026-01-16', weight:72.8, fatPct:24.7, muscle:51.9 },
  { date:'2026-01-21', weight:72.8, fatPct:24.5, muscle:52.1 },
  { date:'2026-01-22', weight:72.3, fatPct:25.3, muscle:51.2 },
  { date:'2026-01-23', weight:72.5, fatPct:24.5, muscle:51.9 },
  { date:'2026-01-24', weight:72.5, fatPct:24.0, muscle:52.2 },
  { date:'2026-01-25', weight:73.1, fatPct:24.6, muscle:52.2 },
  { date:'2026-01-26', weight:72.2, fatPct:24.7, muscle:51.5 },
  { date:'2026-01-27', weight:71.4, fatPct:24.1, muscle:51.4 },
  { date:'2026-01-29', weight:71.6, fatPct:24.3, muscle:51.4 },
  { date:'2026-01-31', weight:71.7, fatPct:24.0, muscle:51.7 },
  // 2026年2月
  { date:'2026-02-02', weight:71.9, fatPct:24.1, muscle:51.7 },
  { date:'2026-02-03', weight:71.3, fatPct:24.2, muscle:51.2 },
  { date:'2026-02-04', weight:71.3, fatPct:25.2, muscle:50.6 },
  { date:'2026-02-05', weight:71.0, fatPct:24.0, muscle:51.2 },
  { date:'2026-02-06', weight:71.1, fatPct:24.3, muscle:51.0 },
  { date:'2026-02-08', weight:71.1, fatPct:24.4, muscle:51.0 },
  { date:'2026-02-09', weight:71.1, fatPct:24.1, muscle:51.1 },
  { date:'2026-02-10', weight:71.5, fatPct:24.2, muscle:51.4 },
  { date:'2026-02-11', weight:70.7, fatPct:24.2, muscle:50.8 },
  { date:'2026-02-13', weight:71.2, fatPct:23.9, muscle:51.4 },
  { date:'2026-02-14', weight:70.9, fatPct:24.0, muscle:51.0 },
  { date:'2026-02-16', weight:71.5, fatPct:25.1, muscle:50.8 },
  { date:'2026-02-17', weight:70.8, fatPct:23.8, muscle:51.2 },
  { date:'2026-02-18', weight:70.3, fatPct:24.3, muscle:50.4 },
  { date:'2026-02-19', weight:71.0, fatPct:24.2, muscle:51.0 },
  { date:'2026-02-20', weight:71.8, fatPct:23.5, muscle:52.1 },
  { date:'2026-02-22', weight:71.0, fatPct:25.4, muscle:50.2 },
  { date:'2026-02-23', weight:71.4, fatPct:24.0, muscle:51.4 },
  { date:'2026-02-24', weight:70.3, fatPct:23.8, muscle:50.8 },
  { date:'2026-02-26', weight:71.9, fatPct:24.1, muscle:51.7 },
  { date:'2026-02-27', weight:70.6, fatPct:23.9, muscle:51.0 },
  { date:'2026-02-28', weight:71.4, fatPct:23.8, muscle:51.6 },
  // 2026年3月
  { date:'2026-03-01', weight:70.6, fatPct:24.1, muscle:50.8 },
  { date:'2026-03-02', weight:71.1, fatPct:23.9, muscle:51.3 },
  { date:'2026-03-03', weight:70.3, fatPct:24.0, muscle:50.7 },
  { date:'2026-03-04', weight:70.1, fatPct:24.0, muscle:50.5 },
  { date:'2026-03-05', weight:70.1, fatPct:23.6, muscle:50.8 },
  { date:'2026-03-06', weight:70.4, fatPct:23.9, muscle:50.8 },
  { date:'2026-03-07', weight:70.6, fatPct:23.4, muscle:51.2 },
  { date:'2026-03-09', weight:70.9, fatPct:24.2, muscle:51.0 },
  { date:'2026-03-10', weight:71.0, fatPct:24.4, muscle:50.9 },
  { date:'2026-03-11', weight:70.6, fatPct:23.7, muscle:51.1 },
  { date:'2026-03-14', weight:72.0, fatPct:23.9, muscle:52.0 },
  { date:'2026-03-15', weight:71.3, fatPct:24.3, muscle:51.1 },
  { date:'2026-03-16', weight:71.4, fatPct:24.8, muscle:50.9 },
  { date:'2026-03-17', weight:70.5, fatPct:23.9, muscle:50.8 },
  { date:'2026-03-18', weight:70.5, fatPct:23.9, muscle:50.8 },
  { date:'2026-03-19', weight:70.1, fatPct:23.3, muscle:51.0 },
  { date:'2026-03-20', weight:71.1, fatPct:23.7, muscle:51.5 },
  { date:'2026-03-23', weight:71.0, fatPct:24.3, muscle:51.0 },
  { date:'2026-03-24', weight:70.7, fatPct:23.5, muscle:51.3 },
  { date:'2026-03-25', weight:70.6, fatPct:24.0, muscle:50.9 },
  { date:'2026-03-26', weight:70.6, fatPct:24.4, muscle:50.6 },
  { date:'2026-03-28', weight:72.8, fatPct:24.8, muscle:51.9 },
  { date:'2026-03-29', weight:70.7, fatPct:23.8, muscle:51.1 },
  { date:'2026-03-30', weight:71.4, fatPct:23.9, muscle:51.5 },
  { date:'2026-03-31', weight:71.2, fatPct:24.5, muscle:51.0 },
  // 2026年4月
  { date:'2026-04-01', weight:71.5, fatPct:23.9, muscle:51.6 },
  { date:'2026-04-02', weight:71.1, fatPct:23.8, muscle:51.4 },
  { date:'2026-04-06', weight:72.2, fatPct:23.8, muscle:52.2 },
  { date:'2026-04-07', weight:72.0, fatPct:24.1, muscle:51.8 },
  { date:'2026-04-08', weight:71.4, fatPct:24.8, muscle:50.9 },
  { date:'2026-04-09', weight:71.3, fatPct:24.0, muscle:51.3 },
  { date:'2026-04-11', weight:72.4, fatPct:24.2, muscle:52.0 },
  { date:'2026-04-13', weight:71.9, fatPct:24.0, muscle:51.8 },
  { date:'2026-04-21', weight:72.5, fatPct:24.5, muscle:51.9 },
  { date:'2026-04-22', weight:72.6, fatPct:25.2, muscle:51.5 },
  { date:'2026-04-24', weight:71.9, fatPct:24.8, muscle:51.3 },
  { date:'2026-04-25', weight:72.4, fatPct:24.0, muscle:52.2 },
  { date:'2026-04-26', weight:72.5, fatPct:23.9, muscle:52.3 },
  { date:'2026-04-27', weight:72.5, fatPct:23.7, muscle:52.4 },
  { date:'2026-04-29', weight:72.3, fatPct:24.4, muscle:51.8 },
  // 2026年5月
  { date:'2026-05-01', weight:72.1, fatPct:25.5, muscle:50.9 },
  { date:'2026-05-02', weight:72.1, fatPct:25.2, muscle:51.1 },
  { date:'2026-05-07', weight:73.8, fatPct:24.0, muscle:53.2 },
  { date:'2026-05-08', weight:72.2, fatPct:25.1, muscle:51.3 },
  { date:'2026-05-09', weight:72.4, fatPct:25.5, muscle:51.1 },
  { date:'2026-05-11', weight:73.0, fatPct:24.4, muscle:52.3 },
  { date:'2026-05-12', weight:73.3, fatPct:24.5, muscle:52.5 },
  { date:'2026-05-14', weight:73.6, fatPct:25.1, muscle:52.2 },
  { date:'2026-05-15', weight:72.4, fatPct:24.0, muscle:52.2 },
  { date:'2026-05-16', weight:72.9, fatPct:24.3, muscle:52.3 },
  { date:'2026-05-19', weight:72.6, fatPct:24.2, muscle:52.1 },
  { date:'2026-05-20', weight:73.0, fatPct:24.0, muscle:52.6 },
  { date:'2026-05-21', weight:72.3, fatPct:24.9, muscle:51.5 },
  { date:'2026-05-24', weight:73.0, fatPct:24.2, muscle:52.5 },
  { date:'2026-05-25', weight:72.3, fatPct:24.5, muscle:51.8 },
  { date:'2026-05-26', weight:72.1, fatPct:24.3, muscle:51.7 },
  { date:'2026-05-27', weight:72.1, fatPct:24.0, muscle:52.0 },
  { date:'2026-05-28', weight:72.5, fatPct:24.4, muscle:52.0 },
  { date:'2026-05-29', weight:72.2, fatPct:23.8, muscle:52.1 },
  { date:'2026-05-31', weight:72.3, fatPct:23.7, muscle:52.3 },
  // 2026年6月
  { date:'2026-06-01', weight:71.2, fatPct:23.6, muscle:51.6 },
  { date:'2026-06-02', weight:71.2, fatPct:24.0, muscle:51.3 },
  { date:'2026-06-03', weight:70.9, fatPct:23.8, muscle:51.2 },
  { date:'2026-06-04', weight:71.6, fatPct:24.0, muscle:51.6 },
  { date:'2026-06-05', weight:71.8, fatPct:23.7, muscle:51.9 },
  { date:'2026-06-08', weight:72.0, fatPct:24.3, muscle:51.6 },
  { date:'2026-06-09', weight:71.3, fatPct:23.7, muscle:51.6 },
  { date:'2026-06-10', weight:71.4, fatPct:24.7, muscle:50.9 },
  { date:'2026-06-11', weight:71.8, fatPct:23.9, muscle:51.8 },
  { date:'2026-06-12', weight:72.7, fatPct:23.9, muscle:52.4 },
  { date:'2026-06-14', weight:72.6, fatPct:25.0, muscle:51.7 },
  { date:'2026-06-15', weight:72.1, fatPct:23.9, muscle:52.0 },
  { date:'2026-06-16', weight:71.8, fatPct:23.5, muscle:52.1 },
  { date:'2026-06-17', weight:71.0, fatPct:23.4, muscle:51.6 },
  { date:'2026-06-18', weight:71.3, fatPct:23.6, muscle:51.7 },
];

function loadDaily() {
  let stored = null;
  try { const raw = localStorage.getItem(DM_KEY); if (raw) stored = JSON.parse(raw); } catch(e) {}
  if (!stored || !stored.length) { localStorage.setItem(DM_KEY, JSON.stringify(SEED_DAILY)); return [...SEED_DAILY]; }
  const existingKeys = new Set(stored.map(d => d.date));
  let merged = false;
  for (const seed of SEED_DAILY) {
    if (!existingKeys.has(seed.date)) { stored.push(seed); merged = true; }
  }
  if (merged) { stored.sort((a,b) => a.date.localeCompare(b.date)); localStorage.setItem(DM_KEY, JSON.stringify(stored)); }
  return stored;
}
function saveDaily(data) { localStorage.setItem(DM_KEY, JSON.stringify(data)); }

// === Meal records (formerly fed by Slack; now stored locally) ===
const MEALS_KEY = 'calGuide_meals';
// PFC補完データ（Slackパーサーで取得できなかった日を明示補完。data/seed_cal_supplement.json と同一）
const SEED_CAL_SUPPLEMENT = {
  '2026-05-14': { protein:120,   fat:52,   carb:160 },
  '2026-05-20': { protein:119.7, fat:73.6, carb:141.4 },
  '2026-05-21': { protein:150.4, fat:67.8, carb:63.8 },
  '2026-05-23': { protein:81,    fat:84,   carb:260 },
  '2026-05-25': { protein:96,    fat:69,   carb:92 },
  '2026-06-06': { protein:107,   fat:92,   carb:298 },
  '2026-06-10': { protein:95,    fat:61,   carb:121 },
  '2026-06-11': { protein:133.7, fat:38.7, carb:219.2 },
  '2026-06-16': { protein:146.3, fat:41.0, carb:135.2 },
  '2026-06-21': { protein:136.1, fat:37.0, carb:164.7 },
  '2026-06-23': { protein:154,   fat:58,   carb:193 },
};
function loadMeals() {
  try { const raw = localStorage.getItem(MEALS_KEY); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a; } } catch(e) {}
  return [];
}
function saveMeals(data) { localStorage.setItem(MEALS_KEY, JSON.stringify(data)); }

// === Profile & TDEE estimation（実測 vs 予測式） ===
const PROFILE_KEY = 'calGuide_profile';
const ACTIVITY_LEVELS = [
  { v: 1.2,   label: 'ほぼ運動なし（座位中心）' },
  { v: 1.375, label: '軽い運動（週1〜2回）' },
  { v: 1.55,  label: '中程度（週3〜5回）' },
  { v: 1.725, label: '激しい（週6〜7回）' },
];
const PROFILE_DEFAULT = { age: 39, heightCm: 169, activity: 1.375, tdeeMode: 'measured', manualTDEE: 2230 };
function loadProfile() {
  try { const raw = localStorage.getItem(PROFILE_KEY); if (raw) { const p = JSON.parse(raw); if (p && typeof p === 'object') return { ...PROFILE_DEFAULT, ...p }; } } catch(e) {}
  return { ...PROFILE_DEFAULT };
}
function saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }

// 最新の実測体組成（体脂肪率がある最新日）。なければ旧定数にフォールバック。
function liveBodyComp() {
  // 体重・体脂肪率の「直近7日移動平均」を現在地アンカーとする（単発の測定ノイズを避ける）。
  const dm = loadDaily().filter(d => d.weight != null && d.fatPct != null).sort((a, b) => a.date.localeCompare(b.date));
  if (!dm.length) return { weight: +(CUR_FAT + LEAN).toFixed(1), fatPct: CUR_BF, fatMass: CUR_FAT, lbm: LEAN, muscle: null, date: null, n: 0, fallback: true };
  const last = dm.length - 1;
  const weight = +calcMA(dm, 'weight', last, 7).toFixed(1);
  const fatPct = +calcMA(dm, 'fatPct', last, 7).toFixed(1);
  const mMA = calcMA(dm, 'muscle', last, 7);
  const fatMass = +(weight * fatPct / 100).toFixed(1);
  const lbm = +(weight - fatMass).toFixed(1);
  return { weight, fatPct, fatMass, lbm, muscle: (mMA != null ? +mMA.toFixed(1) : null), date: dm[last].date, n: Math.min(7, dm.length), fallback: false };
}

// 予測式TDEE（Harris-Benedict改定版 BMR × 活動係数）。体重は最新実測。
function predictTDEE(profile, weight) {
  const w = weight || 72;
  const bmr = 88.362 + 13.397 * w + 4.799 * profile.heightCm - 5.677 * profile.age;
  return { bmr: Math.round(bmr), tdee: Math.round(bmr * profile.activity) };
}

// 実測TDEE（エネルギー収支の逆算）。食事ログの平均摂取＋体重トレンド×7200。
function estimateTDEEMeasured() {
  const KCAL_PER_KG = 7200;
  const meals = loadMeals().filter(m => m.kcal);
  const dm = loadDaily().filter(d => d.weight != null);
  const out = { confident: false, tdee: null, meanIntake: null, deficitPerDay: null, slopeKgPerMonth: null, nIntake: meals.length, nWeight: 0, start: null, end: null, spanDays: 0 };
  if (meals.length < 14) return out;
  const dates = meals.map(m => m.date).sort();
  const start = dates[0], end = dates[dates.length - 1];
  out.start = start; out.end = end;
  out.meanIntake = Math.round(meals.reduce((s, m) => s + m.kcal, 0) / meals.length);
  const win = dm.filter(d => d.date >= start && d.date <= end).sort((a, b) => a.date.localeCompare(b.date));
  out.nWeight = win.length;
  if (win.length < 6) return out;
  const toNum = s => Math.round(new Date(s + 'T12:00:00').getTime() / 86400000);
  const x0 = toNum(win[0].date);
  const xs = win.map(d => toNum(d.date) - x0);
  const ys = win.map(d => d.weight);
  out.spanDays = xs[xs.length - 1] + 1;
  if (out.spanDays < 21) return out;
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const slope = den ? num / den : 0; // kg/day（減量中は負）
  out.confident = true;
  out.tdee = Math.round(out.meanIntake + (-slope) * KCAL_PER_KG);
  out.deficitPerDay = Math.round(out.tdee - out.meanIntake);
  out.slopeKgPerMonth = +(slope * 30).toFixed(2);
  return out;
}

// 1日の推定アルコールkcal（残差法：総kcal − PFC由来kcal）。PFCが無ければ0。
const ALC_FACTOR = 0.5; // 飲酒日の脂肪燃焼ストップ係数（固定）
function estAlcoholK(d) {
  if (d == null || d.protein == null) return 0;
  const r = d.kcal - (d.protein * 4 + (d.fat || 0) * 9 + (d.carb || 0) * 4);
  return Math.max(0, Math.round(r));
}

// モードに応じて採用するTDEEを返す（実測 / 予測式 / 手動）。実測がデータ不足なら予測式に自動フォールバック。
function effectiveTDEE() {
  const profile = loadProfile();
  const bc = liveBodyComp();
  const measured = estimateTDEEMeasured();
  const predicted = predictTDEE(profile, bc.weight);
  let tdee, source;
  if (profile.tdeeMode === 'formula') { tdee = predicted.tdee; source = 'formula'; }
  else if (profile.tdeeMode === 'manual') { tdee = profile.manualTDEE; source = 'manual'; }
  else if (measured.confident) { tdee = measured.tdee; source = 'measured'; }
  else { tdee = predicted.tdee; source = 'formula-fallback'; }
  return { tdee, source, profile, bc, measured, predicted };
}
// 取得できなかった日のPFCを補完データで埋める
function enrichMealsPFC(meals) {
  return meals.map(d => {
    const s = SEED_CAL_SUPPLEMENT[d.date];
    if (!s) return d;
    return {
      ...d,
      protein: d.protein != null ? d.protein : s.protein,
      fat: d.fat != null ? d.fat : s.fat,
      carb: d.carb != null ? d.carb : s.carb,
    };
  });
}
// 貼り付けテキストを解析。Slackエクスポート（=== Message from 区切り）はそのまま、
// 手動貼り付け（複数の「M/D 食事レコード」を連続）は日付ヘッダーでブロック分割して解析。
function parseMealText(txt) {
  if (txt.includes('=== Message from')) return extractDays(txt);
  const lines = txt.split(/\r?\n/);
  const headerRe = /^\s*(?:\d{4}[年\/]\d{1,2}[月\/]\d{1,2}|\d{1,2}\/\d{1,2})/;
  const blocks = []; let cur = [];
  for (const ln of lines) {
    if (headerRe.test(ln) && cur.length) { blocks.push(cur.join('\n')); cur = [ln]; }
    else cur.push(ln);
  }
  if (cur.length) blocks.push(cur.join('\n'));
  const map = {};
  for (const b of blocks) for (const d of extractDays(b)) map[d.date] = d;
  return Object.values(map).sort((a,b)=>a.date.localeCompare(b.date));
}
// 既存の食事データに新しい日次データをマージ（同一日付は上書き）して保存
function mergeMeals(incoming) {
  const map = {};
  for (const d of loadMeals()) map[d.date] = d;
  for (const d of incoming) map[d.date] = { ...map[d.date], ...d };
  const merged = Object.values(map).sort((a,b)=>a.date.localeCompare(b.date));
  saveMeals(merged);
  return merged;
}

function calcLBM(d) {
  if (d.weight != null && d.fatPct != null) return +(d.weight * (1 - d.fatPct / 100)).toFixed(2);
  return null;
}
function calcFatMass(d) {
  if (d.weight != null && d.fatPct != null) return +(d.weight * d.fatPct / 100).toFixed(2);
  return null;
}
function enrichDaily(arr) {
  return arr.map(d => ({ ...d, lbm: calcLBM(d) }));
}
function calcMA(arr, field, idx, window) {
  let sum = 0, cnt = 0;
  for (let i = Math.max(0, idx - window + 1); i <= idx; i++) {
    const v = field === 'lbm' ? calcLBM(arr[i]) : field === 'fatMass' ? calcFatMass(arr[i]) : arr[i][field];
    if (v != null) { sum += v; cnt++; }
  }
  return cnt > 0 ? sum / cnt : null;
}

// === Slack parser ===
function parseSlack(raw) {
  let text = '';
  if (typeof raw === 'string') { text = raw; }
  else if (raw && typeof raw === 'object') {
    let inner = raw;
    if (Array.isArray(raw.content)) inner = raw.content.map(c => c.text || (typeof c === 'string' ? c : '')).join('\n');
    else if (typeof raw.content === 'string') inner = raw.content;
    if (typeof inner === 'string') {
      try { const p = JSON.parse(inner); text = typeof p.messages === 'string' ? p.messages : typeof p === 'string' ? p : inner; } catch(e) { text = inner; }
    } else if (inner && typeof inner === 'object') {
      text = typeof inner.messages === 'string' ? inner.messages : JSON.stringify(inner);
    }
    if (!text && typeof raw.messages === 'string') text = raw.messages;
  }
  return text;
}

function extractDays(fullText) {
  const days = [], seen = new Set();
  const blocks = fullText.includes('=== Message from') ? fullText.split(/===\s*Message from/).slice(1) : [fullText];
  for (const block of blocks) {
    if (!block || block.trim().length < 20) continue;
    let date = null;
    const pats = [/(\d{4})[年\/](\d{1,2})[月\/](\d{1,2})/, /(\d{1,2})\/(\d{1,2})\s*食事/, /食事レコ[^\d]*(\d{1,2})\/(\d{1,2})/, /(\d{1,2})\/(\d{1,2})/];
    for (const p of pats) {
      const m = block.match(p);
      if (m) {
        let y, mo, d;
        if (m.length >= 4 && parseInt(m[1]) > 100) { y=parseInt(m[1]); mo=parseInt(m[2]); d=parseInt(m[3]); }
        else { mo=parseInt(m[1]); d=parseInt(m[2]); y=2026; }
        if (mo>=1&&mo<=12&&d>=1&&d<=31) { date=`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`; break; }
      }
    }
    if (!date || seen.has(date)) continue;
    seen.add(date);
    let kcal = null;
    const rng = block.match(/約?([\d,]+)\s*[〜~\-～]\s*([\d,]+)\s*kcal/i);
    if (rng) { kcal = Math.round((parseInt(rng[1].replace(/,/g,''))+parseInt(rng[2].replace(/,/g,'')))/2); }
    if (!kcal) {
      for (const cp of [/総カロリー[^\d]*約?\s*([\d,]+)\s*kcal/i, /合計[^\d]*約?\s*([\d,]+)\s*kcal/i, /\*約?([\d,]+)\s*kcal/i, /([\d,]+)\s*kcal/i]) {
        const m = block.match(cp);
        if (m) { const v=parseInt(m[1].replace(/,/g,'')); if(v>200&&v<10000){kcal=v;break;} }
      }
    }
    if (!kcal) continue;
    const pm = block.match(/P\s*[：:]?\s*約?\s*([\d.]+)/i), fm = block.match(/F\s*[：:]?\s*約?\s*([\d.]+)/i), cm = block.match(/C\s*[：:]?\s*約?\s*([\d.]+)/i);
    let memo = '';
    const mm = block.match(/メモ[：:\s]*\n?\s*([^\n*]+)/) || block.match(/コメント[：:\s]*\n?\s*([^\n*]+)/);
    if (mm) memo = mm[1].replace(/\*使用して送信されました\*.*/,'').trim();
    const hasDrink = /ビール|ハイボール|日本酒|ワイン|サワー|酒|ウィスキー|焼酎/i.test(block);
    const hasTrain = /トレ|筋トレ|ジム|パーソナル|スクワット|ベンチ/i.test(block);
    days.push({ date, kcal, protein: pm?parseFloat(pm[1]):null, fat: fm?parseFloat(fm[1]):null, carb: cm?parseFloat(cm[1]):null, memo, hasDrink, hasTrain });
  }
  days.sort((a,b)=>a.date.localeCompare(b.date));
  return days;
}

function classify(d) { if(d.kcal>FREE+200) return 'over'; if(d.hasDrink||d.kcal>STRICT+200) return 'free'; return 'strict'; }

// === Calendar event parser for calorie annotations ===
function parseCalEvents(result) {
  const map = {};
  try {
    const parsed = result.structuredContent ?? (result.content ? JSON.parse(result.content[0].text) : result);
    const events = parsed.events || [];
    const KEYWORDS = [
      { re: /懇親/, label: '懇親会' },
      { re: /会食/, label: '会食' },
      { re: /飲み会|飲み/, label: '飲み会' },
      { re: /出張/, label: '出張' },
      { re: /【支援】|ご支援|コンサル|支援/, label: '支援' },
      { re: /海外/, label: '海外' },
      { re: /ランチ|ディナー/, label: '食事会' },
      { re: /訪問/, label: '訪問' },
    ];
    for (const ev of events) {
      if (!ev.summary || ev.status === 'cancelled') continue;
      let date;
      if (ev.start && ev.start.date) date = ev.start.date;
      else if (ev.start && ev.start.dateTime) date = ev.start.dateTime.slice(0, 10);
      if (!date) continue;
      const s = ev.summary;
      for (const kw of KEYWORDS) {
        if (kw.re.test(s)) {
          if (!map[date]) {
            map[date] = { short: kw.label, full: s };
          } else {
            // Append additional events for tooltip
            if (!map[date].full.includes(s)) map[date].full += '\n' + s;
          }
          break;
        }
      }
    }
  } catch (e) { console.warn('Cal parse error:', e); }
  return map;
}
function target(d) { return classify(d)==='strict' ? STRICT : FREE; }
function fmtDate(s) { const d=new Date(s+'T12:00:00'); return `${d.getMonth()+1}/${d.getDate()}（${'日月火水木金土'[d.getDay()]}）`; }
function fmtDateShort(s) { const d=new Date(s+'T12:00:00'); return `${d.getMonth()+1}/${d.getDate()}`; }

function proteinStatus(day) {
  if (!day.protein) return { tag: 'tag-info', text: '未記録' };
  const isStrict = classify(day) === 'strict';
  if (day.protein >= PROTEIN_TARGET) return { tag: 'tag-good', text: `P:${Math.round(day.protein)}g ◎` };
  if (day.protein >= PROTEIN_MIN) {
    if (isStrict) return { tag: 'tag-warn', text: `P:${Math.round(day.protein)}g（140g目標）` };
    return { tag: 'tag-good', text: `P:${Math.round(day.protein)}g OK` };
  }
  if (isStrict) return { tag: 'tag-bad', text: `P:${Math.round(day.protein)}g ⚠ 最低100g` };
  return { tag: 'tag-warn', text: `P:${Math.round(day.protein)}g` };
}

function trainDeficit(day) {
  if (!day.hasTrain) return null;
  const directBurn = TRAIN_BURN;
  const afterburn = Math.round(TDEE * (AFTERBURN_MULT - 1));
  const totalExtra = directBurn + afterburn;
  const effectiveCal = day.kcal - totalExtra;
  const deficit = TDEE - effectiveCal;
  return { directBurn, afterburn, totalExtra, effectiveCal, deficit };
}

// === 溢れた日の要因診断（リコンプ向け） ===
// 食事kcal = P*4+F*9+C*4。総kcalとの差(残差)を「アルコール＋未記録」とみなす。
// 超過は飲食上限(FREE=2200)比で算出し、-400赤字の何日分を相殺したかを出す。
const RECOMP_DEFICIT = 400;     // リコンプの1日あたり目標赤字（バンド中心）
const OVERFLOW_THRESHOLD = 2500; // この総カロリー以上を「溢れた日」とする（2,200は適正圏）
function overflowDiagnosis(d) {
  const p = d.protein || 0, f = d.fat || 0, c = d.carb || 0;
  const pK = Math.round(p * 4), fK = Math.round(f * 9), cK = Math.round(c * 4);
  const foodKcal = pK + fK + cK;
  const alcoholK = Math.max(0, d.kcal - foodKcal); // 残差 ≒ アルコール＋未記録
  const excess = Math.max(0, d.kcal - FREE);        // 飲食上限(2200)超過分
  const overCap = Math.max(0, d.kcal - FREE_HARD_CAP); // 絶対上限(2500)超過分
  const daysErased = +(excess / RECOMP_DEFICIT).toFixed(1);
  // 主因の判定（アルコール / 脂質 / 炭水化物）
  const drivers = [];
  if (alcoholK >= 250) drivers.push({ key: 'alcohol', label: '🍺 アルコール', detail: `約${alcoholK.toLocaleString()}kcal`, col: '#8e24aa' });
  if (f >= 80) drivers.push({ key: 'fat', label: '脂質', detail: `${Math.round(f)}g（高め）`, col: '#e65100' });
  if (c >= 250) drivers.push({ key: 'carb', label: '炭水化物', detail: `${Math.round(c)}g（多め）`, col: '#1565c0' });
  if (!drivers.length) drivers.push({ key: 'overall', label: '全体量', detail: 'バランス的に総量オーバー', col: '#c62828' });
  // リカバリー提案（既存の教訓を自動適用）
  const recoverPerDay = TDEE - 1300; // 1,300kcal日が生む赤字
  const tips = [];
  if (overCap > 0) tips.push(`上限${FREE_HARD_CAP.toLocaleString()}でキャップしていれば <strong>+${overCap.toLocaleString()}kcal</strong> 抑えられた`);
  if (alcoholK >= 300) tips.push(`アルコールを3杯ルールで半減 → 約${Math.round(alcoholK / 2).toLocaleString()}kcal カット`);
  tips.push(`翌日1,300kcalなら1日 −${recoverPerDay}kcal → <strong>${Math.max(1, Math.ceil(excess / recoverPerDay))}日</strong>で取り戻せる`);
  return { pK, fK, cK, foodKcal, alcoholK, excess, overCap, daysErased, drivers, tips };
}

// === Tab switching（再描画をまたいで選択タブを保持） ===
let currentTab = 'training';
try { const t = localStorage.getItem('calGuide_tab'); if (t) currentTab = t; } catch(e) {}
function applyTab() {
  document.querySelectorAll('.main-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + currentTab));
}
function switchTab(id) {
  currentTab = id;
  try { localStorage.setItem('calGuide_tab', id); } catch(e) {}
  applyTab();
}

// === Body Comp form handlers (attached after render) ===
function attachBCHandlers() {
  const toggleBtn = document.getElementById('bc-toggle-btn');
  const form = document.getElementById('bc-form');
  if (toggleBtn && form) {
    toggleBtn.onclick = () => {
      form.classList.toggle('open');
      toggleBtn.textContent = form.classList.contains('open') ? '閉じる' : '＋記録';
    };
  }
  const saveBtn = document.getElementById('bc-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const v = k => { const el=document.getElementById('bc-'+k); return el&&el.value?parseFloat(el.value):null; };
      const date = document.getElementById('bc-date')?.value;
      const session = document.getElementById('bc-session')?.value || '';
      const note = document.getElementById('bc-note')?.value || '';
      const glp1 = document.getElementById('bc-glp1')?.value || '';
      if (!date) { alert('日付を入力してください'); return; }
      const entry = { date, session, weight:v('weight'), muscle:v('muscle'), fatMass:v('fatmass'), fatPct:v('fatpct'), waist:v('waist'), inbody:v('inbody'), glp1, note };
      const data = loadBodyComp();
      // Replace if same date+session exists
      const idx = data.findIndex(d => d.date === date && d.session === session);
      if (idx >= 0) data[idx] = entry; else data.push(entry);
      data.sort((a,b) => a.date.localeCompare(b.date));
      saveBodyComp(data);
      location.reload();
    };
  }
  // Delete handlers
  document.querySelectorAll('.bc-del').forEach(btn => {
    btn.onclick = () => {
      if (!confirm('この記録を削除しますか？')) return;
      const i = parseInt(btn.dataset.idx);
      const data = loadBodyComp();
      data.splice(i, 1);
      saveBodyComp(data);
      location.reload();
    };
  });
}

// === Training Log Handlers ===
let tlExCount = 0;
function addExerciseEntry(container) {
  tlExCount++;
  const div = document.createElement('div');
  div.className = 'tl-ex-entry';
  div.id = 'tl-ex-' + tlExCount;
  let optHtml = '<option value="">種目を選択</option>';
  for (const [cat, exs] of Object.entries(EXERCISE_CATEGORIES)) {
    optHtml += `<optgroup label="${cat}">`;
    for (const ex of exs) optHtml += `<option value="${ex}">${ex}</option>`;
    optHtml += '</optgroup>';
  }
  div.innerHTML = `<button class="tl-ex-remove" data-eid="${tlExCount}">✕</button>
    <div class="tl-form-grid row4">
      <div class="tl-field"><label>種目</label><select class="tl-ex-name">${optHtml}</select></div>
      <div class="tl-field"><label>重量(kg)</label><input type="number" class="tl-ex-weight" step="0.5" placeholder="46"></div>
      <div class="tl-field"><label>回数</label><input type="number" class="tl-ex-reps" step="1" placeholder="10"></div>
      <div class="tl-field"><label>セット数</label><input type="number" class="tl-ex-sets" step="1" placeholder="2"></div>
    </div>`;
  container.appendChild(div);
  div.querySelector('.tl-ex-remove').onclick = () => div.remove();
}

function attachTLHandlers(tlData) {
  const toggleBtn = document.getElementById('tl-toggle-btn');
  const form = document.getElementById('tl-form');
  if (toggleBtn && form) {
    toggleBtn.onclick = () => {
      form.classList.toggle('open');
      toggleBtn.textContent = form.classList.contains('open') ? '閉じる' : '＋記録';
      // Add initial exercise entry if empty
      const container = document.getElementById('tl-exercises-container');
      if (form.classList.contains('open') && container && container.children.length === 0) {
        addExerciseEntry(container);
      }
    };
  }
  const addBtn = document.getElementById('tl-add-ex');
  if (addBtn) {
    addBtn.onclick = () => {
      const container = document.getElementById('tl-exercises-container');
      if (container) addExerciseEntry(container);
    };
  }
  const saveBtn = document.getElementById('tl-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const date = document.getElementById('tl-date')?.value;
      const session = document.getElementById('tl-session')?.value || '';
      const comment = document.getElementById('tl-comment')?.value || '';
      const waistVal = document.getElementById('tl-waist')?.value;
      const waist = waistVal ? parseFloat(waistVal) : null;
      if (!date) { alert('日付を入力してください'); return; }
      if (!session) { alert('セッション名を入力してください'); return; }
      const entries = document.querySelectorAll('.tl-ex-entry');
      const exercises = [];
      for (const entry of entries) {
        const name = entry.querySelector('.tl-ex-name')?.value;
        if (!name) continue;
        const weight = entry.querySelector('.tl-ex-weight')?.value ? parseFloat(entry.querySelector('.tl-ex-weight').value) : null;
        const reps = entry.querySelector('.tl-ex-reps')?.value ? parseInt(entry.querySelector('.tl-ex-reps').value) : null;
        const sets = entry.querySelector('.tl-ex-sets')?.value ? parseInt(entry.querySelector('.tl-ex-sets').value) : null;
        exercises.push({ name, weight, reps, sets });
      }
      if (exercises.length === 0) { alert('少なくとも1つの種目を入力してください'); return; }
      const newEntry = { date, session, exercises, comment };
      if (waist != null) {
        newEntry.waist = waist;
        // Also save to waist tracking
        const wsData = loadWaist();
        const wsIdx = wsData.findIndex(d => d.date === date);
        if (wsIdx >= 0) wsData[wsIdx].waist = waist; else wsData.push({ date, waist });
        wsData.sort((a,b) => a.date.localeCompare(b.date));
        saveWaist(wsData);
      }
      const data2 = loadTraining();
      const idx = data2.findIndex(d => d.date === date && d.session === session);
      if (idx >= 0) data2[idx] = newEntry; else data2.push(newEntry);
      data2.sort((a,b) => a.date.localeCompare(b.date));
      saveTraining(data2);
      location.reload();
    };
  }
  // Delete session handlers
  document.querySelectorAll('.tl-session-del').forEach(btn => {
    btn.onclick = () => {
      if (!confirm('このセッション記録を削除しますか？')) return;
      const i = parseInt(btn.dataset.idx);
      const data2 = loadTraining();
      data2.splice(i, 1);
      saveTraining(data2);
      location.reload();
    };
  });
  // Draw training progress chart
  drawTLChart(tlData, 'ベンチプレス（スミス）');
  // Filter buttons
  const filterBtns = document.querySelectorAll('#tl-chart-filter button');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawTLChart(tlData, btn.dataset.ex);
    };
  });
  // Waist chart
  const wsData = loadWaist();
  let wsPeriod = 180;
  drawWaistChart(wsData, wsPeriod);
  const wsPBtns = document.querySelectorAll('#ws-period-filter button');
  wsPBtns.forEach(btn => {
    btn.onclick = () => {
      wsPBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      wsPeriod = parseInt(btn.dataset.period);
      drawWaistChart(wsData, wsPeriod);
    };
  });
}

let tlChartInstance = null;
function drawTLChart(tlData, exName) {
  const ctx = document.getElementById('tlProgressChart');
  if (!ctx) return;
  if (tlChartInstance) tlChartInstance.destroy();
  // Collect data points for this exercise
  const points = [];
  for (const s of tlData) {
    for (const e of s.exercises) {
      if (e.name === exName && e.weight) {
        points.push({ date: s.date, session: s.session, weight: e.weight, reps: e.reps, sets: e.sets });
      }
    }
  }
  if (points.length < 2) {
    tlChartInstance = new Chart(ctx.getContext('2d'), {
      type: 'bar', data: { labels: ['データ不足'], datasets: [{ data: [0], backgroundColor: '#e0e0e0' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: false } } }
    });
    return;
  }
  const labels = points.map(p => {
    const dt = new Date(p.date + 'T12:00:00');
    const dateStr = `${dt.getMonth()+1}/${dt.getDate()}`;
    return p.session ? [p.session, dateStr] : [dateStr];
  });
  const weights = points.map(p => p.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  tlChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: exName + ' (kg)',
        data: weights,
        borderColor: '#1b5e20',
        backgroundColor: 'rgba(27,94,32,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: weights.map(w => w === maxW ? '#ff6f00' : '#1b5e20'),
        pointBorderColor: weights.map(w => w === maxW ? '#ff6f00' : '#1b5e20'),
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: c => {
              const p = points[c.dataIndex];
              let t = `${p.weight}kg`;
              if (p.reps) t += ` × ${p.reps}回`;
              if (p.sets) t += ` × ${p.sets}set`;
              return t;
            }
          }
        }
      },
      scales: {
        y: { min: Math.max(0, minW - 5), max: maxW + 5, ticks: { font: { size: 9 }, callback: v => v + 'kg' } },
        x: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

// === Waist chart ===
let waistChartInstance = null;
function drawWaistChart(allData, periodDays) {
  const ctx = document.getElementById('waistChart');
  if (!ctx || allData.length < 2) return;
  if (waistChartInstance) waistChartInstance.destroy();
  let data = allData;
  if (periodDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    data = allData.filter(d => d.date >= cutoffStr);
  }
  if (data.length < 2) data = allData.slice(-2);
  const labels = data.map(d => { const dt = new Date(d.date + 'T12:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}`; });
  const raw = data.map(d => d.waist);
  // 4-point moving average (weekly data → ~1 month trend)
  const ma4 = data.map((d, i) => {
    const win = 4;
    const start = Math.max(0, i - win + 1);
    const slice = data.slice(start, i + 1).map(x => x.waist).filter(v => v != null);
    return slice.length > 0 ? +(slice.reduce((a,b) => a+b, 0) / slice.length).toFixed(2) : null;
  });
  const minV = Math.min(...raw);
  const maxV = Math.max(...raw);
  const pad = (maxV - minV) * 0.3 || 0.5;
  // Month boundaries
  const monthLines = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].date.slice(0,7) !== data[i-1].date.slice(0,7)) monthLines.push(i);
  }
  const wsMonthPlugin = { id:'wsMonthLines', afterDraw(chart) {
    const xScale = chart.scales.x, yScale = chart.scales.y;
    const ctx2 = chart.ctx;
    ctx2.save();
    ctx2.strokeStyle = '#ccc'; ctx2.lineWidth = 1; ctx2.setLineDash([4,3]);
    monthLines.forEach(idx => {
      const x = xScale.getPixelForValue(idx);
      ctx2.beginPath(); ctx2.moveTo(x, yScale.top); ctx2.lineTo(x, yScale.bottom); ctx2.stroke();
    });
    ctx2.restore();
  }};
  // Min line + 85cm target line annotation
  const METABO_LINE = 85.0;
  const wsAnnotations = { id:'wsAnnotations', afterDraw(chart) {
    const yScale = chart.scales.y, xScale = chart.scales.x;
    const ctx2 = chart.ctx;
    ctx2.save();
    // Min value line (green)
    const yMin = yScale.getPixelForValue(minV);
    ctx2.strokeStyle = '#2d6a4f'; ctx2.lineWidth = 1; ctx2.setLineDash([6,3]);
    ctx2.beginPath(); ctx2.moveTo(xScale.left, yMin); ctx2.lineTo(xScale.right, yMin); ctx2.stroke();
    ctx2.fillStyle = '#2d6a4f'; ctx2.font = '9px sans-serif'; ctx2.textAlign = 'right';
    ctx2.fillText(`MIN ${minV}cm`, xScale.right, yMin - 4);
    // Metabo target line (red dashed)
    const yTarget = yScale.getPixelForValue(METABO_LINE);
    ctx2.strokeStyle = '#c62828'; ctx2.lineWidth = 2; ctx2.setLineDash([8,4]);
    ctx2.beginPath(); ctx2.moveTo(xScale.left, yTarget); ctx2.lineTo(xScale.right, yTarget); ctx2.stroke();
    ctx2.fillStyle = '#c62828'; ctx2.font = 'bold 10px sans-serif'; ctx2.textAlign = 'left';
    ctx2.fillText('メタボ基準 85cm', xScale.left + 4, yTarget - 6);
    ctx2.restore();
  }};
  waistChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'line',
    plugins: [wsMonthPlugin, wsAnnotations],
    data: {
      labels,
      datasets: [
        { label: '腹囲(cm)', data: raw, borderColor: '#e6550050', backgroundColor: '#e6550010', fill: false, tension: 0, pointRadius: 3, pointBackgroundColor: raw.map(v => v === minV ? '#2d6a4f' : '#e6550090'), pointBorderColor: raw.map(v => v === minV ? '#2d6a4f' : '#e6550090'), borderWidth: 1 },
        { label: '4回平均', data: ma4, borderColor: '#e65500', backgroundColor: '#e6550018', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 3 }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true, padding: 12 } },
        tooltip: { callbacks: { label: c => c.dataset.label + ': ' + (c.parsed.y != null ? c.parsed.y.toFixed(1) + 'cm' : '—') } }
      },
      scales: {
        y: { min: Math.min(Math.floor((minV - pad) * 2) / 2, 84), max: Math.ceil((maxV + pad) * 2) / 2, ticks: { font: { size: 9 }, callback: v => v + 'cm' }, title: { display: true, text: 'cm', font: { size: 9 } } },
        x: { ticks: { font: { size: 8 }, maxRotation: 45 } }
      }
    }
  });
}

// === Daily measurement handlers ===
let dmChartInstance = null;
let dmComboChartInstance = null;

// カロリー計測を始めた日（5/14）のマーカー。
// 表示中のデータ範囲に5/14が含まれるときだけインデックスを返す（含まれなければ -1）。
const CAL_START_DATE = '2026-05-14';
function calStartMarkerIndex(data) {
  if (!data.length || data[0].date > CAL_START_DATE) return -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].date >= CAL_START_DATE) return i;
  }
  return -1;
}
function calStartLinePlugin(markerIdx, yScaleId) {
  return { id: 'calStartLine', afterDraw(chart) {
    if (markerIdx < 0) return;
    const xScale = chart.scales.x, yScale = chart.scales[yScaleId];
    if (!xScale || !yScale) return;
    const c = chart.ctx;
    const x = xScale.getPixelForValue(markerIdx);
    c.save();
    c.strokeStyle = '#6c5ce7'; c.lineWidth = 2; c.setLineDash([5,3]);
    c.beginPath(); c.moveTo(x, yScale.top); c.lineTo(x, yScale.bottom); c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#6c5ce7'; c.font = 'bold 9px sans-serif'; c.textBaseline = 'top';
    const mid = (xScale.left + xScale.right) / 2;
    if (x > mid) { c.textAlign = 'right'; c.fillText('5/14 管理開始', x - 4, yScale.top + 2); }
    else { c.textAlign = 'left'; c.fillText('5/14 管理開始', x + 4, yScale.top + 2); }
    c.restore();
  }};
}
function attachDMHandlers(dmData) {
  const toggleBtn = document.getElementById('dm-toggle-btn');
  const form = document.getElementById('dm-form');
  if (toggleBtn && form) {
    toggleBtn.onclick = () => { form.classList.toggle('open'); toggleBtn.textContent = form.classList.contains('open') ? '✕ 閉じる' : '＋記録'; };
  }
  // Save handler
  const saveBtn = document.getElementById('dm-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const date = document.getElementById('dm-date').value;
      const weight = parseFloat(document.getElementById('dm-weight').value);
      if (!date || isNaN(weight)) { alert('日付と体重は必須です'); return; }
      const fatPct = parseFloat(document.getElementById('dm-fatpct').value) || null;
      const muscle = parseFloat(document.getElementById('dm-muscle').value) || null;
      const data2 = loadDaily();
      const existIdx = data2.findIndex(d => d.date === date);
      if (existIdx >= 0) { data2[existIdx] = { date, weight, fatPct, muscle }; }
      else { data2.push({ date, weight, fatPct, muscle }); }
      data2.sort((a,b) => a.date.localeCompare(b.date));
      saveDaily(data2);
      location.reload();
    };
  }
  // Delete handlers
  document.querySelectorAll('.dm-del').forEach(btn => {
    btn.onclick = () => {
      if (!confirm('この記録を削除しますか？')) return;
      const i = parseInt(btn.dataset.idx);
      const data2 = loadDaily();
      data2.splice(i, 1);
      saveDaily(data2);
      location.reload();
    };
  });
  // Draw initial chart (default 3M)
  let dmCurrentMetric = 'weight';
  let dmCurrentPeriod = 90;
  drawDMChart(dmData, dmCurrentMetric, dmCurrentPeriod);
  // Metric filter buttons
  const filterBtns = document.querySelectorAll('#dm-chart-filter button');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dmCurrentMetric = btn.dataset.metric;
      drawDMChart(dmData, dmCurrentMetric, dmCurrentPeriod);
    };
  });
  // Period filter buttons
  const periodBtns = document.querySelectorAll('#dm-period-filter button');
  periodBtns.forEach(btn => {
    btn.onclick = () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dmCurrentPeriod = parseInt(btn.dataset.period);
      drawDMChart(dmData, dmCurrentMetric, dmCurrentPeriod);
    };
  });
  // Combo chart init + period filter
  let dmComboPeriod = 90;
  drawDMComboChart(dmData, dmComboPeriod);
  const comboPBtns = document.querySelectorAll('#dm-combo-period button');
  comboPBtns.forEach(btn => {
    btn.onclick = () => {
      comboPBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dmComboPeriod = parseInt(btn.dataset.period);
      drawDMComboChart(dmData, dmComboPeriod);
    };
  });
}

function drawDMComboChart(allDmData, periodDays) {
  const ctx = document.getElementById('dmComboChart');
  if (!ctx || allDmData.length < 2) return;
  if (dmComboChartInstance) dmComboChartInstance.destroy();
  let dmData = allDmData;
  if (periodDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    dmData = allDmData.filter(d => d.date >= cutoffStr);
  }
  if (dmData.length < 2) dmData = allDmData.slice(-2);
  const labels = dmData.map(d => { const dt = new Date(d.date + 'T12:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}`; });
  const muscleMA = dmData.map((d, i) => calcMA(dmData, 'muscle', i, 7));
  const fatMassMA = dmData.map((d, i) => calcMA(dmData, 'fatMass', i, 7));
  // Y-axis ranges
  const mVals = muscleMA.filter(v => v != null);
  const fVals = fatMassMA.filter(v => v != null);
  const mMin = Math.min(...mVals), mMax = Math.max(...mVals);
  const fMin = Math.min(...fVals), fMax = Math.max(...fVals);
  const mPad = (mMax - mMin) * 0.35 || 0.5;
  const fPad = (fMax - fMin) * 0.35 || 0.5;
  // Month boundaries
  const comboMonthLines = [];
  for (let i = 1; i < dmData.length; i++) {
    if (dmData[i].date.slice(0,7) !== dmData[i-1].date.slice(0,7)) comboMonthLines.push(i);
  }
  const comboMonthPlugin = { id:'comboMonthLines', afterDraw(chart) {
    const xScale = chart.scales.x, yScale = chart.scales.yMuscle;
    const ctx2 = chart.ctx;
    ctx2.save();
    ctx2.strokeStyle = '#ccc'; ctx2.lineWidth = 1; ctx2.setLineDash([4,3]);
    comboMonthLines.forEach(idx => {
      const x = xScale.getPixelForValue(idx);
      ctx2.beginPath(); ctx2.moveTo(x, yScale.top); ctx2.lineTo(x, yScale.bottom); ctx2.stroke();
    });
    ctx2.restore();
  }};
  const comboCalStartPlugin = calStartLinePlugin(calStartMarkerIndex(dmData), 'yMuscle');
  dmComboChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'line',
    plugins: [comboMonthPlugin, comboCalStartPlugin],
    data: {
      labels,
      datasets: [
        {
          label: '筋肉量 7日平均(kg)',
          data: muscleMA,
          borderColor: '#2d6a4f',
          backgroundColor: '#2d6a4f18',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
          yAxisID: 'yMuscle',
        },
        {
          label: '体脂肪量 7日平均(kg)',
          data: fatMassMA,
          borderColor: '#c62828',
          backgroundColor: '#c6282818',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
          yAxisID: 'yFat',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true, padding: 12 } },
        tooltip: { callbacks: { label: c => c.dataset.label + ': ' + (c.parsed.y != null ? c.parsed.y.toFixed(2) + 'kg' : '—') } },
      },
      scales: {
        yMuscle: {
          type: 'linear', position: 'left',
          min: Math.floor((mMin - mPad) * 10) / 10,
          max: Math.ceil((mMax + mPad) * 10) / 10,
          title: { display: true, text: '筋肉量 kg', font: { size: 9 }, color: '#2d6a4f' },
          ticks: { font: { size: 9 }, color: '#2d6a4f' },
          grid: { color: '#2d6a4f10' },
        },
        yFat: {
          type: 'linear', position: 'right',
          min: Math.floor((fMin - fPad) * 10) / 10,
          max: Math.ceil((fMax + fPad) * 10) / 10,
          title: { display: true, text: '体脂肪量 kg', font: { size: 9, weight: 'bold' }, color: '#c62828' },
          ticks: { font: { size: 9 }, color: '#c62828' },
          grid: { drawOnChartArea: false },
        },
        x: { ticks: { font: { size: 8 }, maxRotation: 45 } }
      }
    }
  });
}

function drawDMChart(allDmData, metric, periodDays) {
  const ctx = document.getElementById('dmChart');
  if (!ctx || allDmData.length < 2) return;
  if (dmChartInstance) dmChartInstance.destroy();
  // Filter by period
  let dmData = allDmData;
  if (periodDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    dmData = allDmData.filter(d => d.date >= cutoffStr);
  }
  if (dmData.length < 2) dmData = allDmData.slice(-2);
  const labels = dmData.map(d => { const dt = new Date(d.date + 'T12:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}`; });
  const raw = metric === 'lbm' ? dmData.map(d => calcLBM(d)) : metric === 'fatMass' ? dmData.map(d => calcFatMass(d)) : dmData.map(d => d[metric]);
  const ma7 = dmData.map((d, i) => calcMA(dmData, metric, i, 7));
  const cfgMap = {
    weight:  { label: '体重(kg)', maLabel: '7日移動平均', color: '#1565c0', unit: 'kg', yLabel: '体重 kg' },
    fatPct:  { label: '体脂肪率(%)', maLabel: '7日移動平均', color: '#e65100', unit: '%', yLabel: '体脂肪率 %' },
    fatMass: { label: '体脂肪量(kg)', maLabel: '7日移動平均', color: '#c62828', unit: 'kg', yLabel: '体脂肪量 kg' },
    lbm:     { label: '除脂肪体重(kg)', maLabel: '7日移動平均', color: '#1b5e20', unit: 'kg', yLabel: '除脂肪体重 kg' },
    muscle:  { label: '筋肉量(kg)', maLabel: '7日移動平均', color: '#2d6a4f', unit: 'kg', yLabel: '筋肉量 kg' },
  };
  const cfg = cfgMap[metric];
  const validVals = raw.filter(v => v != null);
  const minV = Math.min(...validVals);
  const maxV = Math.max(...validVals);
  const pad = (maxV - minV) * 0.3 || 1;
  // Month boundaries
  const monthLines = [];
  for (let i = 1; i < dmData.length; i++) {
    if (dmData[i].date.slice(0,7) !== dmData[i-1].date.slice(0,7)) monthLines.push(i);
  }
  const monthPlugin = { id:'monthLines', afterDraw(chart) {
    const xScale = chart.scales.x, yScale = chart.scales.y;
    const ctx2 = chart.ctx;
    ctx2.save();
    ctx2.strokeStyle = '#ccc'; ctx2.lineWidth = 1; ctx2.setLineDash([4,3]);
    monthLines.forEach(idx => {
      const x = xScale.getPixelForValue(idx);
      ctx2.beginPath(); ctx2.moveTo(x, yScale.top); ctx2.lineTo(x, yScale.bottom); ctx2.stroke();
    });
    ctx2.restore();
  }};
  const calStartIdx = calStartMarkerIndex(dmData);
  const calStartPlugin = calStartLinePlugin(calStartIdx, 'y');
  dmChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: cfg.label,
          data: raw,
          borderColor: cfg.color + '50',
          backgroundColor: cfg.color + '10',
          fill: false,
          tension: 0,
          pointRadius: 2,
          pointBackgroundColor: cfg.color + '70',
          borderWidth: 1,
          borderDash: [],
        },
        {
          label: cfg.maLabel,
          data: ma7,
          borderColor: cfg.color,
          backgroundColor: cfg.color + '18',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
          borderDash: [],
        }
      ]
    },
    plugins: [monthPlugin, calStartPlugin],
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true, padding: 10 } },
        tooltip: { callbacks: { label: c => c.dataset.label + ': ' + (c.parsed.y != null ? c.parsed.y.toFixed(1) + cfg.unit : '—') } },
      },
      scales: {
        y: { min: Math.floor((minV - pad) * 10) / 10, max: Math.ceil((maxV + pad) * 10) / 10, title: { display: true, text: cfg.yLabel, font: { size: 9 } }, ticks: { font: { size: 9 } } },
        x: { ticks: { font: { size: 8 }, maxRotation: 45 } }
      }
    }
  });
}

// === Meal empty-state notice (data now flows in via Slack auto-sync) ===
function mealEmptyNotice(tabLabel) {
  return `<div class="card" style="text-align:center;padding:32px 18px;color:#888;">
    <div style="font-size:2.2em;">🍽️</div>
    <div style="font-size:0.95em;font-weight:700;color:#555;margin:8px 0;">食事データがまだありません</div>
    <div style="font-size:0.82em;line-height:1.7;">${tabLabel}には食事記録（カロリー）が必要です。<br>Slack #河野食事管理 に投稿すると自動で取り込まれます（最大12時間で反映）。</div>
  </div>`;
}
// TDEE推定カード（GAP分析・目標設計の両タブで共有。複数配置できるようID不使用＝クラス指定）。
function tdeeCardHTML(tdeeInfo, effTDEE) {
  const m = tdeeInfo.measured, p = tdeeInfo.predicted, prof = tdeeInfo.profile;
  const modeLabel = { measured:'実測', formula:'予測式', manual:'手動', 'formula-fallback':'予測式(実測不足)' }[tdeeInfo.source] || tdeeInfo.source;
  const gap = (m.confident && p.tdee) ? (p.tdee - m.tdee) : null;
  const usingMeasured = tdeeInfo.source === 'measured';
  const usingFormula = tdeeInfo.source === 'formula' || tdeeInfo.source === 'formula-fallback';
  const usingManual = tdeeInfo.source === 'manual';
  return `<div class="card">
      <h2>🔥 TDEE推定 ＆ シミュレーション基準</h2>
      <div class="tdee-grid">
        <div class="tdee-box${usingFormula?' active navy':''}">
          ${usingFormula?'<span class="tdee-badge navy">使用中</span>':''}
          <div class="tdee-k">予測式 <span>Harris-Benedict</span></div>
          <div class="tdee-v" style="color:#1a237e;">${p.tdee.toLocaleString()}<span>kcal/日</span></div>
          <div class="tdee-s">BMR ${p.bmr.toLocaleString()} × 活動 ${prof.activity}</div>
        </div>
        <div class="tdee-box${usingMeasured?' active green':''}">
          ${usingMeasured?'<span class="tdee-badge green">使用中</span>':''}
          <div class="tdee-k">実測 <span>収支逆算</span></div>
          <div class="tdee-v" style="color:#2d6a4f;">${m.confident?m.tdee.toLocaleString():'—'}<span>kcal/日</span></div>
          <div class="tdee-s">${m.confident?`摂取 ${m.meanIntake.toLocaleString()}／体重 ${m.slopeKgPerMonth>0?'+':''}${m.slopeKgPerMonth}kg/月／${m.spanDays}日`:'データ不足（食事14日・体重21日以上で算出）'}</div>
        </div>
      </div>
      ${gap!=null?`<div class="tdee-note${Math.abs(gap)>=120?' warn':''}">予測式と実測の差 <b>${gap>0?'+':''}${gap} kcal/日</b>${Math.abs(gap)>=120?'。食事ログの過少申告か測定誤差の可能性。「いつ15%に届くか」は実測ベースの方が当たります。':'。両者はよく一致しています。'}</div>`:''}
      <div class="tdee-use">シミュレーションに使用中　<b>${effTDEE.toLocaleString()} kcal/日</b><span>（${modeLabel}）</span></div>
      <div class="dm-period-filter tdee-modes" data-tdee-mode>
        <button data-mode="measured" class="${prof.tdeeMode==='measured'?'active':''}">実測</button>
        <button data-mode="formula" class="${prof.tdeeMode==='formula'?'active':''}">予測式</button>
        <button data-mode="manual" class="${prof.tdeeMode==='manual'?'active':''}">手動</button>
      </div>
      <div class="tdee-form">
        <label>年齢 <input type="number" class="tdee-age" value="${prof.age}"></label>
        <label>身長 <input type="number" class="tdee-height" value="${prof.heightCm}"><span class="u">cm</span></label>
        <label>活動 <select class="tdee-activity">${ACTIVITY_LEVELS.map(a=>`<option value="${a.v}" ${a.v===prof.activity?'selected':''}>${a.label}</option>`).join('')}</select></label>
        <label class="tdee-manual-wrap" style="${usingManual?'':'display:none;'}">手動値 <input type="number" class="tdee-manual" value="${prof.manualTDEE}"><span class="u">kcal</span></label>
      </div>
    </div>`;
}
function attachTDEEHandlers() {
  const modeBtns = document.querySelectorAll('[data-tdee-mode] button');
  if (!modeBtns.length) return;
  const save = (patch) => { const p = loadProfile(); saveProfile({ ...p, ...patch }); rerender(); };
  modeBtns.forEach(b => b.onclick = () => save({ tdeeMode: b.dataset.mode }));
  document.querySelectorAll('.tdee-age').forEach(el => el.onchange = () => save({ age: parseInt(el.value) || PROFILE_DEFAULT.age }));
  document.querySelectorAll('.tdee-height').forEach(el => el.onchange = () => save({ heightCm: parseFloat(el.value) || PROFILE_DEFAULT.heightCm }));
  document.querySelectorAll('.tdee-activity').forEach(el => el.onchange = () => save({ activity: parseFloat(el.value) }));
  document.querySelectorAll('.tdee-manual').forEach(el => el.onchange = () => save({ manualTDEE: parseInt(el.value) || PROFILE_DEFAULT.manualTDEE }));
}
function attachMealHandlers() {
  const importBtn = document.getElementById('meal-import-btn');
  if (importBtn) importBtn.onclick = () => {
    const ta = document.getElementById('meal-import-text');
    const txt = ta ? ta.value.trim() : '';
    if (!txt) { alert('Slackの食事記録テキストを貼り付けてください'); return; }
    const days = parseMealText(txt);
    if (!days.length) { alert('食事データを抽出できませんでした。日付とカロリーが含まれているかご確認ください。'); return; }
    mergeMeals(days);
    rerender();
  };
  const fileInput = document.getElementById('meal-import-file');
  if (fileInput) fileInput.onchange = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result);
      let days = [];
      try {
        const parsed = JSON.parse(raw);
        days = Array.isArray(parsed) ? parsed : parseMealText(raw);
      } catch(err) { days = parseMealText(raw); }
      if (!days.length) { alert('取り込めるデータがありませんでした'); return; }
      mergeMeals(days);
      rerender();
    };
    reader.readAsText(file);
  };
  const clearBtn = document.getElementById('meal-clear-btn');
  if (clearBtn) clearBtn.onclick = () => {
    if (confirm('保存済みの食事データをすべて削除しますか？')) { saveMeals([]); rerender(); }
  };
}

// === Render ===
function render(data, calMap) {
  calMap = calMap || {};
  const app = document.getElementById('app');
  const last7 = data.slice(-7);
  const all = data;
  const pAll = all.filter(d => d.protein != null);

  // === 実効TDEE & 実測体組成（シミュレーションの基準）===
  const tdeeInfo = effectiveTDEE();
  const effTDEE = tdeeInfo.tdee;
  const bc2 = tdeeInfo.bc;
  const liveFat = bc2.fatMass;   // 最新実測の体脂肪量（旧 CUR_FAT の置換）
  const liveLBM = bc2.lbm;       // 最新実測の除脂肪体重（旧 LEAN の置換）
  const liveTgtFat = +(liveLBM * TGT_BF / (100 - TGT_BF)).toFixed(1);
  const liveFatToLose = +(liveFat - liveTgtFat).toFixed(1);
  const effDeficitPlan = effTDEE - DAILY_PLAN_AVG;
  const effPlanMonthly = +(effDeficitPlan * 30 / 7200).toFixed(1);
  const effPlanMonths = effPlanMonthly > 0 ? Math.round(liveFatToLose / effPlanMonthly) : 999;

  // === 日次カロリー収支ロジック（常時ON）===
  // その日のTDEE = 通常日TDEE ＋ トレ日のアフターバーン。平均は選択中TDEE(effTDEE)に一致するよう配分（二重計上回避）。
  // ネット赤字 = その日のTDEE − 摂取 − お酒ブレーキ(推定アルコールkcal×0.5)。
  const trainBonus = TRAIN_BURN + Math.round(effTDEE * (AFTERBURN_MULT - 1)); // トレ日の追加消費（直接＋アフターバーン）
  const trainFrac = all.length ? all.filter(d => d.hasTrain).length / all.length : 0;
  const restTDEE = Math.round(effTDEE - trainBonus * trainFrac); // 通常日TDEE（平均をeffTDEEに保つ）
  const dayTDEE = (d) => restTDEE + (d.hasTrain ? trainBonus : 0);
  const alcBrake = (d) => (d.hasDrink ? Math.round(ALC_FACTOR * estAlcoholK(d)) : 0);
  const dayDef = (d) => dayTDEE(d) - d.kcal - alcBrake(d); // その日の脂肪燃焼換算ネット赤字

  // Stats
  const avgCal = Math.round(last7.reduce((s,d)=>s+d.kcal,0)/last7.length);
  const pD = last7.filter(d=>d.protein);
  const avgP = pD.length ? Math.round(pD.reduce((s,d)=>s+d.protein,0)/pD.length) : null;
  const avgF = pD.filter(d=>d.fat).length ? Math.round(pD.filter(d=>d.fat).reduce((s,d)=>s+(d.fat||0),0)/pD.filter(d=>d.fat).length) : null;
  const avgC = pD.filter(d=>d.carb).length ? Math.round(pD.filter(d=>d.carb).reduce((s,d)=>s+(d.carb||0),0)/pD.filter(d=>d.carb).length) : null;
  const wkTotal = last7.reduce((s,d)=>s+d.kcal,0);
  const wkDeficit = last7.reduce((s,d)=>s+dayDef(d),0);
  const dailyDef = wkDeficit / last7.length;
  const actMonthly = +(Math.abs(dailyDef)*30/7200).toFixed(1);
  const actMonths = actMonthly > 0 ? Math.round(liveFatToLose / actMonthly) : 999;
  const strictN = last7.filter(d=>classify(d)==='strict').length;
  const freeN = last7.filter(d=>classify(d)!=='strict').length;

  const pDaysWithData = last7.filter(d => d.protein != null);
  const pAbove140 = pDaysWithData.filter(d => d.protein >= PROTEIN_TARGET).length;
  const pAbove100 = pDaysWithData.filter(d => d.protein >= PROTEIN_MIN).length;
  const pBelow100Strict = last7.filter(d => classify(d)==='strict' && d.protein != null && d.protein < PROTEIN_MIN).length;

  const trainDays = last7.filter(d => d.hasTrain);
  const trainDeficits2 = trainDays.map(d => trainDeficit(d)).filter(Boolean);

  // Blowout analysis (爆発日インパクト)
  const blowoutDays = all.filter(d => d.kcal > FREE);
  const blowoutExcess = blowoutDays.reduce((s, d) => s + (d.kcal - FREE), 0);
  const blowoutAvgImpact = all.length ? Math.round(blowoutExcess / all.length) : 0;
  const blowoutCapped = blowoutDays.reduce((s, d) => s + Math.max(0, d.kcal - FREE_HARD_CAP), 0);
  const ifCappedAvg = all.length ? Math.round((all.reduce((s,d)=>s+d.kcal,0) - blowoutCapped) / all.length) : avgCal;
  const ifCappedDeficit = effTDEE - ifCappedAvg;
  const ifCappedMonthly = +(Math.abs(ifCappedDeficit)*30/7200).toFixed(1);

  // Cumulative deficit tracker (累計カロリー赤字)
  const cumDeficits = [];
  let cumTotal = 0;
  for (const d of all) {
    const dayDeficit = dayDef(d); // 日次ネット赤字（トレ+／酒−を反映）
    cumTotal += dayDeficit;
    cumDeficits.push({ date: d.date, daily: dayDeficit, cumulative: cumTotal });
  }
  const totalDays = all.length;
  const totalDeficit = cumTotal; // positive = net deficit
  const avgDailyDeficit = totalDays ? Math.round(totalDeficit / totalDays) : 0;
  const fatLostFromDeficit = +(totalDeficit / 7200).toFixed(2); // 1kg fat = 7200kcal
  const surplusDays = all.filter(d => dayDef(d) < 0).length;
  const deficitDays = all.filter(d => dayDef(d) >= 0).length;

  // === Imputed monthly data (fill unrecorded days with average) ===
  const nowDate = new Date();
  const currentYM = `${nowDate.getFullYear()}-${String(nowDate.getMonth()+1).padStart(2,'0')}`;
  const currentDOM = nowDate.getDate();
  const imputedByMonth = {};
  for (const d of all) {
    const ym = d.date.substring(0, 7);
    if (!imputedByMonth[ym]) imputedByMonth[ym] = { days: [], sumKcal: 0 };
    imputedByMonth[ym].days.push(d);
    imputedByMonth[ym].sumKcal += d.kcal;
  }
  for (const [ym, md] of Object.entries(imputedByMonth)) {
    const [y2, m2] = ym.split('-').map(Number);
    const dim = new Date(y2, m2, 0).getDate();
    const rec = md.days.length;
    const avg = Math.round(md.sumKcal / rec);
    const isPast = ym < currentYM;
    const isCurr = ym === currentYM;
    const calDays = isPast ? dim : (isCurr ? currentDOM : rec);
    const miss = Math.max(0, calDays - rec);
    // 記録日の日次ネット赤字を実合計し、未記録日は記録日平均で補完
    const sumDef = md.days.reduce((s, d) => s + dayDef(d), 0);
    const avgDef = sumDef / rec;
    const impDef = Math.round(sumDef + miss * avgDef);
    const fullDef = Math.round(isCurr ? avgDef * dim : impDef);
    Object.assign(md, { ym, dim, rec, avg, isPast, isCurr, calDays, miss, impDef, impFatKg: +(impDef/7200).toFixed(2), fullDef, fullFatKg: +(fullDef/7200).toFixed(2) });
  }

  // === Roadmap: monthly simulation targets vs imputed actuals (TDEE-adjusted) ===
  const TDEE_DROP_PER_KG = 8; // TDEE drops ~8kcal per kg weight lost
  const roadmap = [];
  let simFat = liveFat;
  let rmTotalLost = 0;
  let rmY = nowDate.getFullYear(), rmM = nowDate.getMonth() + 1;
  while (simFat > liveTgtFat + 0.3 && roadmap.length < 12) {
    const ym = `${rmY}-${String(rmM).padStart(2,'0')}`;
    const dim = new Date(rmY, rmM, 0).getDate();
    const adjTDEE = effTDEE - Math.round(rmTotalLost * TDEE_DROP_PER_KG);
    const adjDeficit = adjTDEE - DAILY_PLAN_AVG;
    const tDef = adjDeficit * dim;
    const tFat = +(tDef / 7200).toFixed(2);
    const act = imputedByMonth[ym];
    const isPast = ym < currentYM, isCurr = ym === currentYM, isFut = !isPast && !isCurr;
    const startBF = +(simFat / (simFat + liveLBM) * 100).toFixed(1);
    let endBF, endFat, endWeight;
    if (isCurr) {
      // 現在月は「実測7日平均」に固定（シミュではなく現在地）。投影は来月から。
      endBF = startBF;
      endFat = +simFat.toFixed(1);
      endWeight = +(liveLBM + simFat).toFixed(1);
    } else {
      simFat -= tFat;
      endBF = Math.max(TGT_BF, +(simFat / (simFat + liveLBM) * 100).toFixed(1));
      endFat = +(liveLBM * endBF / (100 - endBF)).toFixed(1);
      endWeight = +(liveLBM + endFat).toFixed(1);
      rmTotalLost += tFat;
    }
    roadmap.push({
      ym, label: `${rmM}月`, dim, startBF, endBF, endFat, endWeight, tDef, tFat,
      isPast, isCurr, isFut,
      actDef: act ? act.impDef : null, actFat: act ? act.impFatKg : null,
      projDef: act && isCurr ? act.fullDef : null, projFat: act && isCurr ? act.fullFatKg : null,
      rec: act ? act.rec : 0, calDays: act ? act.calDays : 0, miss: act ? act.miss : 0, avg: act ? act.avg : null,
      rate: act ? Math.round((isCurr ? act.fullDef : act.impDef) / tDef * 100) : null,
    });
    rmM++; if (rmM > 12) { rmM = 1; rmY++; }
  }
  const goalFat = +(liveLBM * TGT_BF / (100 - TGT_BF)).toFixed(1);
  roadmap.push({ ym: `${rmY}-${String(rmM).padStart(2,'0')}`, label: `${rmM}月`, endBF: TGT_BF, endFat: goalFat, endWeight: +(liveLBM + goalFat).toFixed(1), isGoal: true });
  const curRM = roadmap.find(m => m.isCurr);

  const gapCal = avgCal - DAILY_PLAN_AVG;
  const gapDef = Math.round(dailyDef) - (-effDeficitPlan);
  const gapMonthly = +(actMonthly - effPlanMonthly).toFixed(1);
  const gapMonths = actMonths - effPlanMonths;

  // Body comp data
  const bcData = loadBodyComp();
  const bcWithWeight = bcData.filter(d => d.weight != null);
  const bcLatest = bcWithWeight.length ? bcWithWeight[bcWithWeight.length-1] : null;
  const bcFirst = bcWithWeight.length ? bcWithWeight[0] : null;

  let html = '';

  // 同期ステータスバー（自動同期データの最終更新時刻。GitHub Pages上でのみ表示）
  if (syncStatus.meals || syncStatus.calendar) {
    const fmtS = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
    html += `<div class="sync-status">🔄 自動同期データ最終更新　食事 <b>${fmtS(syncStatus.meals)}</b> ／ 予定 <b>${fmtS(syncStatus.calendar)}</b></div>`;
  }

  // ===================== TAB 1: GAP分析 =====================
  html += `<div id="tab-gap" class="tab-content">`;
  if (all.length === 0) {
    html += mealEmptyNotice('GAP分析');
  } else {

  // === リコンプ・スコアカード（赤字 × タンパク質） ===
  {
    const scD = all.filter(d => d.protein != null);
    const N = scD.length;
    const surplusN = scD.filter(d => dayDef(d) < 0).length;
    const lowPN = scD.filter(d => d.protein < PROTEIN_MIN).length;
    const fitN = scD.filter(d => dayDef(d) >= 0 && d.protein >= PROTEIN_MIN).length;
    const idealN = scD.filter(d => { const def = dayDef(d); return def >= 300 && def <= 500 && d.protein >= PROTEIN_TARGET; }).length;
    const fitPct = N ? Math.round(fitN / N * 100) : 0;
    html += `<div class="card">
      <h2>🎯 リコンプ・スコアカード <span style="font-size:0.68em;color:#888;font-weight:400;">赤字 × タンパク質</span></h2>
      <div style="font-size:0.76em;color:#888;margin-bottom:10px;">1点＝1日。<b>緑＝適合</b>（赤字あり＆P${PROTEIN_MIN}g以上）、<b>濃緑＝理想</b>（赤字300〜500＆P${PROTEIN_TARGET}）、<b style="color:#c62828;">赤＝溢れ</b>（カロリー超過＝脂肪減ストップ）、<b style="color:#e65100;">橙＝P不足</b>（筋肉リスク）。リコンプは「Pを死守しつつ溢れを減らす」が要。</div>
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);">
        <div class="kpi"><div class="label">リコンプ適合</div><div class="val" style="color:${fitPct >= 60 ? '#2d6a4f' : '#e65100'};font-size:1.3em;">${fitN}<span style="font-size:0.5em;color:#888;">/${N}</span></div><div class="sub" style="color:${fitPct >= 60 ? '#2d6a4f' : '#e65100'};">${fitPct}%</div></div>
        <div class="kpi"><div class="label">理想ゾーン</div><div class="val" style="font-size:1.3em;color:#1b5e20;">${idealN}<span style="font-size:0.5em;color:#888;">日</span></div><div class="sub" style="color:#1b5e20;">ど真ん中</div></div>
        <div class="kpi"><div class="label">溢れ日</div><div class="val" style="font-size:1.3em;color:${surplusN > 0 ? '#c62828' : '#999'};">${surplusN}<span style="font-size:0.5em;color:#888;">日</span></div><div class="sub" style="color:#c62828;">脂肪減↓</div></div>
        <div class="kpi"><div class="label">P不足日</div><div class="val" style="font-size:1.3em;color:${lowPN > 0 ? '#e65100' : '#999'};">${lowPN}<span style="font-size:0.5em;color:#888;">日</span></div><div class="sub" style="color:#e65100;">筋肉リスク</div></div>
      </div>
      <canvas id="recompChart" style="max-height:300px;"></canvas>
      <div style="font-size:0.68em;color:#888;margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
        <span style="color:#1b5e20;">●理想</span><span style="color:#43a047;">●適合</span><span style="color:#e65100;">●P不足</span><span style="color:#c62828;">●溢れ</span>
        <span style="color:#aaa;">緑帯＝スイートゾーン</span>
      </div>
    </div>`;
  }

  // === TDEE推定 ＆ シミュレーション基準 ===
  html += tdeeCardHTML(tdeeInfo, effTDEE);

  // === 日次カロリー収支シート（毎日のネット赤字を全部計算） ===
  {
    const ledgerDays = [...all].reverse().slice(0, 14); // 直近14日
    const sumNet = all.reduce((s, d) => s + dayDef(d), 0);
    const avgNet = all.length ? Math.round(sumNet / all.length) : 0;
    const sumAlc = all.reduce((s, d) => s + alcBrake(d), 0);
    const nTrain = all.filter(d => d.hasTrain).length;
    let rows = '';
    for (const d of ledgerDays) {
      const t = dayTDEE(d), a = alcBrake(d), net = dayDef(d);
      const dt = new Date(d.date + 'T12:00:00');
      const dlabel = `${dt.getMonth()+1}/${dt.getDate()}(${'日月火水木金土'[dt.getDay()]})`;
      const netCls = net >= 300 ? 'led-good' : net >= 0 ? 'led-ok' : 'led-bad';
      rows += `<tr>
        <td>${dlabel}${d.hasTrain?' <span class="led-tag tr">筋</span>':''}${d.hasDrink?' <span class="led-tag dk">酒</span>':''}</td>
        <td>${d.kcal.toLocaleString()}</td>
        <td>${t.toLocaleString()}${d.hasTrain?`<span class="led-sub">+${trainBonus}</span>`:''}</td>
        <td>${a>0?'-'+a.toLocaleString():'—'}</td>
        <td class="${netCls}">${net>=0?'-':'+'}${Math.abs(net).toLocaleString()}</td>
      </tr>`;
    }
    html += `<div class="card">
      <h2>📒 日次カロリー収支 <span style="font-size:0.66em;color:#888;font-weight:400;">毎日のネット赤字（トレ＋／酒−）</span></h2>
      <div class="led-kpis">
        <div class="led-kpi"><div class="lk-l">平均ネット赤字</div><div class="lk-v" style="color:${avgNet>=0?'#2d6a4f':'#c62828'};">${avgNet>=0?'-':'+'}${Math.abs(avgNet).toLocaleString()}<span>kcal/日</span></div></div>
        <div class="led-kpi"><div class="lk-l">累計（${all.length}日）</div><div class="lk-v" style="color:#1a237e;">${sumNet>=0?'-':'+'}${Math.abs(sumNet).toLocaleString()}<span>kcal</span></div></div>
        <div class="led-kpi"><div class="lk-l">脂肪換算</div><div class="lk-v" style="color:#1a237e;">${(sumNet/7200).toFixed(1)}<span>kg</span></div></div>
        <div class="led-kpi"><div class="lk-l">お酒で相殺</div><div class="lk-v" style="color:#e65100;">-${sumAlc.toLocaleString()}<span>kcal</span></div></div>
      </div>
      <table class="led-table"><thead><tr><th>日</th><th>摂取</th><th>TDEE</th><th>酒-</th><th>ネット赤字</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="led-note">その日のTDEE = 通常日${restTDEE.toLocaleString()}kcal ＋ トレ日アフターバーン+${trainBonus}（週${(trainFrac*7).toFixed(1)}回）。平均は選択中TDEE ${effTDEE.toLocaleString()} に一致（二重計上なし）。お酒ブレーキ = 推定アルコールkcal × ${ALC_FACTOR}。直近14日を表示／全${all.length}日を集計。</div>
    </div>`;
  }

  // === 15% Roadmap - Current Month Progress (TOP) ===
  if (curRM) {
    const progressToGoal = Math.min(100, Math.max(0, Math.round((totalDeficit / 7200) / liveFatToLose * 100)));
    const dElapsed = curRM.calDays;
    const dRemain = curRM.dim - currentDOM;
    const defSoFar = curRM.actDef || 0;
    const projEnd = curRM.projDef || 0;
    const projRate = curRM.rate || 0;
    const dailyPace = dElapsed > 0 ? Math.round(defSoFar / dElapsed) : 0;
    const neededPerDay = dRemain > 0 ? Math.round(Math.max(0, curRM.tDef - defSoFar) / dRemain) : 0;

    const fatLostThisMonth = +(defSoFar / 7200).toFixed(2);
    const fatProjThisMonth = +(projEnd / 7200).toFixed(2);

    html += `<div class="roadmap-card">
      <h2>🎯 15%ロードマップ ― 今月の進捗</h2>
      <div style="text-align:center;margin-bottom:14px;padding:10px 0;background:rgba(255,255,255,0.06);border-radius:10px;">
        <div style="font-size:0.72em;opacity:0.6;">今月の実績ベース脂肪減</div>
        <div style="font-size:2em;font-weight:800;color:#64ffda;line-height:1.1;">-${Math.abs(fatLostThisMonth)}<span style="font-size:0.35em;">kg</span></div>
        <div style="font-size:0.75em;opacity:0.5;margin-top:4px;">月末予測: -${Math.abs(fatProjThisMonth)}kg ／ 目標: -${curRM.tFat}kg ／ 残り${liveFatToLose}kgで約${effPlanMonths}ヶ月</div>
      </div>
      <div class="roadmap-kpi">
        <div class="roadmap-kpi-item"><div class="rl">今月の目標赤字</div><div class="rv" style="color:#ffd740;">-${curRM.tDef.toLocaleString()}<span style="font-size:0.4em;">kcal</span></div><div class="rs" style="opacity:0.5;">(-${effDeficitPlan}kcal/日 × ${curRM.dim}日)</div></div>
        <div class="roadmap-kpi-item"><div class="rl">今月の実績赤字</div><div class="rv" style="color:#64ffda;">-${Math.abs(defSoFar).toLocaleString()}<span style="font-size:0.4em;">kcal</span></div><div class="rs" style="opacity:0.5;">${dElapsed}日経過${curRM.miss > 0 ? ' ('+curRM.miss+'日補完)' : ''}</div></div>
        <div class="roadmap-kpi-item"><div class="rl">月末着地予測</div><div class="rv" style="color:${projRate>=80?'#64ffda':projRate>=50?'#ffd740':'#ff5252'};">-${Math.abs(projEnd).toLocaleString()}<span style="font-size:0.4em;">kcal</span></div><div class="rs" style="color:${projRate>=80?'#64ffda':'#ffd740'};">${projRate}% ― ${projRate>=90?'計画通り！':projRate>=70?'ほぼ計画通り':projRate>=50?'もう少し':'要改善'}</div></div>
      </div>
      <div class="roadmap-info"><span style="color:#64ffda;font-weight:500;">残り${dRemain}日で -${Math.max(0,curRM.tDef-defSoFar).toLocaleString()}kcal（-${neededPerDay}kcal/日）必要</span><span style="opacity:0.5;"> ― 現ペース-${dailyPace}/日${dailyPace>=effDeficitPlan?'。計画以上のペース！':neededPerDay<=effDeficitPlan+100?'。節制日を確保すれば到達':'。爆発日を抑えて'}</span></div>
    </div>`;
  }

  // === Monthly Roadmap Table (TOP) ===
  html += `<div class="roadmap-card">
    <h2>📅 月別ロードマップ ― シミュレーション vs 実績</h2>
    <table class="roadmap-table"><thead><tr><th>月</th><th>目標BF%</th><th>目標赤字</th><th>実績赤字</th><th>脂肪減</th><th>判定</th></tr></thead><tbody>`;
  for (const rm of roadmap) {
    if (rm.isGoal) {
      html += `<tr class="rm-goal"><td style="color:#ffd740;">${rm.label} ★</td><td style="color:#ffd740;font-weight:700;">${rm.endBF}%</td><td>―</td><td>―</td><td>―</td><td><span class="rm-badge" style="background:rgba(255,215,64,0.2);color:#ffd740;">GOAL</span></td></tr>`;
      continue;
    }
    const rc = rm.isCurr ? 'rm-current' : rm.isFut ? 'rm-future' : '';
    const dDef = rm.isCurr ? rm.projDef : rm.actDef;
    const dFat = rm.isCurr ? rm.projFat : rm.actFat;
    const rate = rm.rate;
    let badge = '';
    if (rm.isCurr) badge = `<span class="rm-badge" style="background:rgba(100,255,218,0.15);color:#64ffda;">進行中</span>`;
    else if (rm.isFut) badge = '―';
    else if (rate != null) { const bc = rate>=80?'#64ffda':rate>=50?'#ffd740':'#ff5252'; badge = `<span class="rm-badge" style="background:rgba(${rate>=80?'100,255,218':rate>=50?'255,215,64':'255,82,82'},0.2);color:${bc};">${rate}%</span>`; }
    html += `<tr class="${rc}"><td>${rm.label}${rm.isCurr?' <span style="font-size:0.75em;color:#64ffda;">now</span>':''}${rm.miss>0?' <span style="font-size:0.65em;opacity:0.5;" title="'+rm.miss+'日分を平均値で補完">*</span>':''}</td><td>${rm.endBF}%</td><td style="color:#ffd740;">-${rm.tDef.toLocaleString()}</td><td style="color:${dDef!=null&&dDef>0?'#64ffda':'#ff5252'};">${dDef!=null?'-'+Math.abs(Math.round(dDef)).toLocaleString():'―'}${rm.isCurr?'<span style="font-size:0.7em;opacity:0.5;"> 予測</span>':''}</td><td>${dFat!=null?'-'+Math.abs(dFat)+'kg':'―'}</td><td>${badge}</td></tr>`;
  }
  html += `</tbody></table>
    <div style="margin-top:10px;font-size:0.72em;opacity:0.5;padding-left:8px;border-left:2px solid rgba(255,255,255,0.15);">目標赤字 = TDEE(${effTDEE}・${tdeeInfo.source==='measured'?'実測':tdeeInfo.source==='manual'?'手動':'予測式'}) - Plan C平均(${DAILY_PLAN_AVG}) = ${effDeficitPlan}kcal/日。脂肪1kg = 7,200kcal。* = 未記録日を平均値で補完。BF%・体重は日次計測の直近7日平均（${bc2.date||'—'}時点）が起点で、現在月は実測アンカー（来月から投影）。</div>
  </div>`;

  // Weekly summary strip
  html += `<div class="week-strip">
    <div class="ws-item"><div class="ws-l">平均kcal</div><div class="ws-v" style="color:${gapCal<=0?'#2d6a4f':'#e65100'};">${avgCal.toLocaleString()}</div><div class="ws-l">${gapCal<=0?'計画内':'+'+(gapCal)}</div></div>
    <div class="ws-item"><div class="ws-l">節制日</div><div class="ws-v" style="color:${strictN>=4?'#2d6a4f':'#e65100'};">${strictN}<span style="font-size:0.6em;color:#888;">/${last7.length}日</span></div><div class="ws-l">${strictN>=4?'OK':'目標4日'}</div></div>
    <div class="ws-item"><div class="ws-l">P平均</div><div class="ws-v" style="color:${avgP&&avgP>=PROTEIN_TARGET?'#2d6a4f':avgP&&avgP>=PROTEIN_MIN?'#e65100':'#c62828'};">${avgP||'—'}<span style="font-size:0.6em;">g</span></div><div class="ws-l">${PROTEIN_MIN}〜${PROTEIN_TARGET}g</div></div>
    <div class="ws-item"><div class="ws-l">P達成率</div><div class="ws-v" style="color:${pDaysWithData.length&&pAbove140/pDaysWithData.length>=0.5?'#2d6a4f':'#e65100'};">${pDaysWithData.length?Math.round(pAbove140/pDaysWithData.length*100):'—'}<span style="font-size:0.6em;">%</span></div><div class="ws-l">${pAbove140}/${pDaysWithData.length}日</div></div>
    <div class="ws-item"><div class="ws-l">月間脂肪減</div><div class="ws-v" style="color:${actMonthly>=effPlanMonthly?'#2d6a4f':'#c62828'};">-${actMonthly}<span style="font-size:0.6em;">kg</span></div><div class="ws-l">計画-${effPlanMonthly}kg</div></div>
  </div>`;

  // Gap comparison table
  html += `<div class="card"><h2>計画 vs 実績 比較</h2>
    <table class="cmp-table"><thead><tr><th>指標</th><th style="color:#6c5ce7;">計画</th><th style="color:#e65100;">実績</th><th>GAP</th></tr></thead><tbody>
      <tr><td>平均kcal/日</td><td>${DAILY_PLAN_AVG.toLocaleString()}</td><td>${avgCal.toLocaleString()}</td><td style="color:${gapCal<=0?'#2d6a4f':'#c62828'};font-weight:700;">${gapCal>0?'+':''}${gapCal}</td></tr>
      <tr><td>カロリー赤字/日</td><td>-${effDeficitPlan}</td><td>${Math.round(dailyDef)}</td><td style="color:${dailyDef<=-effDeficitPlan?'#2d6a4f':'#c62828'};font-weight:700;">${gapDef>0?'+':''}${gapDef}</td></tr>
      <tr><td>週間カロリー赤字</td><td>-${(effDeficitPlan*7).toLocaleString()}</td><td>${Math.round(wkDeficit).toLocaleString()}</td><td style="color:${wkDeficit<=-(effDeficitPlan*7)?'#2d6a4f':'#c62828'};font-weight:700;">${wkDeficit+(effDeficitPlan*7)>0?'+':''}${Math.round(wkDeficit+(effDeficitPlan*7))}</td></tr>
      <tr><td>月間脂肪減</td><td>-${effPlanMonthly}kg</td><td>-${actMonthly}kg</td><td style="color:${actMonthly>=effPlanMonthly?'#2d6a4f':'#c62828'};font-weight:700;">${gapMonthly>0?'+':''}${gapMonthly}kg</td></tr>
      <tr><td>15%到達予測</td><td>約${effPlanMonths}ヶ月</td><td>約${actMonths<100?actMonths:'—'}ヶ月</td><td style="color:${actMonths<=effPlanMonths?'#2d6a4f':'#c62828'};font-weight:700;">${actMonths<100?(gapMonths>0?'+':'')+gapMonths+'ヶ月':'—'}</td></tr>
      <tr><td>タンパク質/日</td><td><strong>${PROTEIN_TARGET}g</strong></td><td>${avgP||'—'}g</td><td>${avgP?`<span class="tag ${avgP>=PROTEIN_TARGET?'tag-good':avgP>=PROTEIN_MIN?'tag-warn':'tag-bad'}">${avgP>=PROTEIN_TARGET?'◎':avgP>=PROTEIN_MIN?'最低ラインOK':'不足'}</span>`:''}</td></tr>
      <tr><td>P最低100g遵守</td><td>${pDaysWithData.length}/${pDaysWithData.length}日</td><td>${pAbove100}/${pDaysWithData.length}日</td><td>${pBelow100Strict>0?`<span class="tag tag-bad">節制日${pBelow100Strict}日不足</span>`:'<span class="tag tag-good">OK</span>'}</td></tr>
      <tr><td>節制日 vs 飲食日</td><td>4:3</td><td>${strictN}:${freeN}</td><td>${strictN>=4?'<span class="tag tag-good">OK</span>':'<span class="tag tag-warn">飲食日多め</span>'}</td></tr>
    </tbody></table></div>`;

  // GAP chart
  html += `<div class="card"><h2>直近${last7.length}日 計画ライン vs 実績</h2><canvas id="gapChart"></canvas>
    <div style="margin-top:10px;" class="grid-3">
      <div class="mini"><div class="v c-plan">${DAILY_PLAN_AVG}</div><div class="l">計画平均</div></div>
      <div class="mini"><div class="v c-actual">${avgCal}</div><div class="l">実績平均</div></div>
      <div class="mini"><div class="v" style="color:${gapCal<=0?'#2d6a4f':'#c62828'};">${gapCal>0?'+':''}${gapCal}</div><div class="l">GAP</div></div>
    </div></div>`;

  // PFC GAP
  if (avgP) {
    const planP=PROTEIN_TARGET, planF=52, planC_carb=180;
    html += `<div class="card"><h2>PFC・プロテインGAP</h2>
      <table class="cmp-table"><thead><tr><th></th><th style="color:#6c5ce7;">計画</th><th style="color:#e65100;">実績</th><th>GAP</th></tr></thead><tbody>
        <tr><td style="color:#e63946;font-weight:600;">P（タンパク質）</td><td>${planP}g</td><td>${avgP}g</td><td style="color:${avgP>=planP?'#2d6a4f':'#c62828'};font-weight:700;">${avgP>=planP?'+':''}${avgP-planP}g</td></tr>
        ${avgF?`<tr><td style="color:#f4a261;font-weight:600;">F（脂質）</td><td>${planF}g</td><td>${avgF}g</td><td style="color:${avgF<=planF+10?'#2d6a4f':'#c62828'};font-weight:700;">${avgF>planF?'+':''}${avgF-planF}g</td></tr>`:''}
        ${avgC?`<tr><td style="color:#457b9d;font-weight:600;">C（炭水化物）</td><td>${planC_carb}g</td><td>${avgC}g</td><td style="font-weight:700;">${avgC>planC_carb?'+':''}${avgC-planC_carb}g</td></tr>`:''}
      </tbody></table>`;
    if (avgP < PROTEIN_TARGET) {
      const isBelow100 = avgP < PROTEIN_MIN;
      html += `<div class="${isBelow100?'risk-red':'risk-yellow'} risk-box" style="margin-top:10px;"><strong>${isBelow100?'⚠️ 危険':'💡 改善ポイント'}：</strong>${isBelow100?`タンパク質が最低ライン${PROTEIN_MIN}gを下回っています。1,500kcal日でも1,600kcalまでOK。朝プロテイン30gを徹底。`:`タンパク質が目標${PROTEIN_TARGET}gに未到達。朝プロテインを30gに増やし、2回（30g×2=60g）＋食事（80g）で達成を。`}</div>`;
    }
    html += `</div>`;
  }

  // Training deficit
  if (trainDays.length > 0) {
    const td = trainDeficits2[trainDeficits2.length-1] || trainDeficits2[0];
    if (td) {
      html += `<div class="train-card"><h3>🏋️ トレーニング日の実質カロリー赤字</h3>
        <div class="train-grid">
          <div class="train-box"><div class="tv">-${td.directBurn}</div><div class="tl">直接消費</div></div>
          <div class="train-box"><div class="tv">-${td.afterburn}</div><div class="tl">アフターバーン</div></div>
          <div class="train-box"><div class="tv">-${td.totalExtra}</div><div class="tl">合計追加消費</div></div>
        </div>
        <div style="text-align:center;margin-top:10px;font-size:0.82em;opacity:0.9;">摂取${trainDays[trainDays.length-1].kcal.toLocaleString()} - 追加消費${td.totalExtra} = 実質${td.effectiveCal.toLocaleString()}kcal → 赤字 <strong>-${td.deficit}kcal</strong></div>
      </div>`;
    }
  }

  // Blowout impact card
  if (blowoutDays.length > 0) {
    html += `<div class="card"><h2 style="color:#c62828;">💥 爆発日インパクト分析</h2>
      <div class="grid-3" style="margin-bottom:12px;">
        <div class="mini"><div class="v" style="color:#c62828;">${blowoutDays.length}<span style="font-size:0.5em;">日</span></div><div class="l">2,200超の日</div></div>
        <div class="mini"><div class="v" style="color:#c62828;">+${blowoutExcess.toLocaleString()}<span style="font-size:0.5em;">kcal</span></div><div class="l">超過カロリー合計</div></div>
        <div class="mini"><div class="v" style="color:#c62828;">+${blowoutAvgImpact}<span style="font-size:0.5em;">kcal/日</span></div><div class="l">日割り影響</div></div>
      </div>
      <div class="risk-box risk-yellow" style="margin-top:0;">
        <strong>🔧 もし爆発日を${FREE_HARD_CAP.toLocaleString()}kcalでキャップしていたら：</strong><br>
        平均 <strong>${ifCappedAvg.toLocaleString()} kcal/日</strong> → 赤字 <strong>-${Math.abs(ifCappedDeficit)} kcal/日</strong> → 月 <strong>-${ifCappedMonthly}kg</strong>
        ${ifCappedMonthly > actMonthly ? `<br><span style="color:#2d6a4f;font-weight:700;">→ 脂肪減ペースが月 -${actMonthly}kg → -${ifCappedMonthly}kgに改善（${Math.round((ifCappedMonthly/actMonthly-1)*100)}%アップ）</span>` : ''}
      </div>
      ${blowoutDays.length > 0 ? `<div style="font-size:0.78em;color:#888;margin-top:8px;">内訳: ${blowoutDays.map(d=>`${fmtDateShort(d.date)} ${d.kcal.toLocaleString()}kcal(+${d.kcal-FREE})${d.hasDrink?' 🍺':''}`).join(' / ')}</div>` : ''}
    </div>`;
  }

  // === スケジュール別の食事傾向（カレンダー × 食事の相関） ===
  {
    const groupOf = (short) => {
      if (['会食', '懇親会', '飲み会', '食事会'].includes(short)) return { key: '会食・飲み', emoji: '🍽️', col: '#c62828' };
      if (['出張', '海外'].includes(short)) return { key: '出張・海外', emoji: '✈️', col: '#1565c0' };
      if (['支援', '訪問'].includes(short)) return { key: '支援・訪問', emoji: '🏢', col: '#6a1b9a' };
      return { key: '通常日', emoji: '🏠', col: '#2d6a4f' };
    };
    const groups = {};
    for (const d of all) {
      const g = groupOf(calMap[d.date] && calMap[d.date].short);
      (groups[g.key] || (groups[g.key] = { meta: g, days: [] })).days.push(d);
    }
    const stat = (days) => {
      const n = days.length;
      const avgK = n ? Math.round(days.reduce((s, d) => s + d.kcal, 0) / n) : 0;
      const pArr = days.filter(d => d.protein != null);
      const avgP = pArr.length ? Math.round(pArr.reduce((s, d) => s + d.protein, 0) / pArr.length) : null;
      const avgAlc = n ? Math.round(days.reduce((s, d) => { const p = d.protein || 0, f = d.fat || 0, c = d.carb || 0; return s + Math.max(0, d.kcal - (p * 4 + f * 9 + c * 4)); }, 0) / n) : 0;
      const overflow = days.filter(d => d.kcal >= OVERFLOW_THRESHOLD).length;
      return { n, avgK, avgP, avgAlc, overflowPct: n ? Math.round(overflow / n * 100) : 0 };
    };
    const base = stat((groups['通常日'] && groups['通常日'].days) || []);
    const order = ['通常日', '会食・飲み', '出張・海外', '支援・訪問'];
    const rows = order.filter(k => groups[k]).map(k => ({ k, meta: groups[k].meta, s: stat(groups[k].days) }));
    // 一番カロリーが盛れている種別（通常日以外）を主因として抽出
    const worst = rows.filter(r => r.k !== '通常日' && base.n).sort((a, b) => (b.s.avgK - a.s.avgK))[0];

    html += `<div class="card"><h2>📅 スケジュール別の食事傾向 <span style="font-size:0.68em;color:#888;font-weight:400;">カレンダー × 食事の相関</span></h2>
      <div style="font-size:0.76em;color:#888;margin-bottom:8px;">その日の予定の種類ごとに、平均カロリー・タンパク質・🍺アルコール・溢れ率を集計。「何の日に食べ過ぎるか」を数値化。</div>
      <table class="cmp-table"><thead><tr><th>種別</th><th>日数</th><th>平均kcal</th><th>vs通常</th><th>平均P</th><th>🍺平均</th><th>溢れ率</th></tr></thead><tbody>`;
    for (const r of rows) {
      const dK = (r.k !== '通常日' && base.n) ? r.s.avgK - base.avgK : null;
      const dP = (r.k !== '通常日' && base.n && r.s.avgP != null && base.avgP != null) ? r.s.avgP - base.avgP : null;
      html += `<tr>
        <td style="font-weight:600;color:${r.meta.col};">${r.meta.emoji} ${r.k}</td>
        <td>${r.s.n}</td>
        <td><strong>${r.s.avgK.toLocaleString()}</strong></td>
        <td style="font-weight:700;color:${dK == null ? '#999' : dK > 0 ? '#c62828' : '#2d6a4f'};">${dK == null ? '基準' : (dK > 0 ? '+' : '') + dK.toLocaleString()}</td>
        <td>${r.s.avgP != null ? r.s.avgP + 'g' : '—'}${dP != null ? `<span style="font-size:0.8em;color:${dP >= 0 ? '#2d6a4f' : '#c62828'};">(${dP > 0 ? '+' : ''}${dP})</span>` : ''}</td>
        <td style="color:${r.s.avgAlc >= 200 ? '#8e24aa' : '#888'};">${r.s.avgAlc > 0 ? r.s.avgAlc : '—'}</td>
        <td style="color:${r.s.overflowPct >= 30 ? '#c62828' : '#888'};">${r.s.overflowPct}%</td>
      </tr>`;
    }
    html += `</tbody></table>`;
    if (worst && worst.s.avgK - base.avgK > 150) {
      const dK = worst.s.avgK - base.avgK;
      html += `<div class="risk-box risk-yellow" style="font-size:0.8em;margin-top:8px;"><strong>💡 ${worst.meta.emoji} ${worst.k}の日</strong>は通常日より平均 <strong style="color:#c62828;">+${dK.toLocaleString()}kcal</strong>（🍺平均${worst.s.avgAlc}kcal・溢れ率${worst.s.overflowPct}%）。ここを<strong>${FREE_HARD_CAP.toLocaleString()}でキャップ＋3杯ルール</strong>で抑えるのが、リコンプの一番効くレバー。</div>`;
    }
    html += `</div>`;
  }

  // === 溢れた日の要因診断（総カロリー × 🍺アルコール × 📅スケジュール） ===
  const overflowDays = all.filter(d => d.kcal >= OVERFLOW_THRESHOLD);
  if (overflowDays.length > 0) {
    const schedColors = { '会食': '#c62828', '懇親会': '#c62828', '飲み会': '#8e24aa', '出張': '#1565c0', '海外': '#00838f', '支援': '#6a1b9a', '訪問': '#2e7d32', '食事会': '#e65100' };
    html += `<div class="card"><h2 style="color:#c62828;">🔎 溢れた日の要因診断（${OVERFLOW_THRESHOLD.toLocaleString()}kcal以上）</h2>
      <div style="font-size:0.76em;color:#888;margin-bottom:10px;">「📅その日が何の日だったか」と「🍺アルコール（総量−P/F/C＝推定）」を軸に要因を特定。色帯はkcal構成。2,200台は適正圏として除外。</div>`;
    for (const d of [...overflowDays].reverse()) {
      const dg = overflowDiagnosis(d);
      const ann = calMap[d.date];
      const schedCol = ann ? (schedColors[ann.short] || '#c62828') : '#9e9e9e';
      const seg = (k, col, label) => k > 0 ? `<div title="${label} ${k.toLocaleString()}kcal" style="width:${(k / d.kcal * 100).toFixed(1)}%;background:${col};"></div>` : '';
      html += `<div class="day-card day-over" style="margin-bottom:10px;">
        <div class="day-header">
          <span class="day-date">${fmtDate(d.date)} ${d.hasDrink ? '🍺' : ''}${d.hasTrain ? '🏋️' : ''}</span>
          <span class="tag" style="background:${schedCol};color:#fff;">📅 ${ann ? ann.short : '予定なし'}</span>
        </div>
        ${ann ? `<div style="font-size:0.78em;color:#444;margin:5px 0;background:#f7f7f7;border-left:3px solid ${schedCol};padding:5px 8px;border-radius:4px;">${ann.full}</div>` : `<div style="font-size:0.72em;color:#aaa;margin:5px 0;">カレンダーに該当予定なし（未連携 or 通常日）</div>`}
        <div style="font-size:0.82em;margin:4px 0;"><strong style="font-size:1.2em;color:#c62828;">${d.kcal.toLocaleString()}</strong> kcal ／ −${RECOMP_DEFICIT}赤字 <strong>${dg.daysErased}日分</strong>を相殺${dg.alcoholK >= 150 ? ` ／ 🍺<strong>約${dg.alcoholK.toLocaleString()}kcal</strong>` : ''}</div>
        <div style="display:flex;height:12px;border-radius:6px;overflow:hidden;margin:6px 0;background:#eee;">
          ${seg(dg.pK, '#e63946', 'P')}${seg(dg.fK, '#f4a261', 'F')}${seg(dg.cK, '#457b9d', 'C')}${seg(dg.alcoholK, '#8e24aa', '🍺/他')}
        </div>
        <div style="font-size:0.68em;color:#777;display:flex;gap:9px;flex-wrap:wrap;">
          <span style="color:#e63946;">■P${dg.pK}</span><span style="color:#f4a261;">■F${dg.fK}</span><span style="color:#457b9d;">■C${dg.cK}</span>${dg.alcoholK > 0 ? `<span style="color:#8e24aa;">■🍺/他${dg.alcoholK}</span>` : ''}<span style="opacity:0.5;">kcal</span>
        </div>
        <div class="risk-box risk-yellow" style="font-size:0.75em;margin-top:6px;padding:8px;">💡 ${dg.tips.join('<br>💡 ')}</div>
      </div>`;
    }
    html += `</div>`;
  }

  // Verdict
  const score = (gapCal<=0?1:0) + (avgP&&avgP>=PROTEIN_MIN?1:0) + (strictN>=3?1:0) + (wkDeficit<0?1:0) + (pBelow100Strict===0?1:0);
  const verdict = score>=5 ? {text:'完璧！計画通りのペースです',cl:'risk-green',emoji:'🎯'} : score>=3 ? {text:'おおむね順調。プロテインと節制日を微調整',cl:'risk-yellow',emoji:'💪'} : {text:'計画とのGAPが大きめ。節制日を増やし、P100gを死守',cl:'risk-red',emoji:'⚠️'};
  html += `<div class="${verdict.cl} risk-box" style="font-size:0.92em;"><strong>${verdict.emoji} ${verdict.text}</strong></div>`;
  } // end else (meals present)
  html += `</div>`; // end tab-gap

  const today = new Date().toISOString().split('T')[0];

  // ===================== TAB 2: 実績トラッカー =====================
  html += `<div id="tab-tracker" class="tab-content">`;
  if (all.length === 0) {
    html += mealEmptyNotice('食事実績');
  } else {

  // Calorie chart
  html += `<div class="card"><h2>カロリー推移</h2>
    <div class="dm-period-filter" id="wk-period-filter">
      <button data-period="30">1M</button>
      <button data-period="90">3M</button>
      <button data-period="180">6M</button>
      <button class="active" data-period="0">ALL</button>
    </div>
    <canvas id="weekChart"></canvas></div>`;

  // Protein chart
  if (pAll.length >= 3) {
    html += `<div class="card"><h2>プロテイン推移</h2>
    <div class="dm-period-filter" id="prot-period-filter">
      <button data-period="30">1M</button>
      <button data-period="90">3M</button>
      <button data-period="180">6M</button>
      <button class="active" data-period="0">ALL</button>
    </div>
    <canvas id="proteinChart"></canvas></div>`;
  }

  // PFC donut
  if (pD.length > 0) {
    html += `<div class="card"><h2>PFCバランス（直近平均）</h2><canvas id="pfcChart"></canvas></div>`;
  }

  // Day by day
  html += `<div class="card"><h2>日別レコード（${all.length}日分）</h2>`;
  for (const day of [...all].reverse()) {
    const type = classify(day), tgt = target(day), diff2 = day.kcal - tgt;
    let tc, tt;
    if(day.kcal<=tgt){tc='tag-good';tt=`-${Math.abs(diff2)}`;}
    else if(day.kcal<=tgt+200){tc='tag-warn';tt=`+${diff2}`;}
    else{tc='tag-bad';tt=`+${diff2} 超過`;}
    const dc = type==='over'?'day-over':type==='free'?'day-free':'day-strict';
    const ps = proteinStatus(day);
    const td = trainDeficit(day);
    html += `<div class="day-card ${dc}">
      <div class="day-header"><span class="day-date">${fmtDate(day.date)} ${day.hasDrink?'🍺':''}${day.hasTrain?'🏋️':''}</span><span class="tag ${tc}">${tt} kcal</span></div>
      <div class="day-macros"><span class="day-cal" style="color:${type==='over'?'#c62828':type==='free'?'#e65100':'#1565c0'};">${day.kcal.toLocaleString()} kcal</span>
        ${day.protein?`<span>P:${Math.round(day.protein)}g</span>`:''}${day.fat?`<span>F:${Math.round(day.fat)}g</span>`:''}${day.carb?`<span>C:${Math.round(day.carb)}g</span>`:''}</div>`;
    if (day.protein != null) {
      const pPct = Math.min(Math.round(day.protein / PROTEIN_TARGET * 100), 100);
      const minPct = Math.round(PROTEIN_MIN / PROTEIN_TARGET * 100); // 100/140 ≈ 71%
      const barCol = day.protein >= PROTEIN_TARGET ? '#43a047' : day.protein >= PROTEIN_MIN ? '#ffb300' : '#e53935';
      const statusText = day.protein >= PROTEIN_TARGET ? '目標達成 ◎' : day.protein >= PROTEIN_MIN ? `最低OK（あと${Math.round(PROTEIN_TARGET-day.protein)}gで目標）` : `⚠ 最低${PROTEIN_MIN}g未満`;
      const statusTag = day.protein >= PROTEIN_TARGET ? 'tag-good' : day.protein >= PROTEIN_MIN ? 'tag-warn' : 'tag-bad';
      html += `<div class="protein-bar-wrap">
        <div class="protein-bar-bg">
          <div class="protein-bar-fill" style="width:${pPct}%;background:${barCol};"></div>
          <div class="protein-bar-marker" style="left:${minPct}%;background:#e65100;" title="最低${PROTEIN_MIN}g"><div class="protein-bar-marker-label" style="color:#e65100;">${PROTEIN_MIN}</div></div>
          <div class="protein-bar-marker" style="left:100%;background:#2d6a4f;" title="目標${PROTEIN_TARGET}g"><div class="protein-bar-marker-label" style="color:#2d6a4f;">${PROTEIN_TARGET}</div></div>
        </div>
        <div class="protein-bar-labels"><span><strong>${Math.round(day.protein)}g</strong></span><span class="tag ${statusTag}" style="font-size:0.65em;">${statusText}</span></div>
      </div>`;
    }
    if (td) html += `<div class="day-alerts"><span class="tag tag-info">実質${td.effectiveCal.toLocaleString()}kcal（-${td.totalExtra}消費）→ 赤字-${td.deficit}kcal</span></div>`;
    if (classify(day)==='strict' && day.protein != null && day.protein < PROTEIN_MIN) html += `<div class="day-alerts"><span class="tag tag-bad">⚠ 節制日P${PROTEIN_MIN}g未満 → 1,600kcalまで増やしてP確保を</span></div>`;
    html += `${day.memo?`<div class="day-memo">${day.memo}</div>`:''}</div>`;
  }
  html += `</div>`; // close 日別レコード card
  } // end else (meals present)
  html += `</div>`; // end tab-tracker

  // ===================== TAB 3: 毎日計測 =====================
  const dmData = loadDaily();
  html += `<div id="tab-daily" class="tab-content">`;

  // --- Daily KPI strip ---
  const dmLatest = dmData.length ? dmData[dmData.length - 1] : null;
  const dmPrev = dmData.length > 1 ? dmData[dmData.length - 2] : null;
  const dmMA7w = dmData.length ? calcMA(dmData, 'weight', dmData.length - 1, 7) : null;
  const dmMA7f = dmData.length ? calcMA(dmData, 'fatPct', dmData.length - 1, 7) : null;
  const dmMA7m = dmData.length ? calcMA(dmData, 'muscle', dmData.length - 1, 7) : null;
  const dmMA7lbm = dmData.length ? calcMA(dmData, 'lbm', dmData.length - 1, 7) : null;
  const dmMA7fm = dmData.length ? calcMA(dmData, 'fatMass', dmData.length - 1, 7) : null;
  const dmDiffW = dmLatest && dmPrev ? (dmLatest.weight - dmPrev.weight).toFixed(2) : null;
  const dmDiffF = dmLatest && dmPrev ? (dmLatest.fatPct - dmPrev.fatPct).toFixed(1) : null;
  const dmDiffM = dmLatest && dmPrev ? (dmLatest.muscle - dmPrev.muscle).toFixed(2) : null;
  const dmLBMnow = dmLatest ? calcLBM(dmLatest) : null;
  const dmLBMprev = dmPrev ? calcLBM(dmPrev) : null;
  const dmDiffLBM = dmLBMnow != null && dmLBMprev != null ? (dmLBMnow - dmLBMprev).toFixed(2) : null;
  const dmFMnow = dmLatest ? calcFatMass(dmLatest) : null;
  const dmFMprev = dmPrev ? calcFatMass(dmPrev) : null;
  const dmDiffFM = dmFMnow != null && dmFMprev != null ? (dmFMnow - dmFMprev).toFixed(2) : null;

  html += `<div class="dm-kpi" style="grid-template-columns:repeat(3,1fr);">
    <div class="dm-kpi-item">
      <div class="dm-label">体重</div>
      <div class="dm-val">${dmLatest ? dmLatest.weight.toFixed(1) : '—'}<span style="font-size:0.45em;">kg</span></div>
      <div class="dm-sub" style="color:${dmDiffW && parseFloat(dmDiffW) <= 0 ? '#2d6a4f' : '#c62828'}">${dmDiffW != null ? (parseFloat(dmDiffW) > 0 ? '+' : '') + dmDiffW : ''}</div>
      <div class="dm-avg">7日平均 ${dmMA7w != null ? dmMA7w.toFixed(2) : '—'}kg</div>
    </div>
    <div class="dm-kpi-item">
      <div class="dm-label">体脂肪率</div>
      <div class="dm-val">${dmLatest ? dmLatest.fatPct.toFixed(1) : '—'}<span style="font-size:0.45em;">%</span></div>
      <div class="dm-sub" style="color:${dmDiffF && parseFloat(dmDiffF) <= 0 ? '#2d6a4f' : '#c62828'}">${dmDiffF != null ? (parseFloat(dmDiffF) > 0 ? '+' : '') + dmDiffF : ''}</div>
      <div class="dm-avg">7日平均 ${dmMA7f != null ? dmMA7f.toFixed(2) : '—'}%</div>
    </div>
    <div class="dm-kpi-item" style="background:linear-gradient(135deg,#fce4ec,#ffcdd2);">
      <div class="dm-label">体脂肪量</div>
      <div class="dm-val" style="color:#c62828;">${dmFMnow != null ? dmFMnow.toFixed(1) : '—'}<span style="font-size:0.45em;">kg</span></div>
      <div class="dm-sub" style="color:${dmDiffFM && parseFloat(dmDiffFM) <= 0 ? '#2d6a4f' : '#c62828'}">${dmDiffFM != null ? (parseFloat(dmDiffFM) > 0 ? '+' : '') + dmDiffFM : ''}</div>
      <div class="dm-avg">7日平均 ${dmMA7fm != null ? dmMA7fm.toFixed(2) : '—'}kg</div>
    </div>
  </div>
  <div class="dm-kpi" style="grid-template-columns:repeat(3,1fr);margin-top:-6px;">
    <div class="dm-kpi-item" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);">
      <div class="dm-label">除脂肪体重</div>
      <div class="dm-val" style="color:#1b5e20;">${dmLBMnow != null ? dmLBMnow.toFixed(1) : '—'}<span style="font-size:0.45em;">kg</span></div>
      <div class="dm-sub" style="color:${dmDiffLBM && parseFloat(dmDiffLBM) >= 0 ? '#2d6a4f' : '#c62828'}">${dmDiffLBM != null ? (parseFloat(dmDiffLBM) > 0 ? '+' : '') + dmDiffLBM : ''}</div>
      <div class="dm-avg">7日平均 ${dmMA7lbm != null ? dmMA7lbm.toFixed(2) : '—'}kg</div>
    </div>
    <div class="dm-kpi-item">
      <div class="dm-label">筋肉量</div>
      <div class="dm-val">${dmLatest ? dmLatest.muscle.toFixed(1) : '—'}<span style="font-size:0.45em;">kg</span></div>
      <div class="dm-sub" style="color:${dmDiffM && parseFloat(dmDiffM) >= 0 ? '#2d6a4f' : '#c62828'}">${dmDiffM != null ? (parseFloat(dmDiffM) > 0 ? '+' : '') + dmDiffM : ''}</div>
      <div class="dm-avg">7日平均 ${dmMA7m != null ? dmMA7m.toFixed(2) : '—'}kg</div>
    </div>
    <div class="dm-kpi-item" style="background:transparent;"></div>
  </div>`;

  // --- Daily chart ---
  html += `<div class="dm-chart-card"><h2>📈 毎日計測 推移チャート</h2>
    <div class="dm-filter" id="dm-chart-filter">
      <button class="active" data-metric="weight">体重</button>
      <button data-metric="fatPct">体脂肪率</button>
      <button data-metric="fatMass">体脂肪量</button>
      <button data-metric="lbm">除脂肪体重</button>
      <button data-metric="muscle">筋肉量</button>
    </div>
    <div class="dm-period-filter" id="dm-period-filter">
      <button data-period="30">1M</button>
      <button class="active" data-period="90">3M</button>
      <button data-period="180">6M</button>
      <button data-period="0">ALL</button>
    </div>
    <canvas id="dmChart" style="max-height:260px;"></canvas>
  </div>`;

  // --- Combo chart: muscle + fat mass ---
  html += `<div class="dm-chart-card"><h2>💪🔥 筋肉量 vs 体脂肪量（7日移動平均）</h2>
    <div class="dm-period-filter" id="dm-combo-period">
      <button data-period="30">1M</button>
      <button class="active" data-period="90">3M</button>
      <button data-period="180">6M</button>
      <button data-period="0">ALL</button>
    </div>
    <canvas id="dmComboChart" style="max-height:280px;"></canvas>
  </div>`;

  // --- Daily input form ---
  html += `<div class="dm-section"><h2>⚖️ 毎日の記録 <button class="bc-toggle" id="dm-toggle-btn">＋記録</button></h2>`;
  html += `<div class="dm-form" id="dm-form">
    <div class="dm-form-grid">
      <div class="dm-field"><label>日付 *</label><input type="date" id="dm-date" value="${today}"></div>
      <div class="dm-field"><label>体重(kg) *</label><input type="number" id="dm-weight" step="0.1" placeholder="71.3"></div>
      <div class="dm-field"><label>体脂肪率(%)</label><input type="number" id="dm-fatpct" step="0.1" placeholder="23.6"></div>
      <div class="dm-field"><label>筋肉量(kg)</label><input type="number" id="dm-muscle" step="0.1" placeholder="51.7"></div>
    </div>
    <div style="margin-top:8px;text-align:right;">
      <button class="tl-btn tl-btn-primary" id="dm-save">保存</button>
    </div>
  </div>`;

  // --- Daily history table ---
  html += `<div class="dm-history" id="dm-history">`;
  html += `<div class="dm-history-row header"><div>日付</div><div>体重</div><div>体脂肪率</div><div>体脂肪量</div><div>除脂肪体重</div><div>筋肉量</div><div></div></div>`;
  for (let di = dmData.length - 1; di >= 0; di--) {
    const d = dmData[di];
    const ma7w = calcMA(dmData, 'weight', di, 7);
    const lbm = calcLBM(d);
    const fm = calcFatMass(d);
    html += `<div class="dm-history-row">
      <div>${fmtDate(d.date)}</div>
      <div><strong>${d.weight.toFixed(1)}</strong><span class="dm-ma-badge">${ma7w != null ? ma7w.toFixed(1) : ''}</span></div>
      <div>${d.fatPct != null ? d.fatPct.toFixed(1) + '%' : '—'}</div>
      <div style="color:#c62828;font-weight:700;">${fm != null ? fm.toFixed(1) : '—'}</div>
      <div style="color:#1b5e20;font-weight:700;">${lbm != null ? lbm.toFixed(1) : '—'}</div>
      <div>${d.muscle != null ? d.muscle.toFixed(1) : '—'}</div>
      <div><button class="dm-del" data-idx="${di}" title="削除">✕</button></div>
    </div>`;
  }
  html += `</div>`;
  html += `</div>`; // end dm-section
  html += `</div>`; // end tab-daily

  // ===================== TAB 4: トレーニング =====================
  const tlData = loadTraining();
  html += `<div id="tab-training" class="tab-content active">`;

  // ===== Body Composition Section (moved from tracker) =====
  html += `<div class="bc-section"><h2>📊 身体計測データ <button class="bc-toggle" id="bc-toggle-btn">＋記録</button></h2>`;

  // Input form (hidden by default)
  html += `<div class="bc-form" id="bc-form">
    <div class="bc-form-grid" style="margin-bottom:8px;">
      <div class="bc-field"><label>日付 *</label><input type="date" id="bc-date" value="${today}"></div>
      <div class="bc-field"><label>セッション</label><input type="text" id="bc-session" placeholder="例: S15"></div>
    </div>
    <div class="bc-form-grid row3" style="margin-bottom:8px;">
      <div class="bc-field"><label>体重 (kg)</label><input type="number" id="bc-weight" step="0.1" placeholder="73.2"></div>
      <div class="bc-field"><label>筋肉量 (kg)</label><input type="number" id="bc-muscle" step="0.1" placeholder="51.4"></div>
      <div class="bc-field"><label>体脂肪量 (kg)</label><input type="number" id="bc-fatmass" step="0.1" placeholder="18.7"></div>
    </div>
    <div class="bc-form-grid row3" style="margin-bottom:8px;">
      <div class="bc-field"><label>体脂肪率 (%)</label><input type="number" id="bc-fatpct" step="0.1" placeholder="25.5"></div>
      <div class="bc-field"><label>ウエスト (cm)</label><input type="number" id="bc-waist" step="0.5" placeholder="87.0"></div>
      <div class="bc-field"><label>InBody点数</label><input type="number" id="bc-inbody" step="1" placeholder="73"></div>
    </div>
    <div class="bc-form-grid" style="margin-bottom:8px;">
      <div class="bc-field"><label>GLP-1</label><select id="bc-glp1"><option value="">—</option><option value="使用">使用</option><option value="不使用">不使用</option><option value="頓服">頓服のみ</option></select></div>
      <div class="bc-field"><label>メモ</label><input type="text" id="bc-note" placeholder="例: フォーム改善、前日飲み会の影響 等"></div>
    </div>
    <div class="bc-actions">
      <button class="bc-btn bc-btn-primary" id="bc-save">保存</button>
    </div>
  </div>`;

  // Latest KPI strip
  if (bcLatest) {
    const diff = (v, field) => {
      if (v == null) return '';
      const prev = [...bcWithWeight].reverse().find((d,i) => i > 0 && d[field] != null);
      if (!prev || prev[field] == null) return '';
      const d = +(v - prev[field]).toFixed(1);
      return d === 0 ? '' : `<div class="bd" style="color:${field==='fatMass'||field==='fatPct'?(d<0?'#2d6a4f':'#c62828'):(d>0?'#2d6a4f':'#c62828')};">${d>0?'+':''}${d}</div>`;
    };
    const totalChange = (field, invert) => {
      if (!bcFirst || bcFirst[field]==null || !bcLatest || bcLatest[field]==null) return '';
      const d = +(bcLatest[field] - bcFirst[field]).toFixed(1);
      return d === 0 ? '' : `累計${d>0?'+':''}${d}`;
    };
    html += `<div class="bc-kpi">
      <div class="bc-kpi-item"><div class="bl">体重</div><div class="bv">${bcLatest.weight||'—'}<span style="font-size:0.5em;">kg</span></div>${diff(bcLatest.weight,'weight')}</div>
      <div class="bc-kpi-item"><div class="bl">体脂肪率</div><div class="bv" style="color:#e65100;">${bcLatest.fatPct||'—'}<span style="font-size:0.5em;">%</span></div>${diff(bcLatest.fatPct,'fatPct')}</div>
      <div class="bc-kpi-item"><div class="bl">体脂肪量</div><div class="bv">${bcLatest.fatMass||'—'}<span style="font-size:0.5em;">kg</span></div>${diff(bcLatest.fatMass,'fatMass')}</div>
      <div class="bc-kpi-item"><div class="bl">InBody</div><div class="bv" style="color:#6c5ce7;">${bcLatest.inbody||'—'}<span style="font-size:0.5em;">点</span></div>${diff(bcLatest.inbody,'inbody')}</div>
    </div>`;
  }

  // Body comp chart
  if (bcWithWeight.length >= 2) {
    html += `<canvas id="bcChart" style="max-height:280px;"></canvas>`;
  }

  // Body comp history table
  html += `<details style="margin-top:12px;"><summary style="font-size:0.82em;font-weight:600;color:#666;cursor:pointer;">計測履歴（${bcData.length}件）</summary>
    <div style="overflow-x:auto;"><table class="bc-table"><thead><tr>
      <th>日付</th><th>Session</th><th>体重</th><th>筋肉量</th><th>脂肪量</th><th>体脂肪率</th><th>ウエスト</th><th>InBody</th><th>GLP-1</th><th></th>
    </tr></thead><tbody>`;
  for (let i = bcData.length - 1; i >= 0; i--) {
    const d = bcData[i];
    html += `<tr>
      <td>${fmtDateShort(d.date)}</td><td>${d.session||''}</td>
      <td>${d.weight!=null?d.weight:'—'}</td><td>${d.muscle!=null?d.muscle:'—'}</td>
      <td>${d.fatMass!=null?d.fatMass:'—'}</td><td>${d.fatPct!=null?d.fatPct+'%':'—'}</td>
      <td>${d.waist!=null?d.waist:'—'}</td><td>${d.inbody!=null?d.inbody:'—'}</td>
      <td style="font-size:0.85em;">${d.glp1||'—'}</td>
      <td><button class="bc-del" data-idx="${i}" title="削除">✕</button></td>
    </tr>`;
  }
  html += `</tbody></table></div></details>`;
  html += `</div>`; // end bc-section

  // --- Training KPI strip ---
  const tlLatest = tlData.length ? tlData[tlData.length - 1] : null;
  const tlTotalSessions = tlData.length;
  // Find best weights for key exercises
  const bestWeight = (exName) => {
    let best = 0;
    for (const s of tlData) for (const e of s.exercises) {
      if (e.name === exName && e.weight && e.weight > best) best = e.weight;
    }
    return best;
  };
  const benchBest = bestWeight('ベンチプレス（スミス）');
  const squatBest = bestWeight('スクワット');
  const incBest = bestWeight('インクラインベンチ（スミス）');
  const latBest = bestWeight('ラットプルダウン');

  html += `<div class="tl-kpi">
    <div class="tl-kpi-item"><div class="tl2">セッション数</div><div class="tv2">${tlTotalSessions}</div><div class="tl2">回</div></div>
    <div class="tl-kpi-item"><div class="tl2">ベンチ最大</div><div class="tv2">${benchBest||'—'}<span style="font-size:0.5em;">kg</span></div><div class="td2" style="color:#1b5e20;">初回25→${benchBest}kg</div></div>
    <div class="tl-kpi-item"><div class="tl2">スクワット最大</div><div class="tv2">${squatBest||'—'}<span style="font-size:0.5em;">kg</span></div><div class="td2" style="color:#1b5e20;">初回32.5→${squatBest}kg</div></div>
    <div class="tl-kpi-item"><div class="tl2">インクライン最大</div><div class="tv2">${incBest||'—'}<span style="font-size:0.5em;">kg</span></div><div class="td2" style="color:#1b5e20;">初回32.5→${incBest}kg</div></div>
  </div>`;

  // --- Exercise progression chart ---
  html += `<div class="tl-chart-card"><h2>🏋️ 種目別 重量推移</h2>
    <div class="tl-filter" id="tl-chart-filter">
      <button class="active" data-ex="ベンチプレス（スミス）">ベンチプレス</button>
      <button data-ex="インクラインベンチ（スミス）">インクライン</button>
      <button data-ex="スクワット">スクワット</button>
      <button data-ex="ラットプルダウン">ラットプルダウン</button>
      <button data-ex="ロープーリー">ロープーリー</button>
    </div>
    <canvas id="tlProgressChart" style="max-height:240px;"></canvas>
  </div>`;

  // --- Waist section ---
  const wsLatest = (() => { const ws = loadWaist(); return ws.length ? ws[ws.length-1] : null; })();
  const wsLatestVal = wsLatest ? wsLatest.waist : null;
  const wsCleared = wsLatestVal != null && wsLatestVal < 85;
  const wsRemain = wsLatestVal != null ? +(wsLatestVal - 85).toFixed(1) : null;
  // Health checkup countdown
  const checkupDate = new Date('2026-07-09T00:00:00');
  const today2 = new Date(); today2.setHours(0,0,0,0);
  const daysLeft = Math.ceil((checkupDate - today2) / (1000*60*60*24));
  const checkupPast = daysLeft < 0;

  if (wsCleared) {
    html += `<div style="background:linear-gradient(135deg,#d4edda,#c3e6cb);border-radius:12px;padding:16px;margin-bottom:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <div style="font-size:2em;">🎊🏆🎊</div>
      <div style="font-size:1.1em;font-weight:800;color:#155724;margin:6px 0;">メタボ基準クリア！ウエスト85cm未満達成！</div>
      <div style="font-size:0.85em;color:#155724;">最新 ${wsLatestVal}cm（${wsLatest.date}）</div>
    </div>`;
  } else if (wsRemain != null) {
    html += `<div style="background:linear-gradient(135deg,#fff3e0,#ffe0b2);border-radius:12px;padding:14px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-size:0.72em;color:#e65100;font-weight:700;">🎯 メタボ基準まで</div>
          <div style="font-size:1.8em;font-weight:800;color:#e65100;">あと -${wsRemain}cm</div>
          <div style="font-size:0.75em;color:#bf360c;">現在 ${wsLatestVal}cm → 目標 85.0cm未満</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:0.72em;color:#1565c0;font-weight:700;">🏥 健康診断まで</div>
          <div style="font-size:1.8em;font-weight:800;color:#1565c0;">${checkupPast ? '終了' : daysLeft + '日'}</div>
          <div style="font-size:0.75em;color:#0d47a1;">7月9日（木）</div>
        </div>
      </div>
      <div style="margin-top:10px;background:#fff;border-radius:6px;height:14px;overflow:hidden;position:relative;">
        <div style="height:100%;border-radius:6px;background:linear-gradient(90deg,#ff6f00,#e65100);width:${Math.min(100, Math.max(5, ((90.5 - wsLatestVal) / (90.5 - 85)) * 100))}%;transition:width 0.5s;"></div>
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:0.6em;font-weight:700;color:#fff;text-shadow:0 0 2px rgba(0,0,0,0.5);">${Math.round(((90.5 - wsLatestVal) / (90.5 - 85)) * 100)}% 達成</div>
      </div>
    </div>`;
  }

  html += `<div class="tl-chart-card"><h2>📏 ウエスト（腹囲）推移</h2>
    <div class="dm-period-filter" id="ws-period-filter">
      <button data-period="90">3M</button>
      <button class="active" data-period="180">6M</button>
      <button data-period="0">ALL</button>
    </div>
    <canvas id="waistChart" style="max-height:260px;"></canvas>
  </div>`;

  // --- Training log form ---
  html += `<div class="tl-section"><h2>📝 トレーニング記録 <button class="bc-toggle" id="tl-toggle-btn">＋記録</button></h2>`;
  html += `<div class="tl-form" id="tl-form">
    <div class="tl-form-grid row3" style="margin-bottom:8px;">
      <div class="tl-field"><label>日付 *</label><input type="date" id="tl-date" value="${today}"></div>
      <div class="tl-field"><label>セッション *</label><input type="text" id="tl-session" placeholder="例: S20"></div>
      <div class="tl-field"><label>腹囲 (cm)</label><input type="number" id="tl-waist" step="0.5" placeholder="86.5"></div>
    </div>
    <div id="tl-exercises-container" class="tl-exercises"></div>
    <button class="tl-btn tl-btn-add" id="tl-add-ex" type="button">＋ 種目を追加</button>
    <div class="tl-form-grid" style="margin-top:10px;">
      <div class="tl-field" style="grid-column:1/-1;"><label>先生のコメント</label><textarea id="tl-comment" placeholder="篠澤先生のフィードバックやアドバイスを記録"></textarea></div>
    </div>
    <div class="tl-actions">
      <button class="tl-btn tl-btn-primary" id="tl-save">保存</button>
    </div>
  </div>`;

  // --- Session history ---
  html += `<div style="margin-top:14px;">`;
  for (let si = tlData.length - 1; si >= 0; si--) {
    const s = tlData[si];
    html += `<div class="tl-session-card">
      <h3><span>🏋️ ${s.session || ''} ― ${fmtDate(s.date)}</span><button class="tl-session-del" data-idx="${si}" title="削除">✕</button></h3>
      ${s.waist ? `<div style="font-size:0.78em;color:#555;margin-bottom:6px;">📏 腹囲：<strong>${s.waist}cm</strong></div>` : ''}
      <div class="tl-ex-list">
        <div class="tl-ex-row" style="opacity:0.6;font-size:0.72em;font-weight:600;">
          <div>種目</div><div style="text-align:center;">重量</div><div style="text-align:center;">回数</div><div style="text-align:center;">セット</div>
        </div>`;
    for (const e of s.exercises) {
      html += `<div class="tl-ex-row">
        <div class="tl-ex-name">${e.name}</div>
        <div class="tl-ex-val">${e.weight ? e.weight + 'kg' : '—'}</div>
        <div class="tl-ex-val">${e.reps ? e.reps + '回' : '—'}</div>
        <div class="tl-ex-val">${e.sets ? e.sets + 'set' : '—'}</div>
      </div>`;
    }
    if (s.comment) {
      html += `<div class="tl-comment"><strong>💬 先生のコメント：</strong><br>${s.comment}</div>`;
    }
    html += `</div></div>`;
  }
  html += `</div>`;
  html += `</div>`; // end tl-section
  html += `</div>`; // end tab-training

  // ===================== TAB 4: シミュレーション =====================
  html += `<div id="tab-sim" class="tab-content">`;

  // TDEE推定カード（目標設計タブにも配置。GAP分析と同期）
  html += tdeeCardHTML(tdeeInfo, effTDEE);

  html += `<div class="plan-reminder"><h3>Plan C ― メリハリ型カロリー管理</h3>
    <div class="pr-grid"><div class="pr-box"><div class="pv">1,500</div><div class="pl">節制日 × 週4日</div></div><div class="pr-box"><div class="pv">2,200</div><div class="pl">飲食日 × 週3日</div></div></div>
    <div style="text-align:center;margin-top:10px;font-size:0.82em;opacity:0.9;">週平均 ${DAILY_PLAN_AVG} kcal ／ 赤字 -${effDeficitPlan} kcal/日 ／ 月 -${effPlanMonthly}kg脂肪</div></div>`;

  html += `<div class="rule-card" style="margin-top:14px;"><h3>🥩 タンパク質の優先ルール（S14確定）</h3>
    <div class="rule-item"><strong>原則：</strong>カロリー第一 ＞ PFCバランス</div>
    <div class="rule-item"><strong>節制日（1,500kcal）：</strong>P ${PROTEIN_MIN}g未満 → 1,600kcalまでOK。${PROTEIN_TARGET}gが理想。</div>
    <div class="rule-item"><strong>飲食日（2,200kcal）：</strong>P不足でも追加プロテイン不要。炭水化物・脂質がカバー。</div>
    <div class="rule-item"><strong>朝プロテイン30g：</strong>寝起きは栄養カラカラで吸収率MAX。ここで稼ぐ。</div>
    <div class="rule-item" style="border-left:3px solid #6c5ce7;padding-left:8px;"><strong>就寝前プロテイン15g（S22・GLP-1オフ対応）：</strong>夜中に空腹で起きるなら就寝前に15gを飲んで寝る（飲むのはOK・睡眠の質を最優先）。1,500kcalは維持し、第二段階で夜の一杯分を確保。起きてしまったら炭酸水/水で空腹をごまかす。</div>
    <div class="rule-item"><strong>達成パターン：</strong>プロテイン2回（30g×2=60g）＋食事2回（40g×2=80g）= ${PROTEIN_TARGET}g</div></div>`;

  html += `<div class="train-card" style="margin-top:14px;"><h3>🏋️ トレーニング日のカロリールール</h3>
    <div class="train-grid"><div class="train-box"><div class="tv">${TRAIN_BURN}</div><div class="tl">直接消費kcal</div></div><div class="train-box"><div class="tv">×${AFTERBURN_MULT}</div><div class="tl">アフターバーン倍率</div></div><div class="train-box"><div class="tv">${Math.round(TDEE*AFTERBURN_MULT-TDEE)+TRAIN_BURN}</div><div class="tl">追加消費合計kcal</div></div></div>
    <div style="text-align:center;margin-top:10px;font-size:0.82em;opacity:0.9;">トレーニング日でもカロリーは増やさない。「消費が増えるラッキー」でそのまま削る。</div></div>`;

  html += `<div class="card" style="margin-top:14px;"><h2>体脂肪率シミュレーション → 15%</h2><canvas id="simChart"></canvas></div>`;

  html += `<div class="card"><h2>Plan C 月別推移予測</h2>
    <div style="font-size:0.74em;color:#888;margin-bottom:6px;">日次計測の直近7日平均（${bc2.date||'—'}時点）の体脂肪量 ${liveFat}kg・除脂肪 ${liveLBM}kg を起点に、TDEE ${effTDEE}（${tdeeInfo.source==='measured'?'実測':tdeeInfo.source==='manual'?'手動':'予測式'}）×Plan C平均${DAILY_PLAN_AVG}kcalで試算。6月は実測アンカー、上の月別ロードマップと同一エンジン。</div>
    <table class="proj-table"><thead><tr><th>月</th><th>体脂肪率</th><th>体脂肪量</th><th>推定体重</th></tr></thead><tbody>`;
  for (const rm of roadmap) {
    const isGoal = rm.isGoal;
    const lbl = `${rm.label}${isGoal?' ★':rm.isCurr?'（現在）':''}`;
    html += `<tr class="${isGoal?'goal-row':''}"><td>${lbl}</td><td>${rm.endBF}%</td><td>${rm.endFat}kg</td><td>${rm.endWeight}kg</td></tr>`;
  }
  html += `</tbody></table><p class="note">TDEE調整モデル（体重1kg減→TDEE約8kcal減）。除脂肪量（筋肉）維持前提。トレーニング日のアフターバーンは含めない保守的試算。</p></div>`;

  html += `<div class="card"><h2>3プラン比較</h2><table class="cmp-table"><thead><tr><th></th><th style="color:#2d6a4f;">A<br>1,930</th><th style="color:#1565c0;">B<br>1,500</th><th style="color:#e65100;">C<br>変動制</th></tr></thead><tbody>
    <tr><td>日平均</td><td>1,930</td><td>1,500</td><td>${DAILY_PLAN_AVG}</td></tr>
    <tr><td>日平均赤字</td><td>-300</td><td>-730</td><td>-${effDeficitPlan}</td></tr>
    <tr><td>月間脂肪減</td><td>-1.2kg</td><td>-3.0kg</td><td>-${effPlanMonthly}kg</td></tr>
    <tr><td>15%到達</td><td>約9ヶ月</td><td>約4ヶ月</td><td>約${effPlanMonths}ヶ月</td></tr>
    <tr><td>筋肉維持</td><td><span class="tag tag-good">◎</span></td><td><span class="tag tag-warn">△</span></td><td><span class="tag tag-good">○</span></td></tr>
    <tr><td>飲み会対応</td><td><span class="tag tag-good">◎</span></td><td><span class="tag tag-bad">✕</span></td><td><span class="tag tag-good">◎</span></td></tr>
    <tr><td>続けやすさ</td><td><span class="tag tag-good">◎</span></td><td><span class="tag tag-warn">△</span></td><td><span class="tag tag-good">○</span></td></tr>
  </tbody></table></div>`;

  html += `<div class="card"><h2 style="color:#e65100;">Plan C 成功ルール（S14更新版）</h2><div style="font-size:0.86em;">
    <p style="margin-bottom:8px;"><strong style="color:#e65100;">1.</strong> 節制日のタンパク質 <strong>${PROTEIN_TARGET}g</strong> が目標。最低<strong>${PROTEIN_MIN}g</strong>は死守（${PROTEIN_MIN}g未満なら1,600kcalまでOK）。</p>
    <p style="margin-bottom:8px;"><strong style="color:#e65100;">2.</strong> 飲食日は <strong>2,200kcal が天井</strong>。ビール1杯→ハイボールに切替。シメのラーメンで帳消し。</p>
    <p style="margin-bottom:8px;"><strong style="color:#e65100;">3.</strong> トレーニング日でもカロリーは増やさない。消費+${TRAIN_BURN}kcal+アフターバーンの「赤字ボーナス」をそのまま活かす。</p>
    <p style="margin-bottom:8px;"><strong style="color:#e65100;">4.</strong> 朝プロテイン <strong>30g</strong>。寝起きは吸収率MAX。ここで稼ぐ。</p>
    <p><strong style="color:#e65100;">5.</strong> 飲み会前にプロテインを飲んでおく。暴食防止＋タンパク質確保。飲食日はP追加不要。</p>
  </div></div>`;

  html += `<div class="rule-card" style="margin-top:14px;border-left-color:#ff6f00;"><h3 style="color:#ff6f00;">📊 Slack実績から得た教訓（6/11分析）</h3>
    <div style="font-size:0.82em;margin-bottom:10px;padding:8px;background:#fff8e1;border-radius:6px;">
      <strong>核心：</strong>普段の日は優秀（4日/10日がstrict成功）。問題は<strong>爆発日が2,200を大幅超過</strong>して、コツコツ貯めた赤字を帳消しにしていること。計画の赤字-430kcal/日に対し、実績は-225kcal/日（約半分）。
    </div>
    <div class="rule-item"><strong style="color:#ff6f00;">教訓1 ― 爆発日を${FREE_HARD_CAP.toLocaleString()}kcalでキャップ</strong><br>会食・出張でも${FREE_HARD_CAP.toLocaleString()}kcalを絶対上限に。3,000超の1日が、strict3日分の赤字を帳消しにする。</div>
    <div class="rule-item"><strong style="color:#ff6f00;">教訓2 ― アルコール${ALCOHOL_CAP}杯ルール</strong><br>ワイン6杯→3杯で約500kcal減。ハイボール6杯→3杯で約300kcal減。「${ALCOHOL_CAP}杯まで」を飲み会前に決める。</div>
    <div class="rule-item"><strong style="color:#ff6f00;">教訓3 ― 会食日の朝昼500kcal作戦</strong><br>会食がある日は朝昼合計500kcal以下に抑える。夜に2,000kcalの枠を確保すれば、フルコースでも${FREE_HARD_CAP.toLocaleString()}以内に収まる。</div>
    <div class="rule-item"><strong style="color:#ff6f00;">教訓4 ― 出張時コンビニP確保</strong><br>台湾でもサラダチキン調達は成功。出張時はコンビニ＋プロテインバーで最低P100gを確保。主食は中華コースより単品選択を。</div>
    <div class="rule-item"><strong style="color:#ff6f00;">教訓5 ― 翌日リカバリー1,300kcal</strong><br>爆発翌日は1,300kcalで帳消し。6/9の会食(3,640kcal)後、6/10は1,740kcalだった → 1,300kcalなら440kcal追加で取り戻せた。</div>
  </div>`;

  html += `</div>`; // end tab-sim

  app.innerHTML = html;
  applyTab(); // 再描画後も選択中のタブを維持

  // Attach body comp handlers
  attachBCHandlers();
  // Attach daily measurement handlers
  attachDMHandlers(dmData);
  // Attach training log handlers
  attachTLHandlers(tlData);
  // Attach meal import handlers
  attachMealHandlers();
  // Attach TDEE/profile handlers
  attachTDEEHandlers();

  // ===================== CHARTS =====================

  // Body Comp chart
  const bcCtx = document.getElementById('bcChart');
  if (bcCtx && bcWithWeight.length >= 2) {
    const bcLabels = bcWithWeight.map(d => {
      const dt = fmtDateShort(d.date);
      const sess = d.session || '';
      return sess ? [sess, dt] : [dt];
    });
    new Chart(bcCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: bcLabels,
        datasets: [
          { label: '体重(kg)', data: bcWithWeight.map(d=>d.weight), borderColor: '#1565c0', backgroundColor: 'rgba(21,101,192,0.08)', fill: true, tension: 0.3, pointRadius: 3, borderWidth: 2, yAxisID: 'y' },
          { label: '体脂肪率(%)', data: bcWithWeight.map(d=>d.fatPct), borderColor: '#e65100', borderDash: [5,3], tension: 0.3, pointRadius: 3, borderWidth: 2, fill: false, yAxisID: 'y1' },
          { label: '体脂肪量(kg)', data: bcWithWeight.map(d=>d.fatMass), borderColor: '#c62828', backgroundColor: 'rgba(198,40,40,0.08)', tension: 0.3, pointRadius: 3, borderWidth: 2.5, fill: true, yAxisID: 'y2' },
          { label: `体脂肪量 最小値(${FAT_MIN}kg)`, data: Array(bcWithWeight.length).fill(FAT_MIN), borderColor: '#e53935', borderDash: [4,3], pointRadius: 0, borderWidth: 1.5, fill: false, yAxisID: 'y2' },
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, usePointStyle: true, padding: 8 } } },
        scales: {
          y: { type: 'linear', position: 'left', min: 67, max: 76, title: { display: true, text: '体重 kg', font: { size: 9 } }, ticks: { font: { size: 8 } } },
          y1: { type: 'linear', position: 'right', min: 22, max: 33, grid: { drawOnChartArea: false }, title: { display: true, text: '体脂肪率 %', font: { size: 9 } }, ticks: { font: { size: 8 } } },
          y2: { type: 'linear', position: 'right', min: 16, max: 24, grid: { drawOnChartArea: false }, title: { display: true, text: '体脂肪量 kg', font: { size: 9, weight: 'bold' }, color: '#c62828' }, ticks: { font: { size: 8 }, color: '#c62828' } },
          x: { ticks: { font: { size: 7 }, maxRotation: 0, autoSkip: false } }
        }
      }
    });
  }

  // Recomp scorecard scatter (赤字 × タンパク質)
  const recompCtx = document.getElementById('recompChart');
  if (recompCtx) {
    const ptColor = (def, p) => {
      if (def < 0) return '#c62828';                 // 溢れ（カロリー超過）
      if (p < PROTEIN_MIN) return '#e65100';         // P不足（筋肉リスク）
      if (def >= 300 && def <= 500 && p >= PROTEIN_TARGET) return '#1b5e20'; // 理想ゾーン
      return '#43a047';                              // 適合
    };
    const pts = all.filter(d => d.protein != null).map(d => ({ x: dayDef(d), y: d.protein, date: d.date, kcal: d.kcal }));
    const zonePlugin = { id: 'recompZone', beforeDatasetsDraw(chart) {
      const { ctx, chartArea: ca, scales: { x, y } } = chart;
      const cx = (v) => Math.max(ca.left, Math.min(ca.right, x.getPixelForValue(v)));
      const cy = (v) => Math.max(ca.top, Math.min(ca.bottom, y.getPixelForValue(v)));
      ctx.save();
      // スイートゾーン：赤字300〜500 × P140以上
      ctx.fillStyle = 'rgba(27,94,32,0.13)';
      ctx.fillRect(cx(300), ca.top, cx(500) - cx(300), cy(PROTEIN_TARGET) - ca.top);
      // 許容帯：赤字200〜600（薄）
      ctx.fillStyle = 'rgba(67,160,71,0.05)';
      ctx.fillRect(cx(200), ca.top, cx(600) - cx(200), ca.bottom - ca.top);
      // 基準線
      ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
      const hline = (v, col) => { const py = y.getPixelForValue(v); if (py >= ca.top && py <= ca.bottom) { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(ca.left, py); ctx.lineTo(ca.right, py); ctx.stroke(); } };
      const vline = (v, col) => { const px = x.getPixelForValue(v); if (px >= ca.left && px <= ca.right) { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(px, ca.top); ctx.lineTo(px, ca.bottom); ctx.stroke(); } };
      hline(PROTEIN_MIN, '#e65100'); hline(PROTEIN_TARGET, '#1b5e20'); vline(0, '#c62828'); vline(RECOMP_DEFICIT, '#6c5ce7');
      ctx.restore();
    }};
    new Chart(recompCtx.getContext('2d'), {
      type: 'scatter',
      data: { datasets: [{ data: pts, pointRadius: 5, pointHoverRadius: 7, backgroundColor: pts.map(p => ptColor(p.x, p.y) + 'cc'), borderColor: pts.map(p => ptColor(p.x, p.y)), borderWidth: 1 }] },
      plugins: [zonePlugin],
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: c => { const p = c.raw; const dt = new Date(p.date + 'T12:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}: ${p.x >= 0 ? '赤字-' : '超過+'}${Math.abs(Math.round(p.x))} / P${Math.round(p.y)}g / ${p.kcal.toLocaleString()}kcal`; } } } },
        scales: {
          x: { title: { display: true, text: '日次赤字 (kcal)  ←溢れ ｜ 赤字大→', font: { size: 10 } }, min: -1900, max: 1200, ticks: { font: { size: 9 } } },
          y: { title: { display: true, text: 'タンパク質 (g)', font: { size: 10 } }, min: 0, max: 220, ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  // Gap chart
  const gapCtx2 = document.getElementById('gapChart');
  if (gapCtx2) {
    const labels = last7.map(d=>{const dt=new Date(d.date+'T12:00:00');return `${dt.getMonth()+1}/${dt.getDate()}`;});
    new Chart(gapCtx2.getContext('2d'), {
      type:'bar', data:{ labels, datasets:[
        {label:'実績',data:last7.map(d=>d.kcal),backgroundColor:last7.map(d=>{const t=classify(d);return t==='over'?'rgba(198,40,40,0.7)':t==='free'?'rgba(230,81,0,0.65)':'rgba(21,101,192,0.65)';}),borderRadius:6,borderSkipped:false,order:2},
        {label:'計画平均',data:Array(last7.length).fill(DAILY_PLAN_AVG),type:'line',borderColor:'#6c5ce7',borderDash:[6,4],pointRadius:0,borderWidth:2,fill:false,order:1},
      ]},
      plugins:[{id:'lines',afterDraw(chart){const c=chart.ctx,y=chart.scales.y,x=chart.scales.x;c.save();c.setLineDash([4,3]);c.lineWidth=1;[{v:STRICT,col:'#90caf9',lbl:'1,500'},{v:FREE,col:'#ffcc80',lbl:'2,200'}].forEach(l=>{const py=y.getPixelForValue(l.v);c.strokeStyle=l.col;c.beginPath();c.moveTo(x.left,py);c.lineTo(x.right,py);c.stroke();c.fillStyle=l.col;c.font='9px sans-serif';c.fillText(l.lbl,x.right-28,py-3);});c.restore();}}],
      options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true,padding:10}},tooltip:{callbacks:{label:c=>c.dataset.label+': '+c.parsed.y.toLocaleString()+' kcal'}}},scales:{y:{min:0,max:Math.max(4500,...last7.map(d=>d.kcal))+300,ticks:{font:{size:9},callback:v=>v.toLocaleString()}},x:{ticks:{font:{size:9}}}}}
    });
  }

  // Week chart with calendar annotations (period-filterable)
  let weekChartInstance = null;
  function drawWeekChart(periodDays) {
    const wkCtx = document.getElementById('weekChart');
    if (!wkCtx) return;
    let wkData = all;
    if (periodDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodDays);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      wkData = all.filter(d => d.date >= cutoffStr);
    }
    if (wkData.length === 0) wkData = all;
    if (weekChartInstance) weekChartInstance.destroy();
    const wkTgtPlugin = {id:'tgtLines',afterDraw(chart){const c=chart.ctx,y=chart.scales.y,x=chart.scales.x;c.save();c.setLineDash([5,3]);c.lineWidth=1.5;[{v:STRICT,col:'#1565c0'},{v:FREE,col:'#e65100'}].forEach(l=>{const py=y.getPixelForValue(l.v);c.strokeStyle=l.col;c.beginPath();c.moveTo(x.left,py);c.lineTo(x.right,py);c.stroke();});c.restore();}};
    const wkCalAnnotPlugin = {id:'calAnnot',afterDraw(chart){
      if (!calMap || !Object.keys(calMap).length) return;
      const ctx2 = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      ctx2.save();
      wkData.forEach((d, i) => {
        if (classify(d) !== 'over') return;
        const ann = calMap[d.date];
        if (!ann) return;
        const bar = meta.data[i];
        if (!bar) return;
        const x = bar.x;
        const y = bar.y - 4;
        const text = ann.short;
        ctx2.font = 'bold 8px sans-serif';
        const tw = ctx2.measureText(text).width;
        // Background pill
        ctx2.fillStyle = 'rgba(198,40,40,0.13)';
        const px = 3, py2 = 2, rh = 13;
        ctx2.beginPath();
        const rx = x - tw/2 - px, ry = y - rh + py2, rw = tw + px*2;
        ctx2.moveTo(rx+3, ry); ctx2.lineTo(rx+rw-3, ry); ctx2.quadraticCurveTo(rx+rw, ry, rx+rw, ry+3);
        ctx2.lineTo(rx+rw, ry+rh-3); ctx2.quadraticCurveTo(rx+rw, ry+rh, rx+rw-3, ry+rh);
        ctx2.lineTo(rx+3, ry+rh); ctx2.quadraticCurveTo(rx, ry+rh, rx, ry+rh-3);
        ctx2.lineTo(rx, ry+3); ctx2.quadraticCurveTo(rx, ry, rx+3, ry);
        ctx2.fill();
        // Text
        ctx2.fillStyle = '#c62828';
        ctx2.textAlign = 'center';
        ctx2.textBaseline = 'bottom';
        ctx2.fillText(text, x, y);
      });
      ctx2.restore();
    }};
    const DOW = ['日','月','火','水','木','金','土'];
    weekChartInstance = new Chart(wkCtx.getContext('2d'), {
      type:'bar',
      data:{labels:wkData.map(d=>{const dt=new Date(d.date+'T12:00:00');return `${dt.getMonth()+1}/${dt.getDate()}`;}),datasets:[{data:wkData.map(d=>d.kcal),backgroundColor:wkData.map(d=>{const t=classify(d);return t==='over'?'rgba(198,40,40,0.7)':t==='free'?'rgba(230,81,0,0.65)':'rgba(21,101,192,0.65)';}),borderRadius:4,borderSkipped:false}]},
      plugins:[wkTgtPlugin, wkCalAnnotPlugin],
      options:{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{
        title:function(items){const idx=items[0].dataIndex;const d=wkData[idx];const dt=new Date(d.date+'T12:00:00');return `${dt.getMonth()+1}/${dt.getDate()} (${DOW[dt.getDay()]})`;},
        afterTitle:function(items){const idx=items[0].dataIndex;const d=wkData[idx];if(calMap&&calMap[d.date])return '📅 '+calMap[d.date].full.replace(/\n/g, ', ');return '';},
        label:function(item){return item.parsed.y.toLocaleString()+' kcal';}
      }}},scales:{y:{min:0,max:Math.max(4500,...wkData.map(d=>d.kcal))+300,ticks:{font:{size:9},callback:v=>v.toLocaleString()}},x:{ticks:{font:{size:8}}}}}
    });
  }
  if (document.getElementById('weekChart')) {
    drawWeekChart(0);
    const wkPBtns = document.querySelectorAll('#wk-period-filter button');
    wkPBtns.forEach(btn => {
      btn.onclick = () => {
        wkPBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        drawWeekChart(parseInt(btn.dataset.period));
      };
    });
  }

  // Protein chart (period-filterable)
  let proteinChartInstance = null;
  function drawProteinChart(periodDays) {
    const protCtx = document.getElementById('proteinChart');
    if (!protCtx || pAll.length < 3) return;
    let pData = pAll;
    if (periodDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodDays);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      pData = pAll.filter(d => d.date >= cutoffStr);
    }
    if (pData.length === 0) pData = pAll;
    if (proteinChartInstance) proteinChartInstance.destroy();
    proteinChartInstance = new Chart(protCtx.getContext('2d'), {
      type:'bar', data:{labels:pData.map(d=>{const dt=new Date(d.date+'T12:00:00');return `${dt.getMonth()+1}/${dt.getDate()}`;}),datasets:[
        {label:'タンパク質(g)',data:pData.map(d=>Math.round(d.protein)),backgroundColor:pData.map(d=>d.protein>=PROTEIN_TARGET?'rgba(67,160,71,0.7)':d.protein>=PROTEIN_MIN?'rgba(255,179,0,0.7)':'rgba(229,57,53,0.7)'),borderRadius:4,borderSkipped:false},
        {label:`目標 ${PROTEIN_TARGET}g`,data:Array(pData.length).fill(PROTEIN_TARGET),type:'line',borderColor:'#2d6a4f',borderDash:[6,4],pointRadius:0,borderWidth:2,fill:false},
        {label:`最低ライン ${PROTEIN_MIN}g`,data:Array(pData.length).fill(PROTEIN_MIN),type:'line',borderColor:'#e65100',borderDash:[4,3],pointRadius:0,borderWidth:2,fill:false},
      ]},
      options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{size:9},usePointStyle:true,padding:8}},tooltip:{callbacks:{label:c=>c.dataset.label+': '+c.parsed.y+'g'}}},scales:{y:{min:0,max:200,ticks:{font:{size:9}}},x:{ticks:{font:{size:8}}}}}
    });
  }
  if (document.getElementById('proteinChart')) {
    drawProteinChart(0);
    const protPBtns = document.querySelectorAll('#prot-period-filter button');
    protPBtns.forEach(btn => {
      btn.onclick = () => {
        protPBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        drawProteinChart(parseInt(btn.dataset.period));
      };
    });
  }

  // PFC donut
  const pfcEl = document.getElementById('pfcChart');
  if (pfcEl && pD.length) {
    const ap=pD.reduce((s,d)=>s+d.protein,0)/pD.length;
    const af=pD.filter(d=>d.fat).length?pD.filter(d=>d.fat).reduce((s,d)=>s+(d.fat||0),0)/pD.filter(d=>d.fat).length:0;
    const ac=pD.filter(d=>d.carb).length?pD.filter(d=>d.carb).reduce((s,d)=>s+(d.carb||0),0)/pD.filter(d=>d.carb).length:0;
    new Chart(pfcEl.getContext('2d'), {
      type:'doughnut',data:{labels:[`P:${Math.round(ap)}g`,`F:${Math.round(af)}g`,`C:${Math.round(ac)}g`],datasets:[{data:[ap*4,af*9,ac*4],backgroundColor:['#e63946','#f4a261','#457b9d'],borderWidth:2,borderColor:'#fff'}]},
      options:{responsive:true,cutout:'55%',plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true,padding:10}}}}
    });
  }

  // Simulation chart
  const simCtx = document.getElementById('simChart');
  if (simCtx) {
    const mo=['6月','7月','8月','9月','10月','11月','12月','1月','2月','3月'];
    const pA=[25.7,24.4,23.1,21.8,20.5,19.2,17.9,16.6,15.3,14.0];
    const pB=[25.7,22.4,19.0,15.4,11.5,8.0,8.0,8.0,8.0,8.0];
    const pC=[25.7,23.7,21.7,19.7,17.6,15.5,13.4,11.3,9.3,8.0];
    new Chart(simCtx.getContext('2d'), {
      type:'line',data:{labels:mo,datasets:[
        {label:'Plan A（1,930均一）',data:pA,borderColor:'#2d6a4f',fill:false,tension:0.3,pointRadius:3,borderWidth:2},
        {label:'Plan B（1,500均一）',data:pB,borderColor:'#1565c0',fill:false,tension:0.3,pointRadius:3,borderWidth:2},
        {label:'Plan C（1,500/2,200変動）',data:pC,borderColor:'#e65100',backgroundColor:'rgba(230,81,0,0.06)',fill:true,tension:0.3,pointRadius:4,borderWidth:3},
        {label:'目標 15%',data:Array(mo.length).fill(15),borderColor:'#e63946',borderDash:[6,4],pointRadius:0,borderWidth:1.5,fill:false},
      ]},
      options:{responsive:true,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{font:{size:9},usePointStyle:true,padding:8}}},scales:{y:{min:12,max:27,ticks:{font:{size:9}}},x:{ticks:{font:{size:9}}}}}
    });
  }

}

// === INIT ===
// 食事データは localStorage に保存しつつ、GitHub Actions が Slack から生成する
// data/meals.json を起動時に取り込んでマージする（手動取り込みも併用可）。
async function loadServerMeals() {
  try {
    const res = await fetch('data/meals.json', { cache: 'no-store' });
    if (!res.ok) return; // 未生成（404）なら無視。手動取り込みは引き続き利用可
    const arr = await res.json();
    if (Array.isArray(arr) && arr.length) mergeMeals(arr); // 同一日付は最新で上書き
  } catch (e) { /* file:// やオフライン時は無視 */ }
}
// data/seed_daily.json（Tanita日次計測）を取り込み、未登録の日付だけ localStorage に追加。
// 端末で入力済みの日は上書きしない（編集を保持）。今後の日次追加は seed_daily.json の更新だけでOK。
async function loadServerDaily() {
  try {
    const res = await fetch('data/seed_daily.json', { cache: 'no-store' });
    if (!res.ok) return;
    const arr = await res.json();
    if (!Array.isArray(arr) || !arr.length) return;
    let stored = [];
    try { const raw = localStorage.getItem(DM_KEY); if (raw) stored = JSON.parse(raw) || []; } catch (e) {}
    const byDate = {};
    for (const d of stored) byDate[d.date] = d;
    for (const d of arr) if (!byDate[d.date]) byDate[d.date] = d; // 未登録の日付だけ追加
    const merged = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(DM_KEY, JSON.stringify(merged));
  } catch (e) { /* file:// やオフライン時は無視 */ }
}
// data/calendar.json（Googleカレンダーを分類した予定マップ）を読み込み、calMap として保存。
// 形式: { "YYYY-MM-DD": { short, full } }。会食/出張などの「その日の性質」をGAP分析で使う。
async function loadServerCalendar() {
  try {
    const res = await fetch('data/calendar.json', { cache: 'no-store' });
    if (!res.ok) return;
    const map = await res.json();
    if (map && typeof map === 'object') localStorage.setItem('calGuide_calMap', JSON.stringify(map));
  } catch (e) { /* file:// やオフライン時は無視 */ }
}
function rerender() {
  try {
    const meals = enrichMealsPFC(loadMeals());
    let calMap = {};
    try { const raw = localStorage.getItem('calGuide_calMap'); if (raw) calMap = JSON.parse(raw) || {}; } catch(e) {}
    render(meals, calMap);
  } catch(e) {
    document.getElementById('app').innerHTML = `<div class="card" style="border-left:4px solid #c62828;"><h2 style="color:#c62828;">エラー</h2><p style="font-size:0.85em;">${e.message||e}</p></div>`;
    console.error(e);
  }
}
// 自動同期データ(meals/calendar)の「最終更新時刻」をGitHub APIから取得（GitHub Pagesでのみ・公開APIで認証不要）。
let syncStatus = {};
async function loadSyncStatus() {
  try {
    const host = location.hostname;
    if (!host.endsWith('github.io')) return; // ローカル/その他では表示しない
    const owner = host.split('.')[0], repo = host;
    const commitDate = async (path) => {
      try {
        const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?path=${path}&per_page=1`, { cache: 'no-store' });
        if (!r.ok) return null;
        const j = await r.json();
        return (j && j[0] && j[0].commit && j[0].commit.committer && j[0].commit.committer.date) || null;
      } catch (e) { return null; }
    };
    const [meals, calendar] = await Promise.all([commitDate('data/meals.json'), commitDate('data/calendar.json')]);
    syncStatus = { meals, calendar };
  } catch (e) { /* 失敗時は表示しないだけ */ }
}
async function init() {
  await loadServerMeals();
  await loadServerDaily();
  await loadServerCalendar();
  rerender();
  // 同期ステータスは後追いで取得し、取れたら再描画（初回表示をブロックしない）
  await loadSyncStatus();
  if (syncStatus.meals || syncStatus.calendar) rerender();
}
init();
