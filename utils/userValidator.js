import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersListPath = path.join(__dirname, '..', 'users.list');

export async function isValidUser(email) {
  try {
    const content = await fs.readFile(usersListPath, 'utf-8');
    const allowedEmails = content.split('\n').map(e => e.trim()).filter(Boolean);
    return allowedEmails.includes(email);
  } catch (error) {
    console.error('Error reading users list:', error);
    return false;
  }
}
