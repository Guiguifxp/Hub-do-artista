import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import AuthLayout, { AUTH_INPUT, AUTH_SURFACE, FieldIcon } from '../components/AuthLayout';
import { CTA_PRIMARY } from '../components/PillBar';
import { navigateBack } from '../services/navigation';

function EsqueciSenha() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Digite um e-mail válido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} onToggleTheme={toggleTheme}>
      <div className="max-w-md">
        <h2 className="font-display text-3xl md:text-4xl text-text-primary leading-tight">
          Esqueci a senha
        </h2>
        <p className="mt-2 text-text-muted">
          Digite seu e-mail para receber um link de redefinição de senha.
        </p>

        <form onSubmit={handleSubmit} className={`${AUTH_SURFACE} mt-8`}>
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">E-mail</label>
            <div className="relative">
              <FieldIcon icon={Mail} filled={!!email} />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
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
                Enviando...
              </>
            ) : (
              <>Enviar link de recuperação</>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigateBack(navigate, '/login')}
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              ← Voltar para Login
            </button>
          </div>
        </form>
      </div>

      {/* Pop-up de e-mail enviado */}
      {sent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--color-dark-container)] rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border border-[var(--color-line)] shadow-2xl">
            <div className="mb-5">
              <MailCheck className="w-16 h-16 mx-auto text-primary" />
            </div>
            <h2 className="font-display text-3xl text-text-primary mb-3">E-mail enviado!</h2>
            <p className="text-text-muted mb-2 leading-relaxed">
              Enviamos um link de redefinição de senha para{' '}
              <span className="text-text-primary font-semibold break-all">{email}</span>.
            </p>
            <p className="text-text-muted mb-8 leading-relaxed">
              Acesse sua caixa de entrada (verifique também o spam) e clique no link para
              definir uma nova senha.
            </p>
            <button
              onClick={() => navigateBack(navigate, '/login')}
              className={`${CTA_PRIMARY} w-full py-4 text-base`}
            >
              Voltar para Login
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default EsqueciSenha;
