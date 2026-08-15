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

    // Criar registro na tabela usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert([{
        id: authData.user.id,
        email,
        whatsapp,
        role: 'CLIENTE',
      }]);

    if (userError) {
      // Tentar deletar o usuário criado no Auth se falhar ao criar na tabela
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso',
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

    // Buscar informações adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, role')
      .eq('id', data.user.id)
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

    // Verificar se usuário tem role ADMIN
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, role')
      .eq('id', data.user.id)
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
