// src/plugins/plugin_convert_oshioki.js
import { load } from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatPostTime(dateTimeString) {
  const match = dateTimeString.match(/(\d{4})\.(\d{2})\.(\d{2})\((\w+)\) (\d{2}:\d{2})/);
  if (match) {
    const [, year, month, day, dayOfWeek, time] = match;
    return `${year}-${month}-${day}(${dayOfWeek}) ${time}`;
  }
  return dateTimeString; // フォーマットが一致しない場合は元の文字列を返す
}

async function scrapeData(htmlFilePath) {
  try {
    console.log(`HTMLファイルを読み込みます: ${htmlFilePath}`);
    // HTMLファイルを非同期で読み込む
    const html = await fs.readFile(htmlFilePath, 'utf8');
    console.log('HTMLファイルの読み込みが完了しました');

    // Cheerioを使用してHTMLをパース
    const $ = load(html);
    console.log('HTMLのパースが完了しました');

    const results = [];

    // 全ての掲示板パネルを取得
    $('.panel-board').each((index, element) => {
      const result = {};

      // 名前とメールアドレスを取得
      const nameElement = $(element).find('.panel-head a');
      result.name = nameElement.text().trim();
      result.email = nameElement.attr('href')?.replace('mailto:', '') || '';

      // プロフィール情報を取得
      const profileMap = {
        '住所': 'area',
        '年齢': 'age',
        'ｽﾀｲﾙ': 'sexuality',
        '体型': 'bodyShape'
      };

      $(element).find('.panel-prof .pp_outer').each((i, profElement) => {
        const text = $(profElement).text();
        const key = text.split(':')[0].replace('[', '').trim();
        const value = $(profElement).find('.pp_inner').text().trim();
        const mappedKey = profileMap[key] || key;
        result[mappedKey] = value;
      });

      // メッセージを取得
      result.message = $(element).find('.panel-mess').html()?.trim() || '';

      // 画像URLを取得（ベースURLを補完）
      result.images = $(element).find('.panel-image-item a').map((i, el) => {
        let href = $(el).attr('href') || '';
        // file:// プロトコルを除去し、ベースURLを補完
        href = href.replace(/^file:\/\//, '');
        return href.startsWith('/') ? `https://oshioki24.com${href}` : `https://oshioki24.com/${href}`;
      }).get();

      // 投稿時間を取得し、フォーマットを変更
      const rawPostTime = $(element).find('.panel-time').text().trim();
      result.postTime = formatPostTime(rawPostTime);

      // source項目を追加
      result.source = '<a href="https://oshioki24.com/board/search/3/13/1/">おしおき関東掲示板</a>';

      results.push(result);
    });

    console.log(`抽出されたデータ数: ${results.length}`);

    // JSONファイルの名前と保存場所を設定
    const jsonFileName = path.basename(htmlFilePath, '.html') + '.json';
    const jsonFilePath = path.resolve(__dirname, '..', '..', 'data', 'source', 'json', jsonFileName);
    console.log(`JSONファイルの保存先: ${jsonFilePath}`);

    // 結果をJSONファイルに非同期で保存
    await fs.writeFile(jsonFilePath, JSON.stringify(results, null, 2));
    console.log('JSONファイルの保存が完了しました');

    return `データが正常に保存されました: ${jsonFilePath}`;

  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  }
}

export async function run() {
  try {
    const htmlFilePath = path.resolve(__dirname, '..', '..', 'data', 'source', 'html', 'oshioki.html');
    console.log('処理を開始します');
    const result = await scrapeData(htmlFilePath);
    console.log('処理が完了しました');
    return result;
  } catch (error) {
    console.error('run関数でエラーが発生しました:', error);
    throw error;
  }
}

// 単体実行用のコード
if (import.meta.url === `file://${process.argv[1]}`) {
  run()
    .then(result => console.log(result))
    .catch(error => console.error('エラー:', error));
}
