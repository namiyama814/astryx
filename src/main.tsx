import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  AppShell, TopNav, TopNavHeading, Layout, LayoutHeader, LayoutContent,
  LayoutFooter, HStack, VStack, Grid, Heading, Text, Button, IconButton,
  Badge, Avatar, CheckboxInput, TextInput, TextArea, DateInput, Selector,
  Switch, SegmentedControl, SegmentedControlItem, TabList, Tab, Table,
  Card, Dialog, DialogHeader, ProgressBar, EmptyState, useToast,
  proportional, pixel, type TableColumn, type DateInputProps,
} from '@astryxdesign/core';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {matchaTheme} from '@astryxdesign/theme-matcha/built';
import {butterTheme} from '@astryxdesign/theme-butter/built';
import {Plus, Search, Settings, List, Columns3, Pencil, Trash2} from 'lucide-react';
import {seed, stored, statusNames, statusColors, categoryColors, type Task, type Status} from './data';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '@astryxdesign/theme-matcha/theme.css';
import '@astryxdesign/theme-butter/theme.css';
import '@astryxdesign/theme-neutral/fonts.css';
import '@astryxdesign/theme-matcha/fonts.css';
import '@astryxdesign/theme-butter/fonts.css';
import './style.css';

const options = (values: string[]) => values.map(value => ({value, label: value}));
const emptyTask = (): Omit<Task, 'id'> => ({
  title: '', detail: '', status: 'todo', priority: '中',
  category: 'デザイン', date: '2026-11-18', owner: '田中',
});

function App() {
  const [theme, setTheme] = useState(() => stored('astryx-theme-v2', 'neutral'));
  const [dark, setDark] = useState(() => stored('astryx-dark-v2', false));
  useEffect(() => localStorage.setItem('astryx-theme-v2', JSON.stringify(theme)), [theme]);
  useEffect(() => localStorage.setItem('astryx-dark-v2', JSON.stringify(dark)), [dark]);
  return (
    <Theme theme={{neutral: neutralTheme, matcha: matchaTheme, butter: butterTheme}[theme] || neutralTheme} mode={dark ? 'dark' : 'light'}>
      <Workspace theme={theme} setTheme={setTheme} dark={dark} setDark={setDark}/>
    </Theme>
  );
}

function Workspace({theme, setTheme, dark, setDark}: {
  theme: string; setTheme: (value: string) => void;
  dark: boolean; setDark: (value: boolean) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>(() => stored('orbit-tasks-v1', seed));
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [view, setView] = useState('list');
  const [settings, setSettings] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {localStorage.setItem('orbit-tasks-v1', JSON.stringify(tasks));}
    catch {toast({body: 'タスクを保存できませんでした', type: 'error'});}
  }, [tasks]);

  const done = tasks.filter(task => task.status === 'done').length;
  const filtered = tasks.filter(task =>
    (status === 'all' || task.status === status) &&
    (priority === 'all' || task.priority === priority) &&
    `${task.title} ${task.detail} ${task.category} ${task.owner}`.toLowerCase().includes(query.toLowerCase()),
  );

  function edit(task?: Task) {
    setEditing(task || null);
    setForm(task ? {...task} : emptyTask());
    setError(false);
    setOpen(true);
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {setError(true); return;}
    const task = {...form, title: form.title.trim(), id: editing?.id || crypto.randomUUID()};
    setTasks(previous => editing ? previous.map(item => item.id === editing.id ? task : item) : [...previous, task]);
    setOpen(false);
    toast({body: editing ? 'タスクを更新しました' : 'タスクを追加しました'});
  }
  function toggle(task: Task) {
    setTasks(previous => previous.map(item => item.id === task.id ? {
      ...item, status: task.status === 'done' ? 'todo' : 'done',
    } : item));
  }
  function remove(task: Task) {
    setTasks(previous => previous.filter(item => item.id !== task.id));
    setOpen(false);
    toast({body: 'タスクを削除しました', endContent: (
      <Button label="元に戻す" variant="ghost" onClick={() => setTasks(previous => previous.some(item => item.id === task.id) ? previous : [...previous, task])}/>
    )});
  }
  function clear() {setQuery(''); setPriority('all'); setStatus('all');}

  // Composition follows Astryx's official `table` page template.
  const columns: TableColumn<Task>[] = [
    {key: 'complete', header: '完了', width: pixel(64), renderCell: task => (
      <CheckboxInput label={`${task.title}を完了`} isLabelHidden value={task.status === 'done'} onChange={() => toggle(task)}/>
    )},
    {key: 'title', header: 'タスク名', width: proportional(3, {minWidth: 220}), renderCell: task => (
      <VStack gap={1}>
        <Text weight="semibold">{task.title}</Text>
        <Text color="secondary">{task.detail}</Text>
      </VStack>
    )},
    {key: 'status', header: 'ステータス', width: pixel(112), renderCell: task => <Badge label={statusNames[task.status]} variant={statusColors[task.status]}/>},
    {key: 'priority', header: '優先度', width: pixel(80), renderCell: task => <Badge label={task.priority} variant={task.priority === '高' ? 'error' : task.priority === '中' ? 'warning' : 'neutral'}/>},
    {key: 'category', header: 'カテゴリ', width: pixel(104), renderCell: task => <Text>{task.category}</Text>},
    {key: 'date', header: '期限', width: pixel(88), renderCell: task => <Text>{task.date ? task.date.slice(5).replace('-', '/') : '未設定'}</Text>},
    {key: 'owner', header: '担当', width: pixel(64), renderCell: task => <Avatar name={task.owner} size="sm"/>},
    {key: 'actions', header: '編集', width: pixel(64), renderCell: task => (
      <IconButton label={`${task.title}を編集`} icon={<Pencil size={16}/>} variant="ghost" onClick={() => edit(task)}/>
    )},
  ];

  return (
    <>
      <AppShell
        height="fill"
        contentPadding={0}
        topNav={<TopNav heading={<TopNavHeading heading="Astryx"/>} endContent={
          <IconButton label="外観" icon={<Settings size={20}/>} variant="ghost" onClick={() => setSettings(true)}/>
        }/>}
      >
        <Layout
          height="fill"
          contentWidth={1120}
          padding={6}
          header={
            <LayoutHeader paddingBlockEnd={4}>
              <VStack gap={3}>
                <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
                  <Heading level={1}>タスク</Heading>
                  <Button label="タスクを追加" icon={<Plus size={16}/>} variant="primary" onClick={() => edit()}/>
                </HStack>
                <TabList aria-label="タスクの状態" value={status} onChange={setStatus}>
                  <Tab value="all" label="すべて"/>
                  <Tab value="todo" label="未着手"/>
                  <Tab value="progress" label="進行中"/>
                  <Tab value="done" label="完了"/>
                </TabList>
                <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
                  <HStack gap={3} wrap="wrap" vAlign="center">
                    <TextInput label="タスクを検索" isLabelHidden placeholder="タスクを検索" startIcon={<Search size={16}/>} value={query} onChange={setQuery}/>
                    <Selector label="優先度" isLabelHidden value={priority} onChange={setPriority} options={[
                      {value: 'all', label: 'すべての優先度'}, ...options(['高', '中', '低']),
                    ]}/>
                  </HStack>
                  <SegmentedControl label="表示形式" value={view} onChange={setView}>
                    <SegmentedControlItem value="list" label="リスト" icon={<List size={16}/>}/>
                    <SegmentedControlItem value="board" label="ボード" icon={<Columns3 size={16}/>}/>
                  </SegmentedControl>
                </HStack>
              </VStack>
            </LayoutHeader>
          }
          content={
            <LayoutContent>
              {filtered.length === 0 ? (
                <EmptyState title="該当するタスクはありません" icon={<Search/>} actions={<Button label="条件をクリア" variant="secondary" onClick={clear}/>}/>
              ) : view === 'list' ? (
                <Table<Task> data={filtered} columns={columns} idKey="id" hasHover/>
              ) : (
                <Grid columns={{minWidth: 280, repeat: 'fit'}} gap={4}>
                  {(['todo', 'progress', 'done'] as Status[]).map(column => (
                    <VStack gap={4} key={column} data-testid="board-column">
                      <HStack gap={2} vAlign="center">
                        <Heading level={2}>{statusNames[column]}</Heading>
                        <Badge label={filtered.filter(task => task.status === column).length}/>
                      </HStack>
                      {filtered.filter(task => task.status === column).map(task => (
                        <Card key={task.id} data-testid="task-card">
                          <VStack gap={4}>
                            <HStack hAlign="between" vAlign="center">
                              <Badge label={task.category}/>
                              <IconButton label={`${task.title}を編集`} icon={<Pencil size={16}/>} variant="ghost" onClick={() => edit(task)}/>
                            </HStack>
                            <Text weight="semibold">{task.title}</Text>
                            <Text color="secondary">{task.detail}</Text>
                            <CheckboxInput label="完了" value={task.status === 'done'} onChange={() => toggle(task)}/>
                            <HStack hAlign="between" vAlign="center">
                              <Text color="secondary">{task.date}</Text>
                              <Avatar name={task.owner} size="sm"/>
                            </HStack>
                          </VStack>
                        </Card>
                      ))}
                    </VStack>
                  ))}
                </Grid>
              )}
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider data-testid="task-footer">
              <HStack gap={4} vAlign="center" wrap="wrap">
                <Text color="secondary">{done} / {tasks.length} タスクが完了</Text>
                <VStack width={160}>
                  <ProgressBar label="プロジェクトの進捗" isLabelHidden value={done} max={tasks.length || 1}/>
                </VStack>
              </HStack>
            </LayoutFooter>
          }
        />
      </AppShell>
      <Dialog isOpen={settings} onOpenChange={setSettings}>
        <Layout
          header={<DialogHeader title="外観" onOpenChange={setSettings}/>}
          content={<LayoutContent><VStack gap={6}>
            <Selector label="テーマ" value={theme} onChange={setTheme} options={[
              {value: 'neutral', label: 'Neutral'}, {value: 'matcha', label: 'Matcha'}, {value: 'butter', label: 'Butter'},
            ]}/>
            <Switch label="ダークモード" value={dark} onChange={setDark}/>
          </VStack></LayoutContent>}
        />
      </Dialog>
      <Dialog isOpen={open} onOpenChange={setOpen} width={560} purpose="form">
        <form onSubmit={save}>
          <Layout
            header={<DialogHeader title={editing ? 'タスクを編集' : 'タスクを追加'} onOpenChange={setOpen}/>}
            content={<LayoutContent><VStack gap={4}>
              <TextInput label="タスク名" isRequired value={form.title} onChange={title => {setForm({...form, title});setError(false);}} status={error ? {type: 'error', message: 'タスク名を入力してください'} : undefined}/>
              <TextArea label="メモ" value={form.detail} onChange={detail => setForm({...form, detail})}/>
              <Grid columns={{minWidth: 180, repeat: 'fit'}} gap={4}>
                <Selector label="ステータス" value={form.status} onChange={status => setForm({...form, status: status as Status})} options={Object.entries(statusNames).map(([value, label]) => ({value, label}))}/>
                <Selector label="優先度" value={form.priority} onChange={priority => setForm({...form, priority})} options={options(['高', '中', '低'])}/>
                <Selector label="カテゴリ" value={form.category} onChange={category => setForm({...form, category})} options={options(Object.keys(categoryColors))}/>
                <Selector label="担当" value={form.owner} onChange={owner => setForm({...form, owner})} options={options(['田中', '佐藤', '鈴木'])}/>
                <DateInput label="期限" value={form.date as DateInputProps['value'] || undefined} onChange={date => setForm({...form, date: date || ''})}/>
              </Grid>
            </VStack></LayoutContent>}
            footer={<LayoutFooter hasDivider><HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
              {editing && <IconButton label="タスクを削除" icon={<Trash2 size={16}/>} variant="ghost" type="button" onClick={() => remove(editing)}/>}
              <HStack gap={2}>
                <Button label="キャンセル" variant="secondary" type="button" onClick={() => setOpen(false)}/>
                <Button label={editing ? '変更を保存' : 'タスクを追加'} variant="primary" type="submit"/>
              </HStack>
            </HStack></LayoutFooter>}
          />
        </form>
      </Dialog>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
