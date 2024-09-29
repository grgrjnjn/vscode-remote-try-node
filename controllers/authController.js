import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';

const tokens = {};

export const sendLoginLink = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = crypto.randomBytes(32).toString('hex');
        tokens[token] = email;
        
        const loginLink = `https://fluffy-giggle-gx9rjvpqq3vj4w-3000.app.github.dev/auth/verify?token=${token}`;
        
        await sendMail(email, "ログインリンク", loginLink);
        res.send('ログインリンクをメールで送信しました。メールをご確認ください。');
    } catch (error) {
        next(error);
    }
};

export const authenticateToken = (req, res) => {
    const { token } = req.query;
    const email = tokens[token];
    
    if (email) {
        req.session.user = email;
        delete tokens[token];
        res.redirect('/board');
    } else {
        res.status(400).send('Invalid token');
    }
};
