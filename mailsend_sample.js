// アプリパスワードを設定する手順を説明します：
// アプリパスワードを使用するための前提条件:
// Googleアカウントで2段階認証を有効にする必要があります。
// アプリパスワードの作成手順:
// a. Googleアカウントにログインします。
// b. セキュリティ設定に移動します。
// c. 「Googleへのログイン方法」セクションで「2段階認証プロセス」を選択します。
// d. ページの下部にある「アプリパスワード」を選択します。
// e. アプリパスワードを使用するアプリの名前を入力します（例：「Node.js Email App」）。
// f. 「作成」をクリックします。
// g. 生成された16文字のパスワードを控えます。このパスワードは一度しか表示されないので注意してください。
// アプリパスワードの使用:
// Node.jsのコードで、通常のGmailパスワードの代わりにこの16文字のアプリパスワードを使用します。

// Node.js Email App
// jtvh ypyg pgoh fwpz


// yarn add nodemailer
// yarn add dotenv

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// トランスポーターの作成
    // user: "justanother893@gmail.com", // あなたのGmailアドレス
    // pass: "jtvh ypyg pgoh fwpz" // あなたのGmailパスワードまたはアプリパスワード

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS を使用
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// メールオプションの設定
let mailOptions = {
  from: '"roku" <justanother893@gmail.com>',
  to: "justanother893@gmail.com",
  subject: "テストメール from Node.js",
  text: "こんにちは、これはNode.jsから送信されたテストメールです。",
  html: "<b>こんにちは、これはNode.jsから送信されたテストメールです。</b>"
};

// メール送信
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
});
