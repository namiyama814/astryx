export type Status = 'todo' | 'progress' | 'done';
export type Task = {id: string; title: string; detail: string; status: Status; priority: string; category: string; date: string; owner: string};
export const seed: Task[] = [
 {id:'1',title:'ブランドの方向性をまとめる',detail:'ムードボードとブランドキーワードを整理する',status:'done',priority:'高',category:'デザイン',date:'2026-11-10',owner:'田中'},
 {id:'2',title:'ホーム画面のワイヤーフレーム',detail:'主要な導線と情報の優先順位を決める',status:'progress',priority:'高',category:'デザイン',date:'2026-11-12',owner:'佐藤'},
 {id:'3',title:'デザイントークンを整備する',detail:'色・余白・タイポグラフィを定義する',status:'progress',priority:'中',category:'開発',date:'2026-11-13',owner:'田中'},
 {id:'4',title:'ユーザーインタビューを準備',detail:'質問項目とヒアリングシートを作成する',status:'todo',priority:'中',category:'リサーチ',date:'2026-11-14',owner:'鈴木'},
 {id:'5',title:'コンポーネントの動作確認',detail:'キーボード操作とモバイル表示を確認する',status:'todo',priority:'低',category:'開発',date:'2026-11-16',owner:'佐藤'},
 {id:'6',title:'プロジェクトのキックオフ',detail:'スコープとマイルストーンを共有する',status:'done',priority:'高',category:'企画',date:'2026-11-09',owner:'鈴木'},
 {id:'7',title:'アイコンのスタイルを選定',detail:'画面全体のトーンに合うアイコンを選ぶ',status:'done',priority:'低',category:'デザイン',date:'2026-11-10',owner:'田中'},
 {id:'8',title:'プロトタイプを共有する',detail:'チームからフィードバックを集める',status:'todo',priority:'中',category:'企画',date:'2026-11-18',owner:'鈴木'},
];
export const statusNames = {todo:'未着手',progress:'進行中',done:'完了'};
export const statusColors = {todo:'neutral',progress:'warning',done:'success'} as const;
export const categoryColors = {'デザイン':'purple','開発':'blue','リサーチ':'orange','企画':'teal'} as const;
export function stored<T,>(key:string, fallback:T):T {try {const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback;} catch {return fallback;}}
