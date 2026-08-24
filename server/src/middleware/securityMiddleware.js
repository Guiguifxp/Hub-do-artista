import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

/**
 * Configuração de segurança com Helmet
 * Adiciona headers de segurança HTTP
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  xFrameOptions: { action: 'deny' }, // Protege contra clickjacking
});

/**
 * Configuração de CORS restrita
 * Permite apenas requisições dos domínios do front-end.
 * CLIENT_URL aceita várias origens separadas por vírgula (ex: localhost + IP da rede local).
 */
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsOptions = cors({
  origin: (origin, callback) => {
    // Requisições sem header Origin (curl, testes, apps) são permitidas
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * Rate Limiter para rotas públicas de agendamento
 * Previne spam e ataques de força bruta
 * (em NODE_ENV=test o limite é elevado para não bloquear a suíte de testes)
 */
const isTestEnv = process.env.NODE_ENV === 'test';

export const agendamentoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isTestEnv ? 1000 : 5, // Máximo de 5 requisições por IP (1000 em testes)
  message: {
    error: 'Muitas solicitações de agendamento. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter para rotas de autenticação
 * Previne ataques de força bruta em login
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isTestEnv ? 1000 : 10, // Máximo de 10 tentativas de login por IP (1000 em testes)
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter geral para API
 */
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Máximo de 100 requisições por minuto por IP
  message: {
    error: 'Muitas requisições. Tente novamente em alguns instantes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
