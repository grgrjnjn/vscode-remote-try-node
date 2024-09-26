// src/plugins/plugin_convert_kanajo.js
import { load } from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const POST_REGEX = /<hr align="center" color="#FFC0CB" size="2" width="100%">\s*(<font size="4">[\s\S]*?)<center>/g;
const SOURCE_LINK = '<a href="https://kanajo.com/public/thread/index?id=1">カナジョ 即ヤリ東日本</a>';

const formatPostTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}(${dayOfWeek}) ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const extractImages = ($) => {
    const images = [];
    $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('http')) {
            images.push(src);
        }
    });
    return images;
};

const extractMessage = ($) => {
    const fullText = $('font[size="4"]').text();
    const lines = fullText.split('\n').map(line => line.trim()).filter(line => line);
    const startIndex = lines.findIndex(line => line.includes('[編集][通報]')) + 1;
    const endIndex = lines.findIndex(line => line.startsWith('性別 ：'));
    let message = lines.slice(startIndex, endIndex).join('<br />').trim();
    const hopeElement = $('font[color="#FF69B4"]');
    if (hopeElement.length > 0) {
        message += `<br /><br />希望: ${hopeElement.text()}`;
    }
    return message;
};

const extractProfileInfo = (profileLines) => {
    const profileInfo = { sexuality: null, age: null, area: null };
    for (const line of profileLines) {
        if (line.startsWith('性別 ：')) {
            profileInfo.sexuality = line.replace('性別 ：', '').trim();
        } else if (line.startsWith('年齢 ：')) {
            profileInfo.age = line.replace('年齢 ：', '').trim() || null;
        } else if (line.startsWith('地域 ：')) {
            profileInfo.area = line.replace('地域 ：', '').trim();
        }
    }
    return profileInfo;
};

const parsePost = (post) => {
    const $ = load(post);
    const postData = {
        postTime: formatPostTime($('font[size="4"]').contents().first().text().trim()),
        name: $('a[href^="mailto:"]').text(),
        email: $('a[href^="mailto:"]').attr('href').replace('mailto:', ''),
        images: extractImages($),
        message: extractMessage($),
        bodyShape: null,
        source: SOURCE_LINK
    };

    const profileText = $('font[size="4"]').text();
    const profileLines = profileText.split('\n').map(line => line.trim());
    Object.assign(postData, extractProfileInfo(profileLines));

    return postData;
};

async function processHtmlFile(htmlFilePath) {
    try {
        console.log(`Processing HTML file: ${htmlFilePath}`);
        const html = await fs.readFile(htmlFilePath, 'utf-8');
        const posts = [...html.matchAll(POST_REGEX)].map(match => match[1].trim());
        console.log(`Found ${posts.length} posts`);

        const results = posts.map(parsePost);

        const jsonFileName = path.basename(htmlFilePath, '.html') + '.json';
        const jsonPath = path.resolve(__dirname, '..', '..', 'data', 'source', 'json', jsonFileName);
        await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));
        console.log(`JSON file written successfully: ${jsonPath}`);

        return `データが正常に処理され、${jsonPath} に保存されました。`;
    } catch (error) {
        console.error('エラーが発生しました:', error);
        throw error;
    }
}

export async function run() {
    const htmlFilePath = path.resolve(__dirname, '..', '..', 'data', 'source', 'html', 'kanajo.html');
    try {
        const result = await processHtmlFile(htmlFilePath);
        return result;
    } catch (error) {
        console.error('Run function encountered an error:', error);
        throw error;
    }
}

// 単体実行用のコード
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Script started in standalone mode');
    run()
        .then(result => console.log(result))
        .catch(error => console.error('エラー:', error));
}
