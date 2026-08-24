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
// Tratamento próprio do multer para retornar erros claros (ex: arquivo > 100MB)
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Arquivo muito grande. O limite é de 100MB.' });
        }
        return res.status(400).json({ error: `Erro no upload do arquivo: ${err.message}` });
      }
      next();
    });
  },
  validatePortfolioUpload,
  uploadMidia
);
router.delete('/:id', authMiddleware, requireAdmin, deletarMidia);

export default router;
