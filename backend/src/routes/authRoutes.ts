import express from 'express';
import { register, login } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validators/authValidator';

const router = express.Router();


router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;