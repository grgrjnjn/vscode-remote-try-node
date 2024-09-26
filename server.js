import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// 静的ファイルの提供を設定
app.use(express.static('public'));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

app.get('/', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'board_data.json');
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>掲示板</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 10px;
            font-size: 16px;
            line-height: 1.5;
        }
        .board {
            max-width: 100%;
            margin: 0 auto;
        }
        .post {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .post-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .post-name {
            font-weight: bold;
            color: #0056b3;
            font-size: 1.1em;
        }
        .post-email {
            color: #6c757d;
            font-size: 0.9em;
            display: block;
            margin-top: 5px;
        }
        .post-info {
            font-size: 0.9em;
            color: #495057;
            margin-bottom: 10px;
        }
        .post-message {
            white-space: pre-wrap;
            margin-bottom: 15px;
            font-size: 1em;
        }
        .post-images {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }
        .post-images img {
            width: 100%;
            height: auto;
            object-fit: cover;
            border-radius: 4px;
        }
        .post-time {
            font-size: 0.8em;
            color: #6c757d;
            text-align: right;
        }
        .post-count {
            font-size: 0.9em;
            color: #28a745;
            margin-left: 10px;
        }
        .post-source {
            font-size: 0.8em;
            color: #007bff;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="board">
        <h1>掲示板</h1>
        ${jsonData.map(post => `
            <div class="post">
                <div class="post-header">
                    <span class="post-name">${escapeHtml(post.name)}</span>
                    <span class="post-email">&lt;${escapeHtml(post.email)}&gt;</span>
                    <span class="post-count">類似投稿数: ${post.numberOfSimilarPosts}</span>
                </div>
                <div class="post-info">
                    ${escapeHtml(post.area || '不明')} | ${escapeHtml(post.age || '不明')} | ${escapeHtml(post.sexuality || '不明')} | ${escapeHtml(post.bodyShape || '不明')}
                </div>
                <div class="post-message">${post.message}</div>
                <div class="post-images">
                    ${post.images.map(img => `<img src="${escapeHtml(img)}" alt="投稿画像">`).join('')}
                </div>
                <div class="post-time">${escapeHtml(post.postTime)}</div>
                <div class="post-source">出典: ${post.source}</div>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Error reading board data');
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
