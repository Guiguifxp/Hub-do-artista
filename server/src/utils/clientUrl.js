/**
 * URL base do front-end para redirecionamentos (links de e-mail, CORS, etc.).
 * CLIENT_URL pode ter várias origens separadas por vírgula (localhost + IP da rede);
 * para links de e-mail usamos a primeira (que costuma ser a de acesso local/principal).
 */
export function getClientBaseUrl() {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  return raw.split(',')[0].trim();
}

/** URL para onde o usuário volta após confirmar o e-mail (ou redefinir a senha) */
export function getLoginRedirectUrl() {
  return `${getClientBaseUrl()}/login`;
}
