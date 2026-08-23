import request from 'supertest';
import express from 'express';
import { supabase } from '../src/config/supabase.js';
import authRoutes from '../src/routes/authRoutes.js';
import { securityHeaders, corsOptions } from '../src/middleware/securityMiddleware.js';
import { hashPassword, verifyPassword } from '../src/services/passwordService.js';

// App de teste com as rotas reais de autenticação
const app = express();
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use('/api/auth', authRoutes);

// E-mail único por execução para não colidir entre execuções
const emailTeste = `teste.auth.${Date.now()}@test.com`;
const senhaTeste = 'Senha123!';

describe('Integração de Autenticação com o Banco (Supabase)', () => {
  let authUserId = null;

  afterAll(async () => {
    if (authUserId) {
      await supabase.from('usuarios').delete().eq('email', emailTeste);
      await supabase.auth.admin.deleteUser(authUserId);
    }
  });

  test('cadastro grava senha_hash (bcrypt) e login responde 200 com sessão', async () => {
    // Simula o fluxo do register sem disparar e-mail de confirmação real:
    // cria o usuário no Auth já confirmado (admin API) e insere a linha em usuarios
    // com a senha protegida por hash bcrypt (mesma lógica do authController.register).
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: emailTeste,
      password: senhaTeste,
      email_confirm: true,
    });
    expect(createErr).toBeNull();
    authUserId = created.user.id;

    const senha_hash = await hashPassword(senhaTeste);
    expect(senha_hash).not.toBe(senhaTeste);

    const nome = emailTeste.split('@')[0];
    const { data: inserted, error: insertErr } = await supabase
      .from('usuarios')
      .insert([{ nome, email: emailTeste, whatsapp: '11999999999', senha_hash, role: 'CLIENTE' }])
      .select();

    expect(insertErr).toBeNull();
    expect(inserted.length).toBe(1);

    // A linha persistida contém um hash bcrypt que valida a senha original
    const { data: row, error: rowErr } = await supabase
      .from('usuarios')
      .select('senha_hash')
      .eq('email', emailTeste)
      .single();
    expect(rowErr).toBeNull();
    expect(row.senha_hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword(senhaTeste, row.senha_hash)).toBe(true);

    // Login com a senha correta → 200 com sessão e dados do usuário
    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTeste, password: senhaTeste });

    expect(ok.status).toBe(200);
    expect(ok.body.session).toBeTruthy();
    expect(ok.body.user.email).toBe(emailTeste);
    expect(ok.body.user.role).toBe('CLIENTE');
  });

  test('login com senha errada retorna 401 (e não 500)', async () => {
    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTeste, password: 'SenhaErrada!' });

    expect(bad.status).toBe(401);
    expect(bad.body.error).toBeDefined();
  });

  test('usuário no Auth sem linha em usuarios retorna 401 claro (não 500)', async () => {
    const emailOrfao = `orfao.${Date.now()}@test.com`;
    const { data: orfao, error: orfaoErr } = await supabase.auth.admin.createUser({
      email: emailOrfao,
      password: senhaTeste,
      email_confirm: true,
    });
    expect(orfaoErr).toBeNull();

    try {
      const resp = await request(app)
        .post('/api/auth/login')
        .send({ email: emailOrfao, password: senhaTeste });

      // Antes da correção: .single() lançava PGRST116 → 500
      expect(resp.status).toBe(401);
      expect(resp.body.error).toContain('não vinculada');
    } finally {
      await supabase.auth.admin.deleteUser(orfao.user.id);
    }
  });
});
