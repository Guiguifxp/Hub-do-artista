import express from 'express';
import multer from 'multer';
import { 
  listarPortfolio, 
  uploadMidia, 
  deletarMidia 
} from '../controllers/portfolioController.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import { validatePortfolioUpload } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Upload de arquivos em memória (o controller salva no Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB (vídeos podem ser grandes)
});

// Rotas públicas
router.get('/', listarPortfolio);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  upload.single('file'),
  validatePortfolioUpload,
  uploadMidia
);
router.delete('/:id', authMiddleware, requireAdmin, deletarMidia);

export default router;
