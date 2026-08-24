import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Calendar, BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { navigateTo } from '../services/navigation';

/**
 * Componente de revelação no scroll (IntersectionObserver)
 * Faz o conteúdo aparecer suavemente ao entrar na viewport.
 * À prova de falhas: se o observer não disparar em 1.2s, o conteúdo aparece mesmo assim.
 */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);

    // Fallback de segurança: nunca deixar conteúdo invisível
    const timeout = setTimeout(() => setVisible(true), 1200);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`w-full transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

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
    // Usuário logado: abre o menu flutuante (logout / painel)
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
      // Recarrega a página por completo para limpar todo o estado de login
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Barra Superior Fixa */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-container/90 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 py-2 sm:py-3">
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
              className="px-4 sm:px-5 py-2 bg-dark-card text-text-primary text-sm font-semibold rounded-xl border-2 border-gray-700 hover:border-primary transition-all flex items-center gap-1 max-w-[180px] sm:max-w-[260px]"
            >
              <span className="truncate">
                {user.role === 'ADMIN' ? '👑 ' : ''}logado como: {user.nome || user.email}
              </span>
            </button>

            {/* Menu flutuante de conta */}
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
            className="px-4 sm:px-5 py-2 bg-dark-card text-text-primary text-sm font-semibold rounded-xl border-2 border-gray-700 hover:border-primary hover:bg-dark-card transition-all"
          >
            Fazer Login
          </button>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-16">
        {/* Seção Hero com o gradiente dinâmico original (laranja/âmbar sobre preto).
            O fundo global fixo do App.jsx segue por baixo durante a rolagem. */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Gradiente do hero */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-bg to-secondary/20 animate-pulse"
            style={{ animationDuration: '3s' }}
          ></div>

          {/* Conteúdo Hero */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <Reveal>
              <div className="mb-6">
                <Music className="w-20 h-20 mx-auto text-primary mb-4 drop-shadow-lg" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 drop-shadow-lg">
                Lucas Rezende
              </h1>
              <p className="text-xl md:text-2xl text-text-primary mb-4 leading-relaxed font-medium">
                Música ao vivo que transforma seu evento em uma experiência inesquecível
              </p>
              <p className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed">
                Casamentos, aniversários, empresas e shows: repertório personalizado,
                estrutura completa e a energia certa para cada ocasião.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigateTo(navigate, '/agendamento')}
                  className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-lg hover:shadow-primary/50"
                >
                  Fazer Agendamento
                </button>
                <button
                  onClick={() => navigateTo(navigate, '/portfolio')}
                  className="px-10 py-4 bg-dark-container hover:bg-dark-card text-text-primary font-semibold rounded-2xl border-2 border-gray-700 hover:border-primary transition-all shadow-lg"
                >
                  Ver Portfólio
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Seção de Rolagem */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Portfólio */}
              <Reveal delay={0}>
                <div className="bg-dark-container p-8 rounded-2xl border-2 border-gray-800 hover:border-primary transition-all shadow-lg hover:shadow-primary/20 hover:transform hover:scale-105 h-full">
                  <div className="mb-4">
                    <Music className="w-14 h-14 text-primary drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    Portfólio
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Veja registros de shows e eventos reais: a energia da performance
                    ao vivo, o palco, o público e os bastidores de cada apresentação.
                  </p>
                  <button
                    onClick={() => navigateTo(navigate, '/portfolio')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                  >
                    Ver Portfólio
                  </button>
                </div>
              </Reveal>

              {/* Card Agendamento */}
              <Reveal delay={150}>
                <div className="bg-dark-container p-8 rounded-2xl border-2 border-gray-800 hover:border-secondary transition-all shadow-lg hover:shadow-secondary/20 hover:transform hover:scale-105 h-full">
                  <div className="mb-4">
                    <Calendar className="w-14 h-14 text-secondary drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    Agendamento
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Escolha as datas, conte os detalhes do seu evento e receba a
                    confirmação direto no seu WhatsApp. Simples, rápido e sem complicação.
                  </p>
                  <button
                    onClick={() => navigateTo(navigate, '/agendamento')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                  >
                    Fazer Agendamento
                  </button>
                </div>
              </Reveal>

              {/* Card Curso */}
              <Reveal delay={300}>
                <div className="bg-dark-container p-8 rounded-2xl border-2 border-gray-800 hover:border-primary transition-all shadow-lg hover:shadow-primary/20 hover:transform hover:scale-105 h-full">
                  <div className="mb-4">
                    <BookOpen className="w-14 h-14 text-primary drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    Curso Online
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Aprenda no seu ritmo com o Dicas Rezende: aulas práticas de
                    violão, canto e performance para você evoluir de verdade.
                  </p>
                  <button
                    onClick={handleExternalCourse}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                  >
                    Acessar Curso
                  </button>
                </div>
              </Reveal>
            </div>

            {/* Seção de Informações Adicionais */}
            <div className="mt-16 text-center">
              <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                  Por que escolher meu trabalho?
                </h2>
                <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
                  Música ao vivo de verdade, com repertório montado para cada ocasião,
                  som de qualidade e uma apresentação que o público sente. Do cerimonial
                  à última música da festa, tudo pensado para o seu evento ser inesquecível.
                </p>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <Reveal delay={0}>
                  <div className="text-center p-6 bg-dark-container rounded-2xl border-2 border-gray-800 hover:border-primary transition-all">
                    <div className="text-5xl font-bold text-primary mb-3 drop-shadow-lg">10+</div>
                    <p className="text-text-primary font-semibold text-lg mb-2">Anos de Experiência</p>
                    <p className="text-text-secondary text-sm">Palco, repertório vasto e segurança em cada apresentação</p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="text-center p-6 bg-dark-container rounded-2xl border-2 border-gray-800 hover:border-secondary transition-all">
                    <div className="text-5xl font-bold text-secondary mb-3 drop-shadow-lg">500+</div>
                    <p className="text-text-primary font-semibold text-lg mb-2">Eventos Realizados</p>
                    <p className="text-text-secondary text-sm">Casamentos, corporativos e festas em todo o Brasil</p>
                  </div>
                </Reveal>
                <Reveal delay={300}>
                  <div className="text-center p-6 bg-dark-container rounded-2xl border-2 border-gray-800 hover:border-primary transition-all">
                    <div className="text-5xl font-bold text-primary mb-3 drop-shadow-lg">100%</div>
                    <p className="text-text-primary font-semibold text-lg mb-2">Clientes Satisfeitos</p>
                    <p className="text-text-secondary text-sm">Recomendações que se transformam em novos eventos</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark-container border-t border-gray-800 py-6 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-text-secondary text-sm">
            © 2026 Hub do Artista. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
