import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPlugins(pluginsDir) {
  const pluginFiles = await fs.readdir(pluginsDir);
  const jsFiles = pluginFiles.filter(file => /^plugin_convert_.+\.js$/.test(file));

  const results = await Promise.all(jsFiles.map(async (file) => {
    try {
      const pluginPath = path.join(pluginsDir, file);
      const plugin = await import(url.pathToFileURL(pluginPath));
      return await plugin.run();
    } catch (error) {
      console.error(`Error in plugin ${file}: ${error.message}`);
      return null;
    }
  }));

  return results.filter(result => result !== null);
}

async function main() {
  const pluginsDir = path.join(__dirname, '..', 'src', 'plugins');
  try {
    const results = await runPlugins(pluginsDir);
    console.log('All plugins executed. Results:', results);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();