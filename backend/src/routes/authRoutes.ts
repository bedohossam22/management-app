import express from 'express';
import { register, login, getMe, updateAvatar } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validators/authValidator';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);
router.put('/avatar', auth, updateAvatar);

export default router;
