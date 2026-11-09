import {test,expect} from '@playwright/test';
test('task lifecycle, filtering and persistence',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('tbody tr')).toHaveCount(8);
 await page.getByRole('button',{name:'タスクを追加',exact:true}).first().click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await dialog.getByRole('textbox',{name:'タスク名'}).fill('動作確認用タスク');
 await dialog.getByRole('textbox',{name:'メモ'}).fill('保存と完了を確認');
 await dialog.getByRole('combobox',{name:'ステータス'}).click();await page.getByRole('option',{name:'進行中',exact:true}).click();
 await dialog.getByRole('button',{name:'タスクを追加',exact:true}).click();await expect(dialog).not.toBeVisible();
 await page.getByRole('textbox',{name:'タスクを検索'}).fill('動作確認用');await expect(page.locator('tbody tr')).toHaveCount(1);
 await page.getByRole('checkbox',{name:'動作確認用タスクを完了'}).check();await expect(page.locator('tbody tr')).toContainText('完了');
 await page.reload();await expect(page.locator('tbody tr')).toHaveCount(9);
 await page.getByRole('button',{name:'動作確認用タスクを編集',exact:true}).click();
 await dialog.getByRole('textbox',{name:'タスク名'}).fill('更新したタスク');await dialog.getByRole('button',{name:'変更を保存'}).click();
 await page.getByRole('button',{name:'更新したタスクを編集',exact:true}).click();await dialog.getByRole('button',{name:'タスクを削除'}).click();
 await expect(page.locator('tbody tr')).toHaveCount(8);await page.getByRole('button',{name:'元に戻す'}).click();await expect(page.locator('tbody tr')).toHaveCount(9);
 expect(errors).toEqual([]);
});
test('themes, board, filters, and mobile layout',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'外観',exact:true}).click();await page.getByRole('combobox',{name:'テーマ'}).click();await page.getByRole('option',{name:'Butter',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-astryx-theme','butter');
 await page.getByRole('switch',{name:'ダークモード'}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-astryx-theme','butter');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('radio',{name:'ボード',exact:true}).click();await expect(page.getByTestId('board-column')).toHaveCount(3);await expect(page.getByTestId('task-card')).toHaveCount(8);
 await page.getByRole('radio',{name:'リスト',exact:true}).click();await page.getByRole('combobox',{name:'優先度'}).click();await page.getByRole('option',{name:'高',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.getByRole('combobox',{name:'優先度',exact:true}).click();await page.getByRole('option',{name:'すべての優先度',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(8);
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
});
