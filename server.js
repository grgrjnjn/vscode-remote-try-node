
// /(ルート) は、404エラーを返す
// /board で掲示板を表示する

// https://fluffy-giggle-gx9rjvpqq3vj4w-3000.app.github.dev/board


// /email-login
// に、「メールアドレス入力欄」と「ログイン」ボタンだけのスマホ向けに最適化されたシンプルで綺麗なページを作る。

// メールを送付し、メール記載のURLをクリックしたらログイン済みとしてセッション管理する仕組みを提案してください。

// veiwを使用

// server.js
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import ejs from 'ejs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

const tokens = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供を設定
app.use(express.static('public'));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));

// テンプレートエンジンの設定（HTMLを直接使用する場合）
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: '79e661aead4136d90276c464cf8f7366',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const token = crypto.randomBytes(32).toString('hex');
    tokens[token] = email;
    
    const loginLink = `http://fluffy-giggle-gx9rjvpqq3vj4w-3000.app.github.dev/auth?token=${token}`;
  
    // メールオプションの設定
    let mailOptions = {
      from: '"roku" <justanother893@gmail.com>',
      to: email,
      subject: "ログインリンク",
      text: `以下のリンクをクリックしてログインしてください: ${loginLink}`,
      html: `<p>以下のリンクをクリックしてログインしてください:</p><a href="${loginLink}">${loginLink}</a>`
    };
  
    try {
      // メール送信
      await transporter.sendMail(mailOptions);
      res.send('ログインリンクをメールで送信しました。メールをご確認ください。');
    } catch (error) {
      console.error('メール送信エラー:', error);
      res.status(500).send('メールの送信に失敗しました。しばらくしてから再度お試しください。');
    }
});


// トランスポーターの作成
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS を使用
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
});

app.get('/auth', (req, res) => {
    const token = req.query.token;
    const email = tokens[token];
    
    if (email) {
      req.session.user = email;
      delete tokens[token];
      res.redirect('/board');
    } else {
      res.status(400).send('Invalid token');
    }
});
  
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// ルート（/）で404エラーを返す
app.get('/', (req, res) => {
  res.status(404).send('404 Not Found');
});


app.get('/email-login', (req, res) => {
    res.render('email-login');
});




// 掲示板を表示
app.get('/__board', async (req, res) => {
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

app.get('/board', async (req, res) => {
    try {
      const filePath = path.join(__dirname, 'public', 'board_data.json');
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
  
      res.render('board', { posts: jsonData });
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).send('Error reading board data');
    }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
