# runwith2

ランニングのマッチングアプリ（近くのグループランをペースで探す／地図からセッションを作る）。

## 技術構成
- React 18 + TypeScript + Vite 5、Tailwind CSS
- 地図: Leaflet / react-leaflet（OpenStreetMap、APIキー不要）
- バックエンド: Firebase（Authentication: Google サインイン、Firestore、Hosting）
- `src/lib/supabase.ts` は旧実装の名残。新しいコードでは使わない

## コマンド
- 開発サーバー: `npm run dev`
- ビルド（型チェック込み）: `npm run build`
- Lint: `npm run lint`
- テストランナーは未導入（`npm test` は存在しない）

## ディレクトリ
- `src/components/` 画面（screens）・カード（cards）・セッション関連（sessions）・共通部品（common）
- `src/lib/` Firebase 初期化（firebase.ts）、データアクセス（sessions.ts, notifications.ts）、認証（authContext.ts）、geohash（geo.ts）
- `src/utils/` ペースマッチング（matching.ts）、表示用フォーマット（formatters.ts）
- `src/i18n/` 多言語文字列（strings.ts）。UI 文言を追加・変更したら全言語分を更新する
- `src/types/index.ts` 共通の型定義
- Firestore のデータ構造は README.md の表を参照。構造を変えたら `firestore.rules` も合わせて更新する

## コーディング方針
- 既存の型定義を壊さない。`any` で逃げない
- 周囲のコードの命名・書き方に合わせる
- `.env` は読まない・書かない・コミットしない（設定値は `.env.example` を参照）
- `npm run deploy` や `firebase deploy` は勝手に実行しない

## 完了条件
- 変更後は必ず `npm run build` と `npm run lint` を実行し、両方成功することを確認してから終了する
