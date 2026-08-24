import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { navigateTo } from '../services/navigation';

function RedefinirSenha() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // O link de recuperação chega com o token na URL; o cliente Supabase detecta
    // automaticamente (implicit/PKCE) e o getSession devolve a sessão de recovery.
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center bg-dark-container rounded-2xl p-8 border-2 border-gray-800 shadow-lg">
          <KeyRound className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-4">Link inválido ou expirado</h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Este link de redefinição de senha é inválido ou já foi usado. Solicite um novo
            link na tela de "Esqueci a senha".
          </p>
          <button
            onClick={() => navigateTo(navigate, '/login')}
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <KeyRound className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Redefinir senha</h1>
          <p className="text-text-secondary">Escolha uma nova senha para sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-container rounded-lg p-8 border border-gray-800">
          <div className="mb-5">
            <label className="block text-text-primary font-semibold mb-2">Nova Senha *</label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary transition-opacity duration-200 pointer-events-none ${
                  password ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-16 pr-4 py-4 bg-dark-card border border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <p className="text-text-secondary text-xs mt-1 ml-1">Mínimo 8 caracteres, com maiúscula, minúscula e número</p>
          </div>

          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">Confirmar Nova Senha *</label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary transition-opacity duration-200 pointer-events-none ${
                  confirmPassword ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-16 pr-4 py-4 bg-dark-card border border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-status-error/20 border border-status-error rounded-lg p-3">
              <p className="text-status-error text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-dark-container rounded-2xl p-8 sm:p-10 max-w-md w-full text-center border-2 border-status-success/30 shadow-2xl">
            <div className="mb-5">
              <CheckCircle className="w-20 h-20 mx-auto text-status-success drop-shadow-lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">Senha redefinida!</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Sua senha foi alterada com sucesso. Agora você já pode fazer login com a nova senha.
            </p>
            <button
              onClick={handleGoLogin}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]"
            >
              Ir para o Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RedefinirSenha;
