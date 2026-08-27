import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Phone, Lock, MailCheck } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import AuthLayout, { AUTH_INPUT, AUTH_SURFACE, FieldIcon } from '../components/AuthLayout';
import { CTA_PRIMARY } from '../components/PillBar';
import { navigateTo, navigateBack } from '../services/navigation';

function Cadastro() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('A senha deve conter letras maiúsculas, minúsculas e números');
      return;
    }

    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');

    if (!whatsappLimpo.match(/^\d{10,11}$/)) {
      setError('WhatsApp deve conter 10 ou 11 dígitos (apenas números)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.register({
        email: formData.email,
        whatsapp: whatsappLimpo,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.emailConfirmacaoPendente) {
        setShowEmailModal(true);
        return;
      }

      navigateTo(navigate, '/login', {
        state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' },
      });
    } catch (err) {
      setError(err.message || 'Erro ao criar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} onToggleTheme={toggleTheme}>
      <div className="max-w-md">
        <h2 className="font-display text-3xl md:text-4xl text-text-primary leading-tight">
          Criar conta
        </h2>
        <p className="mt-2 text-text-muted">Cadastre-se para fazer agendamentos.</p>

        <form onSubmit={handleSubmit} className={`${AUTH_SURFACE} mt-8`}>
          <div className="mb-5">
            <label className="block text-text-primary font-semibold mb-2">E-mail *</label>
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

          <div className="mb-5">
            <label className="block text-text-primary font-semibold mb-2">WhatsApp *</label>
            <div className="relative">
              <FieldIcon icon={Phone} filled={!!formData.whatsapp} />
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="11999999999"
                className={AUTH_INPUT}
                required
              />
            </div>
            <p className="text-text-muted text-xs mt-1 ml-1">Apenas números, sem espaços</p>
          </div>

          <div className="mb-5">
            <label className="block text-text-primary font-semibold mb-2">Senha *</label>
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
            <p className="text-text-muted text-xs mt-1 ml-1">
              Mínimo 8 caracteres, com maiúscula, minúscula e número
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">
              Confirmar Senha *
            </label>
            <div className="relative">
              <FieldIcon icon={Lock} filled={!!formData.confirmPassword} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={AUTH_INPUT}
                required
              />
            </div>
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
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Criar Conta
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm mb-2">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Fazer Login
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

      {/* Pop-up central: verificação de e-mail (confirmação habilitada no Supabase) */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--color-dark-container)] rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border border-[var(--color-line)] shadow-2xl">
            <div className="mb-5">
              <MailCheck className="w-16 h-16 mx-auto text-primary" />
            </div>
            <h2 className="font-display text-3xl text-text-primary mb-3">Verifique seu e-mail</h2>
            <p className="text-text-muted mb-2 leading-relaxed">
              Enviamos um link de confirmação para{' '}
              <span className="text-text-primary font-semibold break-all">{formData.email}</span>.
            </p>
            <p className="text-text-muted mb-8 leading-relaxed">
              Acesse sua caixa de entrada, clique no link para confirmar a conta e depois
              faça login para prosseguir.
            </p>
            <button
              onClick={() => navigateTo(navigate, '/login')}
              className={`${CTA_PRIMARY} w-full py-4 text-base`}
            >
              Ir para o Login
            </button>
            <button
              type="button"
              onClick={() => navigateBack(navigate, '/')}
              className="mt-4 text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              ← Voltar para Home
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Cadastro;
