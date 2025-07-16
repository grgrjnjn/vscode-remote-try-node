// plugins/login_koto_lib_plugin.js

// 動作説明
// 江東区立図書館 OPW システムにログインし、クッキーを取得する。
// 環境変数 KOTO_LIB_USER, KOTO_LIB_PASS にユーザーID・パスワードを設定してください。

import fetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import { createPluginRunner } from './utils.js';

const CONFIG = {
  LOGIN_URL: 'https://www.koto-lib.tokyo.jp/opw/OPW/OPWUSERCONF.CSP',
  // 送信先はフォーム action 属性を確認して適宜変更
  FORM_ACTION: 'https://www.koto-lib.tokyo.jp/opw/OPW/OPWUSERCONF.CSP',
  ENV_USER: 'KOTO_LIB_USER',
  ENV_PASS: 'KOTO_LIB_PASS'
};

/**
 * ログイン処理を実行し、ログイン後のクッキーを返します。
 */
async function loginToKotoLib() {
  const username = process.env[CONFIG.ENV_USER];
  const password = process.env[CONFIG.ENV_PASS];
  if (!username || !password) {
    throw new Error(`環境変数 ${CONFIG.ENV_USER} / ${CONFIG.ENV_PASS} を設定してください`);
  }

  // CookieJar を作成し、fetchCookie でラップ
  const jar = new CookieJar();
  const fetchWithCookies = fetchCookie(fetch, jar);

  // (1) ログインページを取得して初期クッキーと隠しフィールドを取得
  const res1 = await fetchWithCookies(CONFIG.LOGIN_URL, { method: 'GET' });
  const text1 = await res1.text();

  // (2) hidden フィールドをパース（必要に応じて調整）
  // ここでは簡単化のため、ユーザーID/パスワードのみ送信すると仮定
  const params = new URLSearchParams();
  params.append('USERID', username);
  params.append('PASS', password);

  // (3) フォーム送信でログイン
  const res2 = await fetchWithCookies(CONFIG.FORM_ACTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': CONFIG.LOGIN_URL
    },
    body: params.toString()
  });

  const text2 = await res2.text();
  if (!res2.ok || /ログインエラー|エラー/.test(text2)) {
    throw new Error('ログインに失敗しました。ユーザーID・パスワードを確認してください。');
  }

  console.log('ログイン成功。クッキーを取得しました。');
  return jar;
}

export const run = createPluginRunner(loginToKotoLib);

// 直接実行用
if (import.meta.url === `file://${process.argv[1]}`) {
  run()
    .then(() => console.log('完了'))
    .catch(err => console.error(err));
}
