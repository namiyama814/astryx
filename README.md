# Astryx タスクアプリ

GoogleChrome の [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) を参考に、ブラウザ標準の HTML / CSS / TypeScript で実装したタスクアプリです。Modern Web Guidance はフレームワークではなく、Web プラットフォームの実装ガイド集です。

## 起動

```sh
npm install
npm run dev
```

## 機能

- タスクの追加・編集・削除・削除取り消し
- 状態・優先度・キーワードによる絞り込み
- リスト／ボード表示、完了数と進捗表示
- Neutral / Matcha / Butter の独自配色とダークモード
- localStorage による保存（以前のタスク・外観のキーを継続使用）

サーバー同期や認証はありません。テーマ名は以前の設定との互換用で、Astryx のテーマパッケージには依存しません。

## 構成と採用したガイド

- `src/main.ts`: ネイティブ DOM、イベント、FormData による状態更新
- `src/data.ts`: タスク型、初期データ、保存データ読み込み
- `src/style.css`: CSS レイヤー、Grid、コンテナクエリ、論理プロパティ、テーマ
- `tests/workspace.spec.ts`: Playwright の操作テスト

Modern Web Guidance の `dialog` / `forms` / `css-layout` ガイドを参照しました。

編集・設定画面には `<dialog>` と `showModal()` を採用し、フォーカス制御・Esc キー・背景の操作抑止はブラウザに任せています。フォームには標準入力、必須チェック、ラベルを使用。検索は `<search>`、一覧は `<table>`、進捗は `<progress>` を使用しています。

レイアウトには CSS Grid / Flexbox とコンテナクエリを使用。`field-sizing` は未対応時も通常の textarea として操作でき、アニメーションは `prefers-reduced-motion` に従います。狭い画面では表の領域内だけを横スクロールできます。

## 検証

```sh
npm run build
npx playwright install chromium
npm test
```

既存ブラウザを使う場合は `PLAYWRIGHT_EXECUTABLE_PATH` を指定できます。
