import dotenv from 'dotenv';
import express from 'express';
import { supabase } from './config/supabase.js';
import { securityHeaders, corsOptions, generalLimiter } from './middleware/securityMiddleware.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';

dotenv.config();

const app = express();

// Middlewares de segurança
app.use(securityHeaders);
app.use(corsOptions);
app.use(generalLimiter);
app.use(express.json());

// Rotas de saúde e teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando com sucesso!' });
});

app.get('/api/supabase-test', async (req, res) => {
  try {
    await supabase.from('_dummy_query').select('*').limit(1);
    res.json({ status: 'success', message: 'Conexão com Supabase estabelecida!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Rotas da aplicação
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

export default app;
