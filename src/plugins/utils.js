// utils.js
import { promises as fs } from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';

export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

export async function fetchHTML(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, ...options.headers },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

export async function createJSDOM(html, options = {}) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => { /* エラーを無視 */ });

  return new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole,
    ...options
  });
}

export async function saveHTML(html, fileName) {
  await fs.mkdir(path.dirname(fileName), { recursive: true });
  await fs.writeFile(fileName, html);
}

export function createPluginRunner(pluginFunction) {
  return async function run() {
    try {
      const result = await pluginFunction();
      return result;
    } catch (error) {
      console.error('処理中にエラーが発生しました:', error);
      return `エラー: ${error.message}`;
    }
  };
}

export async function createJSDOMWithJS(html, url, options = {}) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => { /* エラーを無視 */ });

  const dom = new JSDOM(html, {
    url,
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole,
    ...options
  });

  await new Promise(resolve => {
    dom.window.addEventListener('load', resolve);
  });

  // 追加の待機時間（オプション）
  if (options.additionalWait) {
    await new Promise(resolve => setTimeout(resolve, options.additionalWait));
  }

  return dom;
}