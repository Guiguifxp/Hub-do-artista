import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { navigateTo } from '../services/navigation';

/**
 * Atmosfera do hero: imagem real do portfólio, velada.
 * TROQUE esta URL pela foto oficial do Lucas quando ela chegar.
 */
const HERO_ATMOS_URL =
  'https://dnzkpgnizzhtrkrufcud.supabase.co/storage/v1/object/public/portfolio-imagens/1787534190408_Design-sem-nome-10-e1761345003319.jpg.webp';

function Home() {
  const navigate = useNavigate();
  const user = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Fecha o menu flutuante ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExternalCourse = () => {
    window.open('https://lucasrezendesv.com.br', '_blank');
  };

  const handleLoginClick = () => {
    if (!user) {
      navigateTo(navigate, '/login');
      return;
    }
    setShowUserMenu((v) => !v);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setShowUserMenu(false);
      window.location.href = '/';
    }
  };

  const destinos = [
    {
      rotulo: 'Portfólio',
      descricao:
        'Registros reais de shows e eventos — o palco, o público e a energia de cada apresentação.',
      ao: () => navigateTo(navigate, '/portfolio'),
    },
    {
      rotulo: 'Agendamento',
      descricao:
        'Escolha as datas e envie os detalhes do evento; a confirmação chega direto no seu WhatsApp.',
      ao: () => navigateTo(navigate, '/agendamento'),
    },
    {
      rotulo: 'Curso Dicas Rezende',
      descricao:
        'Aulas práticas de violão, canto e performance para você evoluir no seu ritmo.',
      ao: handleExternalCourse,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Barra Superior Fixa */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-sm border-b border-primary/10 flex items-center justify-between px-4 py-2.5 sm:py-3">
        <button
          onClick={() => navigateTo(navigate, '/agendamento')}
          className="px-4 sm:px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-[1.02]"
        >
          Agendar Agora
        </button>

        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleLoginClick}
              title="Clique para ver as opções da conta"
              className="px-4 sm:px-5 py-2 bg-dark-card text-text-primary text-sm font-semibold rounded-xl border-2 border-primary/25 hover:border-primary transition-all flex items-center gap-2 max-w-[190px] sm:max-w-[260px]"
            >
              {user.role === 'ADMIN' && <Crown className="w-4 h-4 text-primary shrink-0" />}
              <span className="truncate">logado como: {user.nome || user.email}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-dark-container border-2 border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-text-primary font-semibold text-sm truncate">
                    {user.nome || 'Usuário'}
                  </p>
                  <p className="text-text-secondary text-xs truncate">{user.email}</p>
                </div>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => navigateTo(navigate, '/admin/dashboard')}
                    className="w-full flex items-center gap-2 px-4 py-3 text-text-secondary hover:bg-dark-card hover:text-text-primary text-sm transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Painel Administrativo
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-status-error hover:bg-dark-card text-sm transition-all border-t border-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                  Sair (Logout)
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLoginClick}
            className="px-4 sm:px-5 py-2 bg-dark-card text-text-primary text-sm font-semibold rounded-xl border-2 border-primary/25 hover:border-primary transition-all"
          >
            Fazer Login
          </button>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-14">
        {/* Hero — identidade editorial sobre atmosfera de imagem velada */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={HERO_ATMOS_URL}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg/55 to-dark-bg" aria-hidden="true" />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(58% 78% at 72% 22%, rgba(217,119,6,.16), transparent 70%)',
            }}
          />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
            <div className="max-w-3xl">
              <h1
                className="animate-hero font-display text-[clamp(3.2rem,9vw,6rem)] leading-[0.95] tracking-[-0.03em] text-text-primary"
              >
                Lucas <span className="text-primary">Rezende</span>
              </h1>
              <p
                className="animate-hero mt-6 font-display text-2xl md:text-4xl italic text-text-primary/95 leading-snug"
                style={{ animationDelay: '90ms' }}
              >
                Música ao vivo para o seu evento.
              </p>
              <p
                className="animate-hero mt-6 max-w-xl text-lg text-text-muted leading-relaxed"
                style={{ animationDelay: '160ms' }}
              >
                Casamentos, aniversários, empresas e shows — repertório montado para cada
                ocasião, som de qualidade e confirmação direta no seu WhatsApp.
              </p>

              <div
                className="animate-hero mt-10 flex flex-col sm:flex-row gap-4"
                style={{ animationDelay: '230ms' }}
              >
                <button
                  onClick={() => navigateTo(navigate, '/agendamento')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
                >
                  Reservar uma data
                </button>
                <button
                  onClick={() => navigateTo(navigate, '/portfolio')}
                  className="px-8 py-4 bg-dark-container/80 hover:bg-dark-card text-text-primary font-semibold rounded-xl border-2 border-primary/25 hover:border-primary transition-all"
                >
                  Ver o trabalho
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* As três portas — índice editorial, sem cards */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-6xl mx-auto border-t border-primary/20">
            {destinos.map((d) => (
              <button
                key={d.rotulo}
                onClick={d.ao}
                className="group w-full text-left py-8 md:py-10 border-b border-primary/20 flex items-start justify-between gap-6 transition-colors hover:bg-primary/[0.04]"
              >
                <div>
                  <h3 className="font-display text-3xl md:text-5xl text-text-primary transition-colors group-hover:text-primary">
                    {d.rotulo}
                  </h3>
                  <p className="mt-3 max-w-xl text-text-muted leading-relaxed">{d.descricao}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-text-muted shrink-0 mt-2 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </section>

        {/* Por que — sem métricas inventadas, só compromissos reais */}
        <section className="py-20 md:py-28 px-6 bg-dark-container/40 border-y border-primary/10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-text-primary leading-tight">
                A trilha certa para o seu evento
              </h2>
              <p className="mt-6 text-lg text-text-muted leading-relaxed max-w-md">
                Meu trabalho é deixar o seu evento com a música que ele merece — do
                cerimonial à última música da festa, com repertório pensado para a ocasião
                e a estrutura completa de som.
              </p>
              <button
                onClick={() => navigateTo(navigate, '/agendamento')}
                className="mt-9 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
              >
                Quero garantir uma data
              </button>
            </div>

            <ul>
              <li className="flex gap-4 border-b border-primary/10 py-6">
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-text-primary">Repertório para a ocasião</h4>
                  <p className="mt-1.5 text-text-muted leading-relaxed">
                    Do cerimonial à festa, as músicas certas para cada momento do seu evento.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 border-b border-primary/10 py-6">
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-text-primary">Estrutura completa de som</h4>
                  <p className="mt-1.5 text-text-muted leading-relaxed">
                    Som de qualidade preparado para a sua data, do início ao fim.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 py-6">
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-text-primary">Confirmação rápida no WhatsApp</h4>
                  <p className="mt-1.5 text-text-muted leading-relaxed">
                    Você envia os detalhes e recebe a confirmação direto no WhatsApp, sem enrolação.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 Lucas Rezende. Todos os direitos reservados.
          </p>
          <a
            href="https://lucasrezendesv.com.br"
            target="_blank"
            rel="noreferrer"
            className="text-text-muted hover:text-primary text-sm transition-colors"
          >
            Curso Dicas Rezende
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
