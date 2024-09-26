// plugins/fetch_oshioki_plugin.js

// JSDOMの設定でvirtualConsoleオプションを使用して、エラーを抑制しつつ実行を続ける
// ES modules形式


import { JSDOM, VirtualConsole } from 'jsdom';
import { promises as fs } from 'fs';
import path from 'path';

const url = 'https://oshioki24.com/board/search/3/13/1/';
const outputDir = 'data/source/html';
const outputFile = path.join(outputDir, 'oshioki.html');

async function fetchAndSaveHTML() {
  try {
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("error", () => { /* エラーを無視 */ });

    const dom = await JSDOM.fromURL(url, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
      virtualConsole
    });

    // ページの読み込みを待つ
    await new Promise(resolve => {
      dom.window.addEventListener('load', resolve);
    });

    // さらに時間を置いて待つ（必要に応じて調整）
    await new Promise(resolve => setTimeout(resolve, 5000));  // 5秒

    // 動的に生成されたHTMLを取得
    const html = dom.serialize();

    // 出力ディレクトリが存在しない場合は作成
    await fs.mkdir(outputDir, { recursive: true });

    // HTMLをファイルに保存
    await fs.writeFile(outputFile, html);

    // リソースを解放
    dom.window.close();

    return `HTMLが保存されました: ${outputFile}`;
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  }
}

export async function run() {
  try {
    const result = await fetchAndSaveHTML();
    return result;
  } catch (error) {
    return `エラーが発生しました: ${error.message}`;
  }
}

// 単体実行用のコード
if (import.meta.url === `file://${process.argv[1]}`) {
  run()
    .then(result => console.log(result))
    .catch(error => console.error('エラー:', error));
}