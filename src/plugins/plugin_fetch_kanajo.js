// plugins/fetch_kanajo_plugin.js

// importを使う
// JSDOMを使う

// 動作
// リンク先のメールアドレスを取得してHTMLを書き換える

// HTMLテキストに、以下のようなaタグで囲まれたimgタグが複数ある。
// <a href="https://kanajo.com/public/thread/img/*"><img width="48px" height="64px" src="http://kanajo.com/public/assets/img/bbs/*" alt=""></a>
// この部分全体をaタグのリンク先ページにあるimgタグのsrcの値を取ってきて、その値をsrcとするimgタグに置き換えたい。
// この部分を探すのは、テキストに対して正規表現を用いた方が簡単ではないかと思う。

// aタグのリンク先ページにはimgタグは1つしかない。このimgタグのsrcの値のうち?を含む?以降は破棄する。

// ###具体例
// #HTMLテキストに複数あるaタグで囲まれたimgタグの例
// <a href="https://kanajo.com/public/thread/img/?id=9330015&amp;type=comment&amp;no=1"><img width="48px" height="64px" src="http://kanajo.com/public/assets/img/bbs/00000001/thumb_09d24649051a95379075bc60ac592714.jpg?1726886796" alt=""></a>
// #aタグのリンク先
// https://kanajo.com/public/thread/img/?id=9330015&amp;type=comment&amp;no=1
// #aタグのリンク先ページにあるimgタグ
// <img width="80%" src="http://kanajo.com/public/assets/img/bbs/00000001/398098aaebabf32acd2d976e2a217607.jpg?1726913294" alt="" />
// #imgタグのsrcの値のうち?を含む?以降は破棄
// http://kanajo.com/public/assets/img/bbs/00000001/398098aaebabf32acd2d976e2a217607.jpg
// #その値をsrcとするimgタグ
// <img src="http://kanajo.com/public/assets/img/bbs/00000001/398098aaebabf32acd2d976e2a217607.jpg" alt="">



// TODO:
// 連続30以上のアクセスをすることになるので、間隔を開ける？
// 開始時間がいつもピッタリにならないようにランダムなスリープを入れる？


// plugins/fetch_kanajo_plugin.js
import path from 'path';
import { fetchHTML, createJSDOM, saveHTML, createPluginRunner } from './utils.js';

const CONFIG = {
  URL: 'https://kanajo.com/public/thread/index?id=1',
  OUTPUT_DIR: 'data/source/html',
  OUTPUT_FILE: 'kanajo.html',
  WAIT_TIME: 5000, // 5秒
  MAIL_LINK_PATTERN: /https:\/\/kanajo\.com\/public\/mail\/\?type=comment&id=\d+/,
  IMAGE_LINK_PREFIX: 'https://kanajo.com/public/thread/img/'
};

async function fetchAndSaveKanajoHTML() {
  const html = await fetchHTML(CONFIG.URL);
  const dom = await createJSDOM(html);

  // ページの読み込みと追加の待機時間
  await new Promise(resolve => setTimeout(resolve, CONFIG.WAIT_TIME));

  const links = dom.window.document.querySelectorAll('a');
  for (const link of links) {
    if (CONFIG.MAIL_LINK_PATTERN.test(link.href)) {
      const commentHtml = await fetchHTML(link.href);
      const commentDom = await createJSDOM(commentHtml);
      const emailLink = commentDom.window.document.querySelector('a[href^="mailto:"]');
      if (emailLink) {
        link.outerHTML = emailLink.outerHTML;
      }
      commentDom.window.close();
    }
    
    if (link.href.startsWith(CONFIG.IMAGE_LINK_PREFIX)) {
      const imgHtml = await fetchHTML(link.href);
      const imgDom = await createJSDOM(imgHtml);
      const img = imgDom.window.document.querySelector('img');
      if (img) {
        const srcWithoutQuery = img.src.split('?')[0];
        link.outerHTML = `<img src="${srcWithoutQuery}" alt="">`;
      }
      imgDom.window.close();
    }
  }

  const finalHTML = dom.serialize();
  const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_FILE);
  await saveHTML(finalHTML, outputPath);

  // リソースを解放
  dom.window.close();

  return `Kanajo HTMLが保存されました: ${outputPath}`;
}

export const run = createPluginRunner(fetchAndSaveKanajoHTML);

// 単体実行用のコード
if (import.meta.url === `file://${process.argv[1]}`) {
  run().then(console.log).catch(console.error);
}


