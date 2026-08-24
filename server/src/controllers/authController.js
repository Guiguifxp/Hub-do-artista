import { supabase, supabaseAuth } from '../config/supabase.js';
import { hashPassword } from '../services/passwordService.js';
import { getLoginRedirectUrl } from '../utils/clientUrl.js';

/**
 * Cadastro de novo usuário (cliente)
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { email, whatsapp, password } = req.body;

    // Criar usuário no Supabase Auth (cliente de auth, separado do cliente de banco).
    // emailRedirectTo: após confirmar o e-mail, o usuário volta para a página de login
    // (sem isso o link cai numa tela JSON do Supabase).
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp(
      {
        email,
        password,
      },
      {
        emailRedirectTo: getLoginRedirectUrl(),
      }
    );

    if (authError) {
      // Traduz o rate limit de e-mail do Supabase para uma mensagem clara
      const mensagem = (authError.message || '').toLowerCase();
      if (mensagem.includes('rate') || mensagem.includes('exceeded') || mensagem.includes('too many')) {
        return res.status(429).json({
          error: 'Limite de envio de e-mails atingido (rate limit do Supabase). Aguarde alguns minutos (até 1 hora) antes de tentar de novo, ou configure um SMTP próprio no painel do Supabase (Authentication → Emails) para enviar sem esse limite.',
        });
      }
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

    // Armazenar a senha de forma segura (hash bcrypt) na coluna senha_hash.
    // A autenticação continua sendo feita via Supabase Auth, mas o hash garante
    // persistência segura da senha no banco.
    const senha_hash = await hashPassword(password);

    // Criar registro na tabela usuarios.
    // O id é gerado pelo serial do banco (a coluna é integer, não uuid).
    // .select() retorna as linhas inseridas: permite detectar inserção silenciosa
    // bloqueada por RLS (data vazia sem erro).
    const { data: insertedRows, error: userError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        whatsapp,
        senha_hash,
        role: 'CLIENTE',
      }])
      .select();

    if (userError || !insertedRows || insertedRows.length === 0) {
      // Rollback: apagar o usuário criado no Auth para não deixar conta órfã
      if (authData?.user?.id) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      if (userError) throw userError;
      throw new Error('Falha ao salvar o usuário no banco de dados (possível bloqueio por RLS)');
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

    // Autenticar com Supabase Auth.
    // IMPORTANTE: usa o cliente supabaseAuth (separado), pois um signIn no
    // cliente admin (supabase) contaminaria a sessão dele e as queries seguintes
    // usariam o JWT do usuário (com RLS) em vez da chave de serviço.
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Diferenciar e-mail não confirmado de credenciais inválidas
      const mensagem = (error.message || '').toLowerCase();
      if (mensagem.includes('not confirmed')) {
        return res.status(403).json({
          error: 'E-mail ainda não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.',
        });
      }
      return res.status(401).json({
        error: 'Credenciais inválidas',
      });
    }

    // Buscar informações adicionais do usuário.
    // A tabela usuarios.id é integer (serial); o vínculo com o Supabase Auth
    // é feito pelo e-mail (único no Auth), não pelo id (uuid).
    // maybeSingle() NÃO lança quando não há registro: evita o erro 500
    // (PGRST116) para contas órfãs (usuário no Auth sem linha em usuarios).
    // nome/whatsapp são retornados para o front (exibir "logado como" e pré-preencher agendamento).
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, whatsapp, role')
      .eq('email', data.user.email)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!userData) {
      return res.status(401).json({
        error: 'Conta não vinculada ao sistema. Cadastre-se novamente para continuar.',
      });
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

    // Autenticar com Supabase Auth.
    // IMPORTANTE: usa o cliente supabaseAuth (separado), pois um signIn no
    // cliente admin (supabase) contaminaria a sessão dele e as queries seguintes
    // usariam o JWT do usuário (com RLS) em vez da chave de serviço.
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Diferenciar e-mail não confirmado de credenciais inválidas
      const mensagem = (error.message || '').toLowerCase();
      if (mensagem.includes('not confirmed')) {
        return res.status(403).json({
          error: 'E-mail ainda não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.',
        });
      }
      return res.status(401).json({
        error: 'Credenciais inválidas',
      });
    }

    // Verificar se usuário tem role ADMIN.
    // Vínculo pelo e-mail (a coluna id da tabela é integer, não uuid do Auth).
    // maybeSingle() evita erro 500 para contas sem registro na tabela usuarios.
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, whatsapp, role')
      .eq('email', data.user.email)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!userData) {
      return res.status(401).json({
        error: 'Conta não vinculada ao sistema. Cadastre-se novamente para continuar.',
      });
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
    const { error } = await supabaseAuth.auth.signOut();

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

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: getLoginRedirectUrl(),
    });

    if (error) {
      // Traduz o rate limit de e-mail do Supabase para uma mensagem clara
      const mensagem = (error.message || '').toLowerCase();
      if (mensagem.includes('rate') || mensagem.includes('too many') || mensagem.includes('exceeded')) {
        return res.status(429).json({
          error: 'Limite de envio de e-mails atingido. Aguarde alguns minutos e tente novamente.',
        });
      }
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
