import { promises as fs } from 'fs';
import path from 'path';

export const getBoardData = async (req, res, next) => {
    try {
        const filePath = path.join(process.cwd(), 'public', 'board_data.json');
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        res.render('board', { posts: jsonData });
    } catch (error) {
        next(error);
    }
};
