import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Gera o hash seguro (bcrypt) de uma senha.
 * A autenticação principal é feita pelo Supabase Auth, mas o hash é persistido
 * na coluna `senha_hash` da tabela `usuarios` para armazenamento seguro da senha
 * e permitir verificação direta sem depender do Auth.
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Senha é obrigatória para gerar o hash');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto puro com um hash bcrypt.
 * Retorna false (nunca lança) para senha/hash ausentes ou inválidos.
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash || typeof hash !== 'string') {
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}
