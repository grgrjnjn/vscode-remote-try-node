
// plugins/fetch_kanajo_plugin.js により取得・加工されたHTMLのフォーマットチェックを行うプログラムを作成する。

// 1.
// MAIL_LINK_PATTERN: /https:\/\/kanajo\.com\/public\/mail\/\?type=comment&id=\d+/,
// にマッチするaタグがないこと

// 2.
// IMAGE_LINK_PREFIX: 'https://kanajo.com/public/thread/img/'
// にマッチするaタグがないこと

import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

const CONFIG = {
  OUTPUT_DIR: 'data/source/html',
  OUTPUT_FILE: 'kanajo.html',
  MAIL_LINK_PATTERN: /https:\/\/kanajo\.com\/public\/mail\/\?type=comment&id=\d+/,
  IMAGE_LINK_PREFIX: 'https://kanajo.com/public/thread/img/'
};

async function checkKanajoHTML() {
  try {
    const filePath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_FILE);
    const html = await fs.readFile(filePath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // 1. MAIL_LINK_PATTERNにマッチするaタグがないことを確認
    const mailLinks = document.querySelectorAll(`a[href^="https://kanajo.com/public/mail/?type=comment&id="]`);
    if (mailLinks.length > 0) {
      console.error(`エラー: ${mailLinks.length}個のMAIL_LINK_PATTERNにマッチするaタグが見つかりました。`);
      return false;
    }

    // 2. IMAGE_LINK_PREFIXにマッチするaタグがないことを確認
    const imageLinks = document.querySelectorAll(`a[href^="${CONFIG.IMAGE_LINK_PREFIX}"]`);
    if (imageLinks.length > 0) {
      console.error(`エラー: ${imageLinks.length}個のIMAGE_LINK_PREFIXにマッチするaタグが見つかりました。`);
      return false;
    }

    console.log('HTMLフォーマットチェックに成功しました。');
    return true;
  } catch (error) {
    console.error('エラー:', error);
    return false;
  }
}

checkKanajoHTML().then(result => {
  if (result) {
    console.log('チェックが正常に完了しました。');
  } else {
    console.log('チェックに失敗しました。');
  }
}).catch(error => {
  console.error('プログラムの実行中にエラーが発生しました:', error);
});
