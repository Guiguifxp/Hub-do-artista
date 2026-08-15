import { body, param, validationResult } from 'express-validator';

/**
 * Middleware para processar erros de validação
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Dados inválidos',
      details: errors.array() 
    });
  }
  next();
};

/**
 * Validação para criação de agendamento
 */
export const validateAgendamento = [
  body('datas')
    .isArray({ min: 1 })
    .withMessage('Selecione ao menos uma data'),
  body('datas.*')
    .isISO8601()
    .withMessage('Formato de data inválido'),
  body('whatsapp_cliente')
    .matches(/^\d{10,11}$/)
    .withMessage('WhatsApp deve conter 10 ou 11 dígitos'),
  body('nome_local')
    .trim()
    .notEmpty()
    .withMessage('Nome do local é obrigatório')
    .isLength({ max: 255 })
    .withMessage('Nome do local muito longo'),
  body('endereco_completo')
    .trim()
    .notEmpty()
    .withMessage('Endereço completo é obrigatório')
    .isLength({ max: 500 })
    .withMessage('Endereço muito longo'),
  body('repertorio')
    .trim()
    .notEmpty()
    .withMessage('Repertório é obrigatório')
    .isLength({ max: 1000 })
    .withMessage('Repertório muito longo'),
  body('detalhes_adicionais')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Detalhes adicionais muito longos'),
  handleValidationErrors,
];

/**
 * Validação para atualização de status de agendamento
 */
export const validateStatusUpdate = [
  param('id')
    .isInt()
    .withMessage('ID inválido'),
  body('status')
    .isIn(['PENDENTE', 'CONFIRMADO', 'RECUSADO'])
    .withMessage('Status inválido'),
  handleValidationErrors,
];

/**
 * Validação para cadastro de usuário
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('whatsapp')
    .matches(/^\d{10,11}$/)
    .withMessage('WhatsApp deve conter 10 ou 11 dígitos'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('As senhas não coincidem'),
  handleValidationErrors,
];

/**
 * Validação para login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  handleValidationErrors,
];

/**
 * Validação para upload de portfólio
 */
export const validatePortfolioUpload = [
  body('tipo')
    .isIn(['imagem', 'video'])
    .withMessage('Tipo de mídia inválido'),
  handleValidationErrors,
];
