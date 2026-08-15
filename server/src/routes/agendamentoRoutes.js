import express from 'express';
import { 
  criarAgendamento, 
  buscarBloqueios, 
  listarAgendamentos, 
  atualizarStatusAgendamento 
} from '../controllers/agendamentoController.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import { validateAgendamento, validateStatusUpdate } from '../middleware/validationMiddleware.js';
import { agendamentoLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/', agendamentoLimiter, validateAgendamento, criarAgendamento);
router.get('/bloqueios', buscarBloqueios);

// Rotas administrativas
router.get('/', authMiddleware, requireAdmin, listarAgendamentos);
router.patch('/:id', authMiddleware, requireAdmin, validateStatusUpdate, atualizarStatusAgendamento);

export default router;
