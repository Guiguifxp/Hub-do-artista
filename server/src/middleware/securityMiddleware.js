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
 * Permite apenas requisições do domínio do front-end
 */
export const corsOptions = cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * Rate Limiter para rotas públicas de agendamento
 * Previne spam e ataques de força bruta
 */
export const agendamentoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 requisições por IP
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
  max: 10, // Máximo de 10 tentativas de login por IP
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
