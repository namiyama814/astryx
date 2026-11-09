# Astryx タスクアプリ

[Astryx](https://github.com/meta/astryx) の公式 `table` テンプレートを基準にしたReact 19 / TypeScript / Viteアプリです。

独自のブランドやコンポーネントスタイルは追加していません。CSSはページの高さ、bodyの余白リセット、テーマ標準フォントの指定だけです。

## 起動

```sh
npm install
npm run dev
```

## 構成

- 公式 `AppShell` / `TopNav` に `Layout` / `LayoutHeader` / `LayoutContent` / `LayoutFooter` を配置
- 公式テンプレートと同じ `Table` / `TableColumn` にタスクデータを表示
- `HStack` / `VStack` / `Grid` で余白と可変幅レイアウトを構成
- `Heading` / `Text` / `Badge` / `Avatar` で情報を表示
- `Dialog` / `DialogHeader` と標準フォーム部品でタスク編集
- `TextInput` / `TextArea` / `DateInput` / `Selector` / `CheckboxInput` を使用
- `TabList` / `SegmentedControl` でフィルタと表示切り替え
- `Card` でボード表示、`ProgressBar` で完了率、`Toast` で通知と削除取り消し
- ヘッダーの「外観」で公式Neutral / Matcha / Butterとダークモードを変更

初期テーマはNeutral。タスクと外観はlocalStorageに保存します。前バージョンのタスクも引き継ぎます。サーバー同期はありません。

## 検証

```sh
npm run build
npx playwright install chromium
npm test
```

既存ブラウザを使う場合は `PLAYWRIGHT_EXECUTABLE_PATH` を指定できます。

## 公式リファレンス

```sh
npm run astryx -- template table
npm run astryx -- component Table
npm run astryx -- component Layout
```
