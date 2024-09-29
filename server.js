// server2.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { boardRouter } from './routes/board.js';
import { errorHandler } from './middleware/errorHandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));
app.use(session({
    secret: process.env.SESSION_SECRET || '79e661aead4136d90276c464cf8f7366',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// テンプレートエンジンの設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ルーティング
app.use('/auth', authRouter);
app.use('/board', boardRouter);

app.get('/', (req, res) => {
  res.status(404).send('404 Not Found');
});

app.get('/email-login', (req, res) => {
    res.render('email-login');
});


// エラーハンドリング
app.use(errorHandler);

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});

// server2.js の最後に追加
app.use((req, res, next) => {
    res.status(404).send("Sorry, that route doesn't exist.");
  });
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
