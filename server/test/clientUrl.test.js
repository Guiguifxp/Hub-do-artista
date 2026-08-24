import { getClientBaseUrl, getLoginRedirectUrl } from '../src/utils/clientUrl.js';

describe('Utils de URL do cliente (redirects de e-mail)', () => {
  const original = process.env.CLIENT_URL;

  afterEach(() => {
    process.env.CLIENT_URL = original;
  });

  test('retorna a primeira origem quando CLIENT_URL tem várias', () => {
    process.env.CLIENT_URL = 'http://localhost:5173,http://192.168.1.12:5173';
    expect(getClientBaseUrl()).toBe('http://localhost:5173');
  });

  test('usa fallback localhost quando CLIENT_URL não existe', () => {
    delete process.env.CLIENT_URL;
    expect(getClientBaseUrl()).toBe('http://localhost:5173');
  });

  test('redirect do login aponta para /login', () => {
    process.env.CLIENT_URL = 'http://localhost:5173';
    expect(getLoginRedirectUrl()).toBe('http://localhost:5173/login');
  });
});
