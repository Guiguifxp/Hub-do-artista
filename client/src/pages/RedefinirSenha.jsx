import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useTheme } from '../hooks/useTheme';
import AuthLayout, { AUTH_INPUT, AUTH_SURFACE, FieldIcon } from '../components/AuthLayout';
import { CTA_PRIMARY } from '../components/PillBar';
import { navigateTo } from '../services/navigation';

function RedefinirSenha() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setHasSession(!!data.session);
      })
      .catch(() => {
        setHasSession(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('A senha deve conter letras maiúsculas, minúsculas e números');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLogin = async () => {
    await supabase.auth.signOut().catch(() => {});
    navigateTo(navigate, '/login');
  };

  if (checking) {
    return (
      <AuthLayout theme={theme} onToggleTheme={toggleTheme}>
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!hasSession) {
    return (
      <AuthLayout theme={theme} onToggleTheme={toggleTheme}>
        <div className="max-w-md text-center">
          <KeyRound className="w-14 h-14 mx-auto mb-5 text-primary" />
          <h2 className="font-display text-3xl text-text-primary mb-3">
            Link inválido ou expirado
          </h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            Este link de redefinição de senha é inválido ou já foi usado. Solicite um novo
            link na tela de "Esqueci a senha".
          </p>
          <button
            onClick={() => navigateTo(navigate, '/login')}
            className={`${CTA_PRIMARY} w-full py-4 text-base`}
          >
            Voltar para Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout theme={theme} onToggleTheme={toggleTheme}>
      <div className="max-w-md">
        <h2 className="font-display text-3xl md:text-4xl text-text-primary leading-tight">
          Redefinir senha
        </h2>
        <p className="mt-2 text-text-muted">Escolha uma nova senha para sua conta.</p>

        <form onSubmit={handleSubmit} className={`${AUTH_SURFACE} mt-8`}>
          <div className="mb-5">
            <label className="block text-text-primary font-semibold mb-2">Nova Senha *</label>
            <div className="relative">
              <FieldIcon icon={Lock} filled={!!password} />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <FieldIcon icon={Lock} filled={!!confirmPassword} />
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Salvando...
              </>
            ) : (
              <>Redefinir senha</>
            )}
          </button>
        </form>
      </div>

      {/* Pop-up de sucesso */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--color-dark-container)] rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border border-[var(--color-line)] shadow-2xl">
            <div className="mb-5">
              <CheckCircle className="w-16 h-16 mx-auto text-status-success" />
            </div>
            <h2 className="font-display text-3xl text-text-primary mb-3">Senha redefinida!</h2>
            <p className="text-text-muted mb-8 leading-relaxed">
              Sua senha foi alterada com sucesso. Agora você já pode fazer login com a nova
              senha.
            </p>
            <button
              onClick={handleGoLogin}
              className={`${CTA_PRIMARY} w-full py-4 text-base`}
            >
              Ir para o Login
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default RedefinirSenha;
