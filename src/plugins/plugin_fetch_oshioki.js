// plugins/fetch_oshioki_plugin.js

// 動作説明
// JavaScript実行結果のHTMLを取得する。
// このページではメールアドレスを得るためにJavaScriptの実行が必要となる。

// importを使う
// JSDOMを使う

// 結果
// (1)以下のタグが10個ある
// <div class="panel panel-default panel-board">
// （タグを含む複数行）
// </div>

// (2)<div class="panel panel-default panel-board">の次は<div>、その次は<a>タグであり、そのaタグのhrefはメールアドレスとなっていること。
// ダメなケースは<a href="/cdn-cgi/l/email-protection#700318151d15191c4140300911181f1f5e131f5e1a00">のようにパスが入っている。
// <div class="panel panel-default panel-board">
//   <div class="panel-head style-1">
//     <a href="mailto:yuujitian98@gmail.com">（省略）
//   </div>



// plugins/fetch_oshioki_plugin.js
import path from 'path';
import { fetchHTML, createJSDOMWithJS, saveHTML, createPluginRunner } from './utils.js';

const CONFIG = {
  URL: 'https://oshioki24.com/board/search/3/13/1/',
  OUTPUT_DIR: 'data/source/html',
  OUTPUT_FILE: 'oshioki.html',
  WAIT_TIME: 5000 // 5秒
};

async function fetchAndSaveOshiokiHTML() {
  const html = await fetchHTML(CONFIG.URL);
  const dom = await createJSDOMWithJS(html, CONFIG.URL, { additionalWait: CONFIG.WAIT_TIME });

  const finalHTML = dom.serialize();
  const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_FILE);

  await saveHTML(finalHTML, outputPath);

  dom.window.close();

  return `HTMLが保存されました: ${outputPath}`;
}

export const run = createPluginRunner(fetchAndSaveOshiokiHTML);

// 単体実行用のコード
if (import.meta.url === `file://${process.argv[1]}`) {
  run().then(console.log).catch(console.error);
}