import request from 'supertest';
import express from 'express';
import { supabase } from '../src/config/supabase.js';
import portfolioRoutes from '../src/routes/portfolioRoutes.js';
import authRoutes from '../src/routes/authRoutes.js';
import { securityHeaders, corsOptions } from '../src/middleware/securityMiddleware.js';

const app = express();
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

const emailAdmin = `admin.portfolio.${Date.now()}@test.com`;
const senhaAdmin = 'Admin123!';
let token = null;
let authUserId = null;
let midiaId = null;

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

describe('Integração do Portfólio (upload/delete no Supabase)', () => {
  beforeAll(async () => {
    const c = await supabase.auth.admin.createUser({
      email: emailAdmin,
      password: senhaAdmin,
      email_confirm: true,
    });
    authUserId = c.data.user.id;

    const nome = emailAdmin.split('@')[0];
    await supabase
      .from('usuarios')
      .insert([{ nome, email: emailAdmin, whatsapp: '11999999999', senha_hash: 'x', role: 'ADMIN' }])
      .select();

    const login = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: emailAdmin, password: senhaAdmin });
    token = login.body.session.access_token;
  });

  afterAll(async () => {
    if (midiaId) {
      await request(app).delete(`/api/portfolio/${midiaId}`).set('Authorization', `Bearer ${token}`);
    }
    await supabase.from('usuarios').delete().eq('email', emailAdmin);
    if (authUserId) {
      await supabase.auth.admin.deleteUser(authUserId);
    }
  });

  test('upload de imagem válida retorna 201 com url pública', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tipo', 'imagem')
      .attach('file', png1x1, 'teste-upload.png');

    expect(res.status).toBe(201);
    expect(res.body.midia).toBeTruthy();
    expect(res.body.midia.tipo).toBe('FOTO');
    expect(res.body.midia.url_midia).toContain('portfolio-imagens');
    midiaId = res.body.midia.id;
  });

  test('rejeita extensão não permitida (.exe)', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${token}`)
      .field('tipo', 'imagem')
      .attach('file', png1x1, 'malware.exe');

    expect(res.status).toBe(400);
  });

  test('exige autenticação de administrador (401 sem token)', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .field('tipo', 'imagem')
      .attach('file', png1x1, 'sem-token.png');

    expect(res.status).toBe(401);
  });

  test('deletar mídia retorna 200', async () => {
    const res = await request(app)
      .delete(`/api/portfolio/${midiaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    midiaId = null;
  });
});
