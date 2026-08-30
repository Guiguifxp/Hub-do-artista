import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Em produção (Vercel/serverless) o app é exportado como a função serverless,
// então o listen só acontece em ambiente local/desenvolvimento.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor executando na porta ${PORT}`);
  });
}

// Export default para o @vercel/node (Express é detectado e embrulhado automaticamente)
export default app;
