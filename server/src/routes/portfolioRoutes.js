import express from 'express';
import { 
  listarPortfolio, 
  uploadMidia, 
  deletarMidia 
} from '../controllers/portfolioController.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import { validatePortfolioUpload } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', listarPortfolio);

// Rotas administrativas
router.post('/', authMiddleware, requireAdmin, validatePortfolioUpload, uploadMidia);
router.delete('/:id', authMiddleware, requireAdmin, deletarMidia);

export default router;
