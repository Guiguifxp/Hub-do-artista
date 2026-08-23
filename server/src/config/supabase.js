import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// O servidor usa a chave de SERVIÇO (service role / sb_secret_...) para operar
// no banco (inserir/consultar em usuarios) e nas rotas admin, pois ela ignora RLS.
// Prefere SUPABASE_SERVICE_ROLE_KEY e mantém SUPABASE_KEY como compatibilidade.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_KEY) devem ser definidas no arquivo .env');
}

/**
 * Cliente "admin" (chave de serviço): usado para TODAS as operações no banco
 * (supabase.from('tabela')) e no admin API (supabase.auth.admin.*).
 * NUNCA chamar signInWithPassword/signUp neste cliente — o login de um usuário
 * "contaminaria" a sessão dele, fazendo as queries seguintes usarem o JWT do
 * usuário (com RLS aplicada) em vez da chave de serviço, quebrando o login.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Cliente "auth" (também com a chave de serviço): usado EXCLUSIVAMENTE para
 * fluxos de autenticação (signUp, signInWithPassword, resetPasswordForEmail,
 * getUser). persistSession:false garante que a sessão do usuário não fique
 * persistida e não interfira nas queries feitas pelo cliente admin.
 */
export const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});