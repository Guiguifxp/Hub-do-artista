import { useState, useCallback, useLayoutEffect } from 'react';

/**
 * Tema claro/escuro da nova identidade.
 * Compartilhado entre as páginas via localStorage (chave "hub_theme").
 * Aplica `data-theme` no <html> (fundo de overscroll acompanha o tema) e retorna
 * o estado para as páginas setarem o `data-theme` local.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('hub_theme') || 'light');

  // Aplica no <html> antes da pintura (evita flash e corrige o fundo de overscroll)
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('hub_theme', next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
