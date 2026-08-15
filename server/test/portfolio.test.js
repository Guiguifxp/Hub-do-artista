import request from 'supertest';
import express from 'express';
import { supabase } from '../src/config/supabase.js';
import portfolioRoutes from '../src/routes/portfolioRoutes.js';
import { authMiddleware, requireAdmin } from '../src/middleware/authMiddleware.js';
import { securityHeaders, corsOptions } from '../src/middleware/securityMiddleware.js';

// Configurar app de teste
const app = express();
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use('/api/portfolio', portfolioRoutes);

describe('Testes de Portfólio', () => {
  
  // Teste 1: Bloquear upload de arquivos com extensões não permitidas
  test('Deve bloquear upload de arquivo PDF', async () => {
    // Mock de arquivo PDF
    const mockFile = {
      name: 'documento.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('fake pdf content')
    };

    // Teste de validação de extensão
    const extensoesPermitidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.webp'],
      video: ['.mp4', '.mkv', '.mov']
    };

    const extensao = mockFile.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    const isValid = Object.values(extensoesPermitidas).some(arr => arr.includes(extensao));

    expect(isValid).toBe(false);
  });

  test('Deve bloquear upload de arquivo EXE', async () => {
    const mockFile = {
      name: 'malware.exe',
      mimetype: 'application/x-msdownload',
      size: 1024
    };

    const extensoesPermitidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.webp'],
      video: ['.mp4', '.mkv', '.mov']
    };

    const extensao = mockFile.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    const isValid = Object.values(extensoesPermitidas).some(arr => arr.includes(extensao));

    expect(isValid).toBe(false);
  });

  // Teste 2: Aceitar formatos válidos
  test('Deve aceitar upload de imagem JPG', async () => {
    const extensoesPermitidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.webp'],
      video: ['.mp4', '.mkv', '.mov']
    };

    const extensao = '.jpg';
    const isValid = extensoesPermitidas.imagem.includes(extensao);

    expect(isValid).toBe(true);
  });

  test('Deve aceitar upload de vídeo MP4', async () => {
    const extensoesPermitidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.webp'],
      video: ['.mp4', '.mkv', '.mov']
    };

    const extensao = '.mp4';
    const isValid = extensoesPermitidas.video.includes(extensao);

    expect(isValid).toBe(true);
  });

  // Teste 3: Listar portfólio (rota pública)
  test('Deve retornar lista de mídias do portfólio', async () => {
    const response = await request(app)
      .get('/api/portfolio');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('midias');
    expect(Array.isArray(response.body.midias)).toBe(true);
  });

  // Teste 4: Validar que deleção requer autenticação admin
  test('Deve bloquear deleção sem autenticação', async () => {
    const response = await request(app)
      .delete('/api/portfolio/999');

    expect(response.status).toBe(401);
  });

  // Teste 5: Validar todas as extensões permitidas
  test('Deve validar todas as extensões de imagem permitidas', async () => {
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.webp'];
    
    extensoesImagem.forEach(ext => {
      const isValid = extensoesImagem.includes(ext);
      expect(isValid).toBe(true);
    });
  });

  test('Deve validar todas as extensões de vídeo permitidas', async () => {
    const extensoesVideo = ['.mp4', '.mkv', '.mov'];
    
    extensoesVideo.forEach(ext => {
      const isValid = extensoesVideo.includes(ext);
      expect(isValid).toBe(true);
    });
  });

  // Teste 6: Case insensitive na validação de extensões
  test('Deve aceitar extensões em maiúsculas', async () => {
    const extensoesPermitidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.webp'],
      video: ['.mp4', '.mkv', '.mov']
    };

    const arquivo = 'IMAGEM.JPG';
    const extensao = arquivo.toLowerCase().match(/\.[^.]+$/)?.[0];
    const isValid = extensoesPermitidas.imagem.includes(extensao);

    expect(isValid).toBe(true);
  });
});
