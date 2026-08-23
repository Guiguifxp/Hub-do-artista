import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';

function AdminLogin() {
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

      const response = await api.adminLogin(formData.email, formData.password);
      
      // Salvar token no localStorage
      localStorage.setItem('access_token', response.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirecionar para dashboard administrativo
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Digite seu e-mail para redefinir a senha');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.forgotPassword(formData.email);
      alert('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail de redefinição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Acesso Administrativo</h1>
          <p className="text-text-secondary">Área restrita para administradores</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-dark-container rounded-lg p-8 border border-gray-800">
          {/* Email */}
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@email.com"
                className="w-full pl-12 pr-4 py-4 bg-dark-card border border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-dark-card border border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Esqueci minha senha */}
          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-text-secondary hover:text-primary text-sm transition-colors"
            >
              Esqueci minha senha
            </button>
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
                <Shield className="w-5 h-5" />
                Entrar como Admin
              </>
            )}
          </button>

          {/* Link Voltar */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
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

export default AdminLogin;
