import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import { api } from '../services/api';
import { navigateBack } from '../services/navigation';

function EsqueciSenha() {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Esqueci a senha</h1>
          <p className="text-text-secondary">
            Digite seu e-mail para receber um link de redefinição de senha
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-dark-container rounded-lg p-8 border border-gray-800">
          <div className="mb-6">
            <label className="block text-text-primary font-semibold mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary transition-opacity duration-200 pointer-events-none ${
                  email ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
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
              className="text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              ← Voltar para Login
            </button>
          </div>
        </form>
      </div>

      {/* Pop-up de e-mail enviado */}
      {sent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-dark-container rounded-2xl p-8 sm:p-10 max-w-md w-full text-center border-2 border-status-success/30 shadow-2xl">
            <div className="mb-5">
              <MailCheck className="w-20 h-20 mx-auto text-primary drop-shadow-lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
              E-mail enviado!
            </h2>
            <p className="text-text-secondary mb-2 leading-relaxed">
              Enviamos um link de redefinição de senha para{' '}
              <span className="text-text-primary font-semibold break-all">{email}</span>.
            </p>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Acesse sua caixa de entrada (verifique também o spam) e clique no link para
              definir uma nova senha.
            </p>
            <button
              onClick={() => navigateBack(navigate, '/login')}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EsqueciSenha;
