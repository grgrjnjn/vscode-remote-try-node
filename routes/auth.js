// routes/auth.js
import express from 'express';
import { sendLoginLink, authenticateToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    try {
        await sendLoginLink(req, res, next);
    } catch (error) {
        res.render('email-login', { error: error.message });
    }
});
router.get('/verify', authenticateToken);

export { router as authRouter };
