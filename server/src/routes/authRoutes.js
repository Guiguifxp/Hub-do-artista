import express from 'express';
import { 
  register, 
  login, 
  adminLogin, 
  logout, 
  getSession,
  forgotPassword 
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/admin/login', authLimiter, validateLogin, adminLogin);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);

// Rotas protegidas
router.get('/session', authMiddleware, getSession);

export default router;
