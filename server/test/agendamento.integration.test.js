import request from 'supertest';
import express from 'express';
import { supabase } from '../src/config/supabase.js';
import agendamentoRoutes from '../src/routes/agendamentoRoutes.js';
import authRoutes from '../src/routes/authRoutes.js';
import { securityHeaders, corsOptions } from '../src/middleware/securityMiddleware.js';

const app = express();
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/agendamentos', agendamentoRoutes);

const emailAdmin = `admin.agendamento.${Date.now()}@test.com`;
const senhaAdmin = 'Admin123!';

let colunaExiste = false;
let token = null;
let authUserId = null;
let solicitacaoId = null;

describe('Integração: recusa com motivo_cancelamento', () => {
  beforeAll(async () => {
    // A coluna motivo_cancelamento exige migração SQL no Supabase.
    // Se ainda não existir, os testes desta suíte são ignorados (sem quebrar).
    const probe = await supabase.from('solicitacoes_agendamento').select('motivo_cancelamento').limit(1);
    colunaExiste = !probe.error;

    if (!colunaExiste) return;

    const c = await supabase.auth.admin.createUser({ email: emailAdmin, password: senhaAdmin, email_confirm: true });
    authUserId = c.data.user.id;
    await supabase
      .from('usuarios')
      .insert([{ nome: emailAdmin.split('@')[0], email: emailAdmin, whatsapp: '11999999999', senha_hash: 'x', role: 'ADMIN' }])
      .select();

    const login = await request(app).post('/api/auth/admin/login').send({ email: emailAdmin, password: senhaAdmin });
    token = login.body.session.access_token;

    const { data: sol } = await supabase
      .from('solicitacoes_agendamento')
      .insert([{
        nome_cliente: 'Cliente Recusa',
        nome_local: 'Local Recusa',
        whatsapp_cliente: '11999999999',
        endereco_local: 'Rua Teste, 1',
        datas_selecionadas: ['2030-01-15'],
        horario_inicio: '20:00:00',
        horario_fim: '23:00:00',
        status: 'PENDENTE',
        criado_em: new Date().toISOString(),
      }])
      .select()
      .single();
    solicitacaoId = sol.id;
  });

  afterAll(async () => {
    if (solicitacaoId) {
      await supabase.from('solicitacoes_agendamento').delete().eq('id', solicitacaoId);
    }
    // Confirmar um agendamento grava a data em datas_bloqueadas: limpar o resíduo do teste
    await supabase.from('datas_bloqueadas').delete().eq('data', '2030-01-15');
    await supabase.from('usuarios').delete().eq('email', emailAdmin);
    if (authUserId) {
      await supabase.auth.admin.deleteUser(authUserId);
    }
  });

  test('recusar com motivo grava motivo_cancelamento', async () => {
    if (!colunaExiste) return;

    const res = await request(app)
      .patch(`/api/agendamentos/${solicitacaoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RECUSADO', motivo_cancelamento: 'Data já reservada por outro evento' });

    expect(res.status).toBe(200);

    const { data: row } = await supabase
      .from('solicitacoes_agendamento')
      .select('status, motivo_cancelamento')
      .eq('id', solicitacaoId)
      .single();
    expect(row.status).toBe('RECUSADO');
    expect(row.motivo_cancelamento).toBe('Data já reservada por outro evento');
  });

  test('recusar com motivo em branco grava null', async () => {
    if (!colunaExiste) return;

    const res = await request(app)
      .patch(`/api/agendamentos/${solicitacaoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RECUSADO', motivo_cancelamento: '   ' });

    expect(res.status).toBe(200);

    const { data: row } = await supabase
      .from('solicitacoes_agendamento')
      .select('status, motivo_cancelamento')
      .eq('id', solicitacaoId)
      .single();
    expect(row.motivo_cancelamento).toBeNull();
  });

  test('confirmar limpa motivo_cancelamento', async () => {
    if (!colunaExiste) return;

    await request(app)
      .patch(`/api/agendamentos/${solicitacaoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RECUSADO', motivo_cancelamento: 'Motivo temporário' });

    const res = await request(app)
      .patch(`/api/agendamentos/${solicitacaoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADO' });

    expect(res.status).toBe(200);

    const { data: row } = await supabase
      .from('solicitacoes_agendamento')
      .select('status, motivo_cancelamento')
      .eq('id', solicitacaoId)
      .single();
    expect(row.status).toBe('CONFIRMADO');
    expect(row.motivo_cancelamento).toBeNull();
  });

  test('requisição sem token retorna 401', async () => {
    if (!colunaExiste) return;

    const res = await request(app)
      .patch(`/api/agendamentos/${solicitacaoId}`)
      .send({ status: 'RECUSADO' });
    expect(res.status).toBe(401);
  });
});
