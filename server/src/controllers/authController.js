import { supabase } from '../config/supabase.js';

/**
 * Cadastro de novo usuário (cliente)
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { email, whatsapp, password } = req.body;

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        error: authError.message,
      });
    }

    // Nome derivado do prefixo do e-mail (o formulário de cadastro não possui campo nome,
    // mas a tabela usuarios exige a coluna nome NOT NULL)
    const nome = email.split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || 'Cliente';

    // Criar registro na tabela usuarios.
    // O id é gerado pelo serial do banco (a coluna é integer, não uuid).
    // senha_hash fica vazio porque a autenticação é feita via Supabase Auth.
    const { error: userError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        whatsapp,
        senha_hash: '',
        role: 'CLIENTE',
      }]);

    if (userError) {
      // Tentar deletar o usuário criado no Auth se falhar ao criar na tabela
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    // Se o Supabase estiver com confirmação de e-mail habilitada,
    // authData.session vem null e o usuário precisa confirmar antes de logar
    const emailConfirmacaoPendente = !authData.session;

    return res.status(201).json({
      message: emailConfirmacaoPendente
        ? 'Cadastro realizado! Confirme seu e-mail para ativar a conta.'
        : 'Cadastro realizado com sucesso',
      emailConfirmacaoPendente,
      user: {
        id: authData.user.id,
        email,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({
      error: 'Erro ao processar cadastro',
    });
  }
}

/**
 * Login de usuário
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Autenticar com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
      });
    }

    // Buscar informações adicionais do usuário.
    // A tabela usuarios.id é integer (serial); o vínculo com o Supabase Auth
    // é feito pelo e-mail (único no Auth), não pelo id (uuid).
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, role')
      .eq('email', data.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      session: data.session,
      user: userData,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      error: 'Erro ao processar login',
    });
  }
}

/**
 * Login administrativo
 * POST /api/auth/admin/login
 */
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Autenticar com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
      });
    }

    // Verificar se usuário tem role ADMIN.
    // Vínculo pelo e-mail (a coluna id da tabela é integer, não uuid do Auth).
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, role')
      .eq('email', data.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    if (userData.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado: privilégios de administrador necessários',
      });
    }

    return res.status(200).json({
      message: 'Login administrativo realizado com sucesso',
      session: data.session,
      user: userData,
    });
  } catch (error) {
    console.error('Erro ao fazer login administrativo:', error);
    return res.status(500).json({
      error: 'Erro ao processar login',
    });
  }
}

/**
 * Logout
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return res.status(500).json({
      error: 'Erro ao processar logout',
    });
  }
}

/**
 * Verificar sessão atual
 * GET /api/auth/session
 */
export async function getSession(req, res) {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    return res.status(500).json({
      error: 'Erro ao buscar sessão',
    });
  }
}

/**
 * Solicitar redefinição de senha
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      message: 'E-mail de redefinição enviado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return res.status(500).json({
      error: 'Erro ao processar solicitação',
    });
  }
}
