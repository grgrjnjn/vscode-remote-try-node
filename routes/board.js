import express from 'express';
import { getBoardData } from '../controllers/boardController.js';

const router = express.Router();

router.get('/', getBoardData);

export { router as boardRouter };
