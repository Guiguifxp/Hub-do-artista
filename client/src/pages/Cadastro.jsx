import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Phone, Lock } from 'lucide-react';
import { api } from '../services/api';

function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação de senhas
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!formData.whatsapp.match(/^\d{10,11}$/)) {
      setError('WhatsApp deve conter 10 ou 11 dígitos (apenas números)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.register({
        email: formData.email,
        whatsapp: formData.whatsapp,
        password: formData.password,
      });

      // Redirecionar para login após cadastro
      navigate('/login', { 
        state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' }
      });
    } catch (err) {
      setError(err.message || 'Erro ao criar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Criar Conta</h1>
          <p className="text-text-secondary">Cadastre-se para fazer agendamentos</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-dark-container rounded-lg p-8 border border-gray-800">
          {/* Email */}
          <div className="mb-4">
            <label className="block text-text-primary font-semibold mb-2">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="mb-4">
            <label className="block text-text-primary font-semibold mb-2">
              WhatsApp *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="11999999999"
                className="w-full pl-10 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            <p className="text-text-secondary text-xs mt-1">Apenas números, sem espaços</p>
          </div>

          {/* Senha */}
          <div className="mb-4">
            <label className="block text-text-primary font-semibold mb-2">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            <p className="text-text-secondary text-xs mt-1">Mínimo 8 caracteres</p>
          </div>

          {/* Confirmar Senha */}
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">
              Confirmar Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
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
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Criar Conta
              </>
            )}
          </button>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm mb-2">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Fazer Login
              </Link>
            </p>
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

export default Cadastro;
