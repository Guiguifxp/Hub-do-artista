import { supabase } from '../config/supabase.js';

/**
 * Middleware de autenticação para rotas protegidas
 * Valida o token JWT e verifica se o usuário tem permissão de acesso
 */
export async function authMiddleware(req, res, next) {
  try {
    // Extrai o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autenticação não fornecido' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Valida o token com Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado' 
      });
    }

    // Busca informações adicionais do usuário na tabela usuarios.
    // Vínculo pelo e-mail (a coluna id da tabela é integer, não uuid do Auth).
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, role')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return res.status(403).json({ 
        error: 'Usuário não encontrado no sistema' 
      });
    }

    // Anexa os dados do usuário na requisição
    req.user = userData;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor' 
    });
  }
}

/**
 * Middleware para validar se o usuário tem role de ADMIN
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Autenticação necessária' 
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acesso negado: privilégios de administrador necessários' 
    });
  }

  next();
}
