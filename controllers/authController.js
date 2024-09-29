// import crypto from 'crypto';
// import { sendMail } from '../utils/mailer.js';

// const tokens = {};

// export const sendLoginLink = async (req, res, next) => {
//     try {
//         const { email } = req.body;
//         const token = crypto.randomBytes(32).toString('hex');
//         tokens[token] = email;
        
//         const loginLink = `https://fluffy-giggle-gx9rjvpqq3vj4w-3000.app.github.dev/auth/verify?token=${token}`;
        
//         await sendMail(email, "ログインリンク", loginLink);
//         res.send('ログインリンクをメールで送信しました。メールをご確認ください。');
//     } catch (error) {
//         next(error);
//     }
// };

// export const authenticateToken = (req, res) => {
//     const { token } = req.query;
//     const email = tokens[token];
    
//     if (email) {
//         req.session.user = email;
//         delete tokens[token];
//         res.redirect('/board');
//     } else {
//         res.status(400).send('Invalid token');
//     }
// };


// controllers/authController.js
import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TOKEN_EXPIRY = 1000 * 60 * 60; // 1時間
const tokens = {};

// トークンクリーンアップ
setInterval(() => {
  const now = Date.now();
  Object.keys(tokens).forEach(token => {
    if (tokens[token].expires <= now) {
      delete tokens[token];
    }
  });
}, 1000 * 60 * 60); // 1時間ごとにクリーンアップ

export const sendLoginLink = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = crypto.randomBytes(32).toString('base64url');
        const csrfToken = crypto.randomBytes(32).toString('base64url');
        
        tokens[token] = { 
            email, 
            expires: Date.now() + TOKEN_EXPIRY,
            csrfToken
        };
        
        req.session.csrfToken = csrfToken;
        const loginLink = `${BASE_URL}/auth/verify?token=${token}&csrf=${csrfToken}`;
        
        await sendMail(email, "ログインリンク", loginLink);
        res.send('ログインリンクをメールで送信しました。メールをご確認ください。');
    } catch (error) {
        next(error);
    }
};

export const authenticateToken = (req, res) => {
    const { token, csrf } = req.query;
    const tokenData = tokens[token];
    
    if (tokenData && tokenData.expires > Date.now() && tokenData.csrfToken === csrf) {
        req.session.user = tokenData.email;
        delete tokens[token];
        res.redirect('/board');
    } else {
        res.status(400).send('Invalid or expired token');
    }
};
