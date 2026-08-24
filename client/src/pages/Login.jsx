import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';
import { navigateTo, navigateBack } from '../services/navigation';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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
      
      // Salvar token no localStorage
      localStorage.setItem('access_token', response.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Admin vai direto para o dashboard; cliente vai para a Home
      navigateTo(navigate, response.user.role === 'ADMIN' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <LogIn className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Fazer Login</h1>
          <p className="text-text-secondary">Entre com suas credenciais</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-dark-container rounded-lg p-8 border border-gray-800">
          {/* Email */}
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary transition-opacity duration-200 pointer-events-none ${
                  formData.email ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full pl-16 pr-4 py-4 bg-dark-card border border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary transition-opacity duration-200 pointer-events-none ${
                  formData.password ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-16 pr-4 py-4 bg-dark-card border border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-4 bg-status-error/20 border border-status-error rounded-lg p-3">
              <p className="text-status-error text-sm">{error}</p>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
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

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm mb-2">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-primary hover:underline font-semibold">
                Cadastre-se
              </Link>
            </p>
            <button
              type="button"
              onClick={() => navigateBack(navigate, '/')}
              className="text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              ← Voltar para Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
