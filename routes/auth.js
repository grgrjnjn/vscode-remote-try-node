// routes/auth.js
import express from 'express';
import { sendLoginLink, authenticateToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', sendLoginLink);
router.get('/verify', authenticateToken);

export { router as authRouter };