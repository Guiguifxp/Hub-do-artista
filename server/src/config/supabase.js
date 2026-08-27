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



export const supabase = createClient(supabaseUrl, supabaseKey);


export const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});