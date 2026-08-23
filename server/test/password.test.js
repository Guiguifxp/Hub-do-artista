import { hashPassword, verifyPassword } from '../src/services/passwordService.js';

describe('Serviço de Senha (bcrypt) — armazenamento seguro', () => {
  test('hashPassword retorna um hash diferente da senha em texto puro', async () => {
    const senha = 'Senha123!';
    const hash = await hashPassword(senha);

    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(senha);
    expect(hash.length).toBeGreaterThan(10);
    // Formato bcrypt: $2a$/$2b$/$2y$ + custo
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('verifyPassword confirma senha correta', async () => {
    const senha = 'Senha123!';
    const hash = await hashPassword(senha);

    expect(await verifyPassword(senha, hash)).toBe(true);
  });

  test('verifyPassword rejeita senha incorreta', async () => {
    const hash = await hashPassword('Senha123!');

    expect(await verifyPassword('SenhaErrada!', hash)).toBe(false);
  });

  test('verifyPassword retorna false para hash vazio ou ausente', async () => {
    const senha = 'Senha123!';

    expect(await verifyPassword(senha, '')).toBe(false);
    expect(await verifyPassword(senha, null)).toBe(false);
    expect(await verifyPassword(senha, undefined)).toBe(false);
  });

  test('hashPassword lança erro para senha ausente', async () => {
    await expect(hashPassword()).rejects.toThrow();
    await expect(hashPassword('')).rejects.toThrow();
  });
});
