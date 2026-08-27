import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import AuthLayout, { AUTH_INPUT, AUTH_SURFACE, FieldIcon } from '../components/AuthLayout';
import { CTA_PRIMARY } from '../components/PillBar';
import { navigateTo, navigateBack } from '../services/navigation';

function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.login(formData.email, formData.password);

      localStorage.setItem('access_token', response.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigateTo(navigate, response.user.role === 'ADMIN' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} onToggleTheme={toggleTheme}>
      <div className="max-w-md">
        <h2 className="font-display text-3xl md:text-4xl text-text-primary leading-tight">
          Fazer login
        </h2>
        <p className="mt-2 text-text-muted">Entre para acompanhar seus agendamentos.</p>

        <form onSubmit={handleSubmit} className={`${AUTH_SURFACE} mt-8`}>
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">E-mail</label>
            <div className="relative">
              <FieldIcon icon={Mail} filled={!!formData.email} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className={AUTH_INPUT}
                required
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-text-primary font-semibold mb-2">Senha</label>
            <div className="relative">
              <FieldIcon icon={Lock} filled={!!formData.password} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={AUTH_INPUT}
                required
              />
            </div>
          </div>

          <div className="mb-6 mt-2 text-right">
            <button
              type="button"
              onClick={() => navigateTo(navigate, '/esqueci-senha')}
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              Esqueci a senha?
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-status-error/30 bg-status-error/10 p-3">
              <p className="text-status-error text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${CTA_PRIMARY} w-full py-4 text-base flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm mb-2">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-primary hover:underline font-semibold">
                Cadastre-se
              </Link>
            </p>
            <button
              type="button"
              onClick={() => navigateBack(navigate, '/')}
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              ← Voltar para Home
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;
