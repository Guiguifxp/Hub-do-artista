import PillBar from './PillBar';

/** Input padrão dos formulários de auth (com espaço para ícone à esquerda) */
export const AUTH_INPUT =
  'w-full pl-16 pr-4 py-4 bg-[var(--color-dark-card)] border border-[var(--color-line)] rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all';

/** Superfície do formulário (hairline) */
export const AUTH_SURFACE =
  'rounded-2xl border border-[var(--color-line)] bg-[var(--color-dark-container)]/50 p-6 md:p-8';

/** Ícone interno dos campos (some ao digitar) */
export function FieldIcon({ icon: Icon, filled }) {
  return (
    <Icon
      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted transition-opacity duration-200 pointer-events-none ${
        filled ? 'opacity-0' : 'opacity-100'
      }`}
    />
  );
}

/**
 * Layout split com identidade: marca (nome em serifa + linha) à esquerda,
 * formulário à direita; empilha no mobile. Tema claro/escuro via data-theme.
 */
export default function AuthLayout({ theme, onToggleTheme, children }) {
  return (
    <div
      className="min-h-screen bg-[var(--color-dark-bg)]"
      data-theme={theme === 'light' ? 'light' : 'dark'}
    >
      <PillBar theme={theme} onToggleTheme={onToggleTheme} />

      {/* Atmosfera: dois brilhos quentes com respiração lenta */}
      <div
        className="fixed inset-0 pointer-events-none animate-ambient"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(55% 45% at 82% 0%, rgba(217,119,6,.18), transparent 62%), radial-gradient(45% 40% at 8% 100%, rgba(245,158,11,.12), transparent 62%)',
        }}
      />

      <main className="relative z-10 min-h-screen w-full max-w-6xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Painel de identidade */}
        <div className="flex flex-col">
          <h1 className="font-display text-4xl md:text-6xl text-text-primary leading-[0.95]">
            Lucas <span className="text-primary">Rezende</span>
          </h1>
          <p className="mt-3 font-display text-xl md:text-2xl italic text-text-primary/80">
            Música ao vivo para o seu evento.
          </p>
          <p className="mt-5 max-w-sm text-text-muted leading-relaxed">
            Casamentos, aniversários, empresas e shows — repertório montado para cada
            ocasião, com confirmação direto no WhatsApp.
          </p>
        </div>

        {/* Formulário */}
        <div>{children}</div>
      </main>
    </div>
  );
}
