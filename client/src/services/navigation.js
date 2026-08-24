/**
 * Controle da direção das transições de página.
 * 'forward' -> nova tela entra da direita para a esquerda.
 * 'back'    -> volta para a tela anterior (esquerda para a direita).
 *
 * A direção é definida ANTES de cada navegação:
 * - navigateTo() => forward
 * - navigateBack() => back
 * - botão voltar do navegador (popstate) => back
 * - clique em <Link>/<a> => forward
 */
let currentDirection = 'forward';

export function setNavDirection(dir) {
  currentDirection = dir === 'back' ? 'back' : 'forward';
}

export function getNavDirection() {
  return currentDirection;
}

/** Navegação "para frente" (nova tela entra da direita para a esquerda) */
export function navigateTo(navigate, path, options) {
  setNavDirection('forward');
  navigate(path, options);
}

/** Navegação "para trás" (volta da esquerda para a direita) */
export function navigateBack(navigate, path, options) {
  setNavDirection('back');
  navigate(path, options);
}
