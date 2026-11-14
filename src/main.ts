import {seed, stored, statusNames, type Task, type Status} from './data';
import './style.css';
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let tasks = stored<Task[]>('orbit-tasks-v1', seed);
let editing: string | null = null;
let deleted: {task: Task; index: number} | null = null;
let status = 'all', view = 'list';
const options = (values: string[]) => values.map(v => `<option>${escape(v)}</option>`).join('');
$('#root').innerHTML = `
<a class="skip" href="#tasks">タスク一覧へ</a>
<header class="topbar"><a class="brand" href="./"><span class="brand-icon">a</span>Astryx</a><button id="appearance">外観</button></header>
<main><header class="page-heading"><div><p class="eyebrow">WORKSPACE</p><h1>タスク</h1></div><button class="primary" id="add"><span aria-hidden="true">＋ </span>タスクを追加</button></header>
<div class="summary"><span id="summary"></span><progress id="progress" aria-label="プロジェクトの進捗"></progress><span id="percent"></span></div>
<fieldset class="tabs"><legend class="sr-only">タスクの状態</legend>${[['all','すべて'],...Object.entries(statusNames)].map(([v,l])=>`<label><input type="radio" name="status-filter" value="${v}" ${v==='all'?'checked':''}><span>${l}</span></label>`).join('')}</fieldset>
<div class="toolbar"><search><label class="search-label">タスクを検索<input id="query" type="search" placeholder="タスク名・メモ・担当者" autocapitalize="none" spellcheck="false"></label><label>優先度<select id="priority"><option value="all">すべての優先度</option>${options(['高','中','低'])}</select></label></search>
<fieldset class="segments"><legend class="sr-only">表示形式</legend><label><input type="radio" name="view" value="list" checked><span>リスト</span></label><label><input type="radio" name="view" value="board"><span>ボード</span></label></fieldset></div>
<section id="tasks" tabindex="-1" aria-label="タスク一覧"></section><footer><span id="count" role="status"></span><span>Astryx Workspace</span></footer></main>
<dialog id="editor" aria-labelledby="editor-title"><form id="task-form"><header class="dialog-header"><h2 id="editor-title">タスクを追加</h2><button type="button" data-close aria-label="閉じる">×</button></header><div class="fields"><label>タスク名 <small>必須</small><input name="title" required autofocus maxlength="300"></label><label>メモ<textarea name="detail" rows="3"></textarea></label><div class="form-grid"><label>ステータス<select name="status">${Object.entries(statusNames).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label>優先度<select name="priority">${options(['高','中','低'])}</select></label><label>カテゴリ<select name="category">${options(['デザイン','開発','リサーチ','企画'])}</select></label><label>担当<select name="owner">${options(['田中','佐藤','鈴木'])}</select></label><label>期限<input type="date" name="date"></label></div></div><footer class="dialog-footer"><button type="button" id="delete" class="danger">タスクを削除</button><div><button type="button" data-close>キャンセル</button><button type="submit" class="primary" id="save">タスクを追加</button></div></footer></form></dialog>
<dialog id="settings" aria-labelledby="settings-title"><header class="dialog-header"><h2 id="settings-title">外観</h2><button type="button" data-close aria-label="閉じる">×</button></header><div class="fields"><label>テーマ<select id="theme"><option value="neutral">Neutral</option><option value="matcha">Matcha</option><option value="butter">Butter</option></select></label><label class="check"><input id="dark" type="checkbox" role="switch">ダークモード</label></div></dialog>
<div id="notification" class="toast" hidden><span role="status" id="message"></span><button id="undo" hidden>元に戻す</button><button id="dismiss" aria-label="通知を閉じる">×</button></div>`;
function notify(message: string, undo = false) { $('#message').textContent = message; $('#undo').hidden = !undo; $('#notification').hidden = false; }
function persist() { try {localStorage.setItem('orbit-tasks-v1', JSON.stringify(tasks));} catch {notify('タスクを保存できませんでした');} render(); }
function badge(t: Task) {return `<span class="badge ${t.status}">${statusNames[t.status]}</span>`;}
function actions(t: Task) {return `<button class="edit" data-edit="${escape(t.id)}" aria-label="${escape(t.title)}を編集">編集</button>`;}
function checkbox(t: Task) {return `<input type="checkbox" data-toggle="${escape(t.id)}" aria-label="${escape(t.title)}を完了" ${t.status==='done'?'checked':''}>`;}
function render() {
 const q = $('#query') as HTMLInputElement, p = $('#priority') as HTMLSelectElement;
 const filtered = tasks.filter(t => (status==='all'||t.status===status)&&(p.value==='all'||p.value===t.priority)&&`${t.title} ${t.detail} ${t.category} ${t.owner}`.toLowerCase().includes(q.value.toLowerCase()));
 const done = tasks.filter(t=>t.status==='done').length;
 $('#summary').textContent = `${done} / ${tasks.length} タスクが完了`;
 const progress = $<HTMLProgressElement>('#progress'); progress.max=tasks.length||1; progress.value=done;
 $('#percent').textContent = `${tasks.length?Math.round(done/tasks.length*100):0}%`;
 $('#count').textContent = `${filtered.length}件のタスク`;
 if (!filtered.length) {$('#tasks').innerHTML='<div class="empty"><button id="clear">条件をクリア</button></div>';return;}
 $('#tasks').innerHTML = view==='list' ? `<div class="table-scroll" tabindex="0" aria-label="タスク表"><table><caption class="sr-only">タスク一覧</caption><thead><tr>${['完了','タスク名','ステータス','優先度','カテゴリ','期限','担当','編集'].map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${filtered.map(t=>`<tr><td>${checkbox(t)}</td><td class="task-title"><strong>${escape(t.title)}</strong><p>${escape(t.detail)}</p></td><td>${badge(t)}</td><td><span class="priority" data-priority="${escape(t.priority)}">${escape(t.priority)}</span></td><td>${escape(t.category)}</td><td><time datetime="${escape(t.date)}">${escape(t.date.slice(5).replace('-','/')||'未設定')}</time></td><td><span class="avatar">${escape(t.owner)}</span></td><td>${actions(t)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="board">${(Object.keys(statusNames) as Status[]).map(s=>`<section class="board-column" data-testid="board-column"><h2>${statusNames[s]} <span>${filtered.filter(t=>t.status===s).length}</span></h2>${filtered.filter(t=>t.status===s).map(t=>`<article class="card" data-testid="task-card"><header><span class="badge">${escape(t.category)}</span>${actions(t)}</header><h3>${escape(t.title)}</h3><p>${escape(t.detail)}</p><label class="check">${checkbox(t)}完了</label><footer><time>${escape(t.date)}</time><span class="avatar">${escape(t.owner)}</span></footer></article>`).join('')}</section>`).join('')}</div>`;
}
function edit(id: string|null = null) {
 editing=id; const t = tasks.find(t=>t.id===id);
 const today = new Date(); const date = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 const data = t || {title:'',detail:'',status:'todo',priority:'中',category:'デザイン',owner:'田中',date};
 const form=$<HTMLFormElement>('#task-form'); form.reset();
 for(const [key,value] of Object.entries(data)) { const field=form.elements.namedItem(key); if(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) field.value=value; }
 $('#editor-title').textContent=t?'タスクを編集':'タスクを追加'; $('#save').textContent=t?'変更を保存':'タスクを追加'; $('#delete').hidden=!t;
 $<HTMLDialogElement>('#editor').showModal();
}
$('#add').addEventListener('click',()=>edit());
$('#appearance').addEventListener('click',()=>$<HTMLDialogElement>('#settings').showModal());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog')!.close()));
$('#query').addEventListener('input',render); $('#priority').addEventListener('change',render);
document.querySelectorAll<HTMLInputElement>('[name="status-filter"], [name="view"]').forEach(input=>input.addEventListener('change',()=>{if(input.name==='view')view=input.value;else status=input.value;render();}));
$('#tasks').addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLElement>('[data-edit], #clear'); if(b?.dataset.edit)edit(b.dataset.edit);if(b?.id==='clear'){ $<HTMLInputElement>('#query').value='';$<HTMLSelectElement>('#priority').value='all';status='all';$<HTMLInputElement>('[name="status-filter"][value="all"]').checked=true;render();}});
$('#tasks').addEventListener('change',e=>{const input=e.target as HTMLInputElement; const t=tasks.find(t=>t.id===input.dataset.toggle);if(t){t.status=input.checked?'done':'todo';persist();}});
$('#task-form').addEventListener('submit',e=>{e.preventDefault();const data = Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)) as Omit<Task,'id'>;if(!data.title.trim()){const field=$<HTMLInputElement>('[name="title"]');field.setCustomValidity('タスク名を入力してください');field.reportValidity();return;} const task={...data,title:data.title.trim(),id:editing||crypto.randomUUID()};tasks=editing?tasks.map(t=>t.id===editing?task:t):[...tasks,task];$<HTMLDialogElement>('#editor').close();persist();notify(editing?'タスクを更新しました':'タスクを追加しました');});
$('[name="title"]').addEventListener('input',e=>(e.target as HTMLInputElement).setCustomValidity(''));
$('#delete').addEventListener('click',()=>{const index=tasks.findIndex(t=>t.id===editing);if(index<0)return;deleted={task:tasks[index],index};tasks.splice(index,1);$<HTMLDialogElement>('#editor').close();persist();notify('タスクを削除しました',true);});
$('#undo').addEventListener('click',()=>{if(deleted&&!tasks.some(t=>t.id===deleted!.task.id)){tasks.splice(deleted.index,0,deleted.task);persist();}deleted=null;notify('タスクを元に戻しました');});
$('#dismiss').addEventListener('click',()=>{$('#notification').hidden=true;});
const theme=$<HTMLSelectElement>('#theme'),dark=$<HTMLInputElement>('#dark');
theme.value=stored('astryx-theme-v2','neutral');if(!theme.value)theme.value='neutral';dark.checked=stored('astryx-dark-v2',false);
function appearance(save=false){document.documentElement.dataset.astryxTheme=theme.value;document.documentElement.dataset.theme=dark.checked?'dark':'light';if(save)try{localStorage.setItem('astryx-theme-v2',JSON.stringify(theme.value));localStorage.setItem('astryx-dark-v2',JSON.stringify(dark.checked));}catch{notify('外観を保存できませんでした');}}
theme.addEventListener('change',()=>appearance(true));dark.addEventListener('change',()=>appearance(true));appearance();render();
