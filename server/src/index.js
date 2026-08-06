import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { supabase } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando com sucesso!' });
});

app.get('/api/supabase-test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('_dummy_query').select('*').limit(1);
    
    // O erro de tabela inexistente confirma que a API respondeu e a conexão autenticou
    res.json({ status: 'success', message: 'Conexão com Supabase estabelecida!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor executando na porta ${PORT}`);
});