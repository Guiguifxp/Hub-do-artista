import { useState, useCallback } from 'react';

/**
 * Tema claro/escuro da nova identidade.
 * Compartilhado entre as páginas via localStorage (chave "hub_theme");
 * o `data-theme` da página raiz decide quais tokens valem (claro ou escuro).
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('hub_theme') || 'light');

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('hub_theme', next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
