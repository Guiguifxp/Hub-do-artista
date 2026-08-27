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

/** Pílula CTA primária (gradiente âmbar do tema) */
const CTA_PRIMARY =
  'rounded-full bg-gradient-to-r from-[var(--color-cta-from)] to-[var(--color-cta-to)] hover:from-[var(--color-cta-from-hover)] hover:to-[var(--color-cta-to-hover)] text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-[1.03]';

/** Pílula secundária (contorno do tema) */
const CTA_SECONDARY =
  'rounded-full bg-[var(--color-dark-card)]/70 text-text-primary font-semibold border border-[var(--color-line)] hover:border-primary transition-all';

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
      rotulo: 'Método 020',
      descricao:
        'Aprenda a tocar violão na prática e dominar as suas primeiras 20 músicas — do zero ao seu primeiro repertório.',
      ao: handleExternalCourse,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-dark-bg)]" data-theme="light">
      {/* Barra Superior Fixa — pílula flutuante */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
        <div className="pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-dark-container)]/85 backdrop-blur-md px-3 py-2 shadow-lg">
          <button
            onClick={() => navigateTo(navigate, '/')}
            className="font-display text-xl leading-none text-text-primary px-2 py-1 hover:text-primary transition-colors"
          >
            Lucas Rezende
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo(navigate, '/agendamento')}
              className={`${CTA_PRIMARY} px-4 sm:px-5 py-2 text-sm`}
            >
              Agendar Agora
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleLoginClick}
                  title="Clique para ver as opções da conta"
                  className={`${CTA_SECONDARY} px-4 sm:px-5 py-2 text-sm flex items-center gap-2 max-w-[180px] sm:max-w-[240px]`}
                >
                  {user.role === 'ADMIN' && <Crown className="w-4 h-4 text-primary shrink-0" />}
                  <span className="truncate">logado como: {user.nome || user.email}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-dark-container)] border border-[var(--color-line)] rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--color-line)]">
                      <p className="text-text-primary font-semibold text-sm truncate">
                        {user.nome || 'Usuário'}
                      </p>
                      <p className="text-text-secondary text-xs truncate">{user.email}</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => navigateTo(navigate, '/admin/dashboard')}
                        className="w-full flex items-center gap-2 px-4 py-3 text-text-secondary hover:bg-[var(--color-dark-card)] hover:text-text-primary text-sm transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Painel Administrativo
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-status-error hover:bg-[var(--color-dark-card)] text-sm transition-all border-t border-[var(--color-line)]"
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
                className={`${CTA_SECONDARY} px-4 sm:px-5 py-2 text-sm`}
              >
                Fazer Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-28">
        {/* Hero — identidade editorial sobre atmosfera de imagem velada */}
        <section className="relative min-h-[86vh] flex items-center overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={HERO_ATMOS_URL}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-b from-[var(--color-dark-bg)] via-[var(--color-dark-bg)]/60 to-[var(--color-dark-bg)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(58% 78% at 72% 22%, rgba(217,119,6,.14), transparent 70%)',
            }}
          />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <h1 className="animate-hero font-display text-[clamp(3.2rem,9vw,6rem)] leading-[0.95] tracking-[-0.03em] text-text-primary">
                Lucas <span className="text-primary">Rezende</span>
              </h1>
              <p
                className="animate-hero mt-6 font-display text-2xl md:text-4xl italic text-text-primary/90 leading-snug"
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
                  className={`${CTA_PRIMARY} px-9 py-4 text-base`}
                >
                  Reservar uma data
                </button>
                <button
                  onClick={() => navigateTo(navigate, '/portfolio')}
                  className={`${CTA_SECONDARY} px-9 py-4 text-base`}
                >
                  Ver o trabalho
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* As três portas — índice editorial, sem cards */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-6xl mx-auto border-t border-[var(--color-line)]">
            {destinos.map((d) => (
              <button
                key={d.rotulo}
                onClick={d.ao}
                className="group w-full text-left py-8 md:py-10 border-b border-[var(--color-line)] flex items-start justify-between gap-6 transition-colors hover:bg-primary/[0.04]"
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
        <section className="py-20 md:py-28 px-6 bg-[var(--color-dark-container)]/40 border-y border-[var(--color-line)]">
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
                className={`${CTA_PRIMARY} mt-9 px-9 py-4 text-base`}
              >
                Quero garantir uma data
              </button>
            </div>

            <ul>
              <li className="flex gap-4 border-b border-[var(--color-line)] py-6">
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-text-primary">Repertório para a ocasião</h4>
                  <p className="mt-1.5 text-text-muted leading-relaxed">
                    Do cerimonial à festa, as músicas certas para cada momento do seu evento.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 border-b border-[var(--color-line)] py-6">
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
      <footer className="py-10 px-6 border-t border-[var(--color-line)]">
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
            Método 020
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
