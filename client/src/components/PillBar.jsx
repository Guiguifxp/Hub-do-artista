import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Crown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { navigateTo } from '../services/navigation';

/** Pílula CTA primária (gradiente do tema) */
export const CTA_PRIMARY =
  'rounded-full bg-gradient-to-r from-[var(--color-cta-from)] to-[var(--color-cta-to)] hover:from-[var(--color-cta-from-hover)] hover:to-[var(--color-cta-to-hover)] text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-[1.03]';

/** Pílula secundária (contorno do tema) */
export const CTA_SECONDARY =
  'rounded-full bg-[var(--color-dark-card)]/70 text-text-primary font-semibold border border-[var(--color-line)] hover:border-primary transition-all';

/**
 * Barra superior flutuante em pílula (nova identidade).
 * Wordmark + "Agendar Agora" + alternador de tema + login/menu do usuário.
 */
export default function PillBar({ theme, onToggleTheme }) {
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
      <div className="pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-dark-container)]/85 backdrop-blur-md px-2.5 sm:px-3 py-2 shadow-lg">
        <button
          onClick={() => navigateTo(navigate, '/')}
          className="hidden sm:block font-display text-xl leading-none text-text-primary px-2 py-1 hover:text-primary transition-colors"
        >
          Lucas Rezende
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo(navigate, '/agendamento')}
            className={`${CTA_PRIMARY} px-3.5 sm:px-5 py-2 text-sm`}
          >
            Agendar Agora
          </button>

          {/* Alternar tema claro/escuro (discreto) */}
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Mudar para o tema escuro' : 'Mudar para o tema claro'}
            aria-label="Alternar tema"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-primary border border-[var(--color-line)] bg-[var(--color-dark-card)]/60 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
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
  );
}
