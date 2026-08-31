// Função serverless do Vercel: expõe o app Express como handler.
// O @vercel/node detecta api/index.js automaticamente como função em /api.
import app from '../server/src/app.js';

export default app;
