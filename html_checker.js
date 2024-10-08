import fs from 'fs/promises';
import { JSDOM } from 'jsdom';

async function checkHTMLFormat(filePath) {
  try {
    // HTMLファイルを読み込む
    const html = await fs.readFile(filePath, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // (1) パネルの数をチェック
    const panels = document.querySelectorAll('div.panel.panel-default.panel-board');
    if (panels.length !== 10) {
      console.error(`エラー: パネルの数が10ではありません。実際の数: ${panels.length}`);
      return false;
    }

    let isValid = true;

    panels.forEach((panel, index) => {
      // (2) パネルの構造をチェック
      const firstChild = panel.firstElementChild;
      if (!firstChild || firstChild.tagName !== 'DIV') {
        console.error(`エラー: パネル ${index + 1} の最初の子要素が<div>ではありません。`);
        isValid = false;
        return;
      }

      const aTag = firstChild.querySelector('a');
      if (!aTag) {
        console.error(`エラー: パネル ${index + 1} の<div>内に<a>タグがありません。`);
        isValid = false;
        return;
      }

      const href = aTag.getAttribute('href');
      if (!href.startsWith('mailto:')) {
        console.error(`エラー: パネル ${index + 1} の<a>タグのhrefがメールアドレスではありません。href: ${href}`);
        isValid = false;
      }
    });

    if (isValid) {
      console.log('HTMLフォーマットは正常です。');
    }

    return isValid;
  } catch (error) {
    console.error('ファイルの読み込みまたは解析中にエラーが発生しました:', error);
    return false;
  }
}

// 使用例
const filePath = './data/source/html/oshioki.html'; // チェックしたいHTMLファイルのパス
checkHTMLFormat(filePath)
  .then(result => console.log(`チェック結果: ${result ? '成功' : '失敗'}`))
  .catch(error => console.error('エラー:', error));