# 🛩️ Sky Fighter TypeScript

TypeScriptで開発された本格的な横スクロール飛行機シューティングゲーム

![Game Preview](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Game Status](https://img.shields.io/badge/Status-Playable-brightgreen?style=for-the-badge)

## 🎮 ゲーム概要

3つのステージからなる本格的なボス戦型シューティングゲーム。各ステージには個性的なボスが待ち受け、様々なパワーアップアイテムを駆使して勝利を目指します。

### ✨ 主な機能

- **🏟️ 3ステージ制**: 各ステージに異なるボスが登場
- **🎯 多彩な武器システム**: 通常弾、ダブルショット、トリプルショット
- **⚡ パワーアップアイテム**: 8種類の特殊アイテム
- **🛡️ 時限バフシステム**: シールド、ビーム、スピードアップなど
- **🏆 ランキング機能**: ハイスコアの保存・表示
- **💾 データ永続化**: localStorage を使用したスコア保存

## 🎯 ゲームの遊び方

### 基本操作
- **移動**: `WASD` キーまたは矢印キー
- **攻撃**: `Space` キー
- **スコア保存**: ゲームオーバー時に `Enter` キー

### パワーアップアイテム
| アイテム | 効果 | 持続時間 |
|---------|------|----------|
| 🛡️ | シールド - 敵との衝突を無効化 | 5秒 |
| ⚡ | ビーム - 太い光線攻撃 | 5秒 |
| 🚀 | スピード - 移動速度2倍 | 5秒 |
| 🔥 | 高速射撃 - 射撃間隔1/3 | 5秒 |
| 💖 | ライフ - ライフを1つ回復 | 即時 |
| 💣 | ボム - 画面上の全敵を破壊 | 即時 |
| **2** | ダブルショット - 2発同時射撃 | 永続 |
| **3** | トリプルショット - 3方向射撃 | 永続 |

### ボス情報
1. **🚁 アーマードヘリ** (ステージ1)
   - HP: 150 / 単発攻撃 / 縦移動パターン

2. **🛸 エイリアンクルーザー** (ステージ2)
   - HP: 200 / 3方向攻撃 / 円運動パターン

3. **🐲 メカドラゴン** (ステージ3)
   - HP: 250 / 5方向拡散攻撃 / 複雑移動パターン

## 🚀 セットアップ・起動方法

### 必要な環境
- Node.js (v14 以上)
- Python 3.x (ローカルサーバー用)

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd sky-fighter-typescript
```

2. **依存関係のインストール**
```bash
npm install
```

3. **TypeScriptのコンパイル**
```bash
npm run build
```

4. **ローカルサーバーの起動**
```bash
npm run serve
```

5. **ブラウザでアクセス**
```
http://localhost:8000
```

### 開発時

**ホットリロード (TypeScript 監視)**
```bash
npm run watch
```

**開発サーバー (コンパイル + サーバー)**
```bash
npm run dev
```

## 📁 プロジェクト構造

```
sky-fighter-typescript/
├── src/                    # TypeScript ソースコード
│   ├── main.ts            # メインゲームクラス
│   ├── player.ts          # プレイヤークラス
│   ├── enemies.ts         # 敵・ボスクラス
│   ├── bullets.ts         # 弾丸クラス
│   ├── powerups.ts        # パワーアップアイテム
│   ├── ranking.ts         # ランキング管理
│   ├── utils.ts           # 共通ユーティリティ
│   └── types.ts           # 型定義
├── dist/                   # コンパイル済みJavaScript
├── index.html             # メインHTMLファイル
├── styles.css             # スタイルシート
├── package.json           # プロジェクト設定
├── tsconfig.json          # TypeScript設定
└── README.md              # このファイル
```

## 🛠️ 技術スタック

- **言語**: TypeScript
- **レンダリング**: HTML5 Canvas 2D API
- **モジュールシステム**: ES6 Modules
- **データ保存**: localStorage
- **開発環境**: Node.js + Python HTTP Server

## 🎯 スコアリング

- 敵撃破: **100点**
- ボス撃破: **1000点 × ステージ数**
- パワーアップ取得: **50点**
- 全ステージクリア: **5000点ボーナス**

## 🏆 ランキング機能

- 上位10位まで記録
- 名前、スコア、日付を保存
- ブラウザ間でデータ共有（localStorage）
- ランキングクリア機能付き

## 🔧 利用可能なコマンド

```bash
npm run build      # TypeScriptコンパイル
npm run watch      # ファイル監視モード
npm run dev        # 開発サーバー起動
npm run serve      # 本番サーバー起動
npm run clean      # ビルドファイル削除
```

## 🎨 カスタマイズ

### ゲーム設定の変更
`src/utils.ts` の `GAME_CONFIG` でゲームバランスを調整できます：

```typescript
export const GAME_CONFIG = {
    canvas: { width: 1200, height: 800 },
    player: { baseSpeed: 5, baseFireRate: 10 },
    stages: { total: 3, enemiesNeededForBoss: 15 },
    ranking: { maxEntries: 10 }
}
```

### 新しいパワーアップの追加
1. `src/types.ts` に新しい `PowerUpType` を追加
2. `src/powerups.ts` にアイコンと色を定義
3. `src/main.ts` の `activatePowerUp` に効果を実装

## 🐛 既知の問題

- Safari での一部エフェクトの表示問題
- モバイルデバイスでのタッチ操作未対応

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエスト、イシューの報告を歓迎します！

---

**🎮 Have Fun Playing! 🎮** 