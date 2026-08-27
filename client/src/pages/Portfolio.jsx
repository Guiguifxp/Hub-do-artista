import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar, Maximize } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import PillBar, { CTA_PRIMARY } from '../components/PillBar';
import { navigateTo } from '../services/navigation';

function Portfolio() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [midias, setMidias] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const touchStartX = useRef(0);

  useEffect(() => {
    carregarPortfolio();
  }, []);

  const carregarPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.listarPortfolio();
      setMidias(data.midias || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar portfólio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (midias.length === 0 ? 0 : prev === 0 ? midias.length - 1 : prev - 1));
  }, [midias.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (midias.length === 0 ? 0 : prev === midias.length - 1 ? 0 : prev + 1));
  }, [midias.length]);

  // Fecha o fullscreen com a tecla Esc e trava o scroll do body
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isFullscreen]);

  // Swipe horizontal (mobile/desktop) para trocar de mídia
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) handleNext();
      else handlePrevious();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-dark-bg)]" data-theme={theme === 'light' ? 'light' : 'dark'}>
        <PillBar theme={theme} onToggleTheme={toggleTheme} />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-text-primary text-xl font-medium mb-6">Carregando portfólio...</p>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-dark-bg)]" data-theme={theme === 'light' ? 'light' : 'dark'}>
        <PillBar theme={theme} onToggleTheme={toggleTheme} />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-status-error text-xl mb-4">{error}</p>
            <button
              onClick={() => navigateTo(navigate, '/')}
              className={`${CTA_PRIMARY} px-8 py-3 text-sm`}
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (midias.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-dark-bg)]" data-theme={theme === 'light' ? 'light' : 'dark'}>
        <PillBar theme={theme} onToggleTheme={toggleTheme} />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-text-secondary text-xl mb-4">Nenhuma mídia disponível no momento</p>
            <button
              onClick={() => navigateTo(navigate, '/')}
              className={`${CTA_PRIMARY} px-8 py-3 text-sm`}
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMidia = midias[currentIndex];

  const renderMidia = (midia, { autoPlay = false, className = '', onClick = null }) => {
    if (midia.tipo === 'FOTO') {
      return (
        <img
          src={midia.url_midia}
          alt={midia.titulo || 'Mídia do portfólio'}
          className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
          draggable={false}
        />
      );
    }
    return (
      <video
        key={currentIndex}
        src={midia.url_midia}
        controls
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        className={className}
      >
        Seu navegador não suporta vídeos.
      </video>
    );
  };

  return (
    <div
      className="min-h-screen bg-[var(--color-dark-bg)]"
      data-theme={theme === 'light' ? 'light' : 'dark'}
    >
      <PillBar theme={theme} onToggleTheme={toggleTheme} />

      <main className="max-w-6xl mx-auto px-4 pt-28 pb-36">
        {/* Cabeçalho editorial */}
        <header className="mb-10 md:mb-14">
          <h1 className="font-display text-5xl md:text-6xl text-text-primary leading-[0.95]">
            Portfólio
          </h1>
          <p className="mt-4 max-w-lg text-lg text-text-muted leading-relaxed">
            Registros reais de shows e eventos — o palco, o público e a energia de cada
            apresentação.
          </p>
        </header>

        {/* Carrossel imersivo */}
        <div
          className="relative aspect-video bg-[var(--color-dark-card)] rounded-2xl overflow-hidden border border-[var(--color-line)] shadow-xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentMidia.tipo === 'FOTO' ? (
            <div className="w-full h-full flex items-center justify-center">
              {renderMidia(currentMidia, { className: 'w-full h-full object-contain', onClick: () => setIsFullscreen(true) })}
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {renderMidia(currentMidia, { className: 'w-full h-full object-contain' })}
              <button
                onClick={() => setIsFullscreen(true)}
                title="Abrir em tela cheia"
                className="absolute bottom-4 right-4 w-11 h-11 bg-[var(--color-dark-bg)]/70 hover:bg-[var(--color-dark-bg)] text-text-primary rounded-full flex items-center justify-center transition-all shadow-lg border border-[var(--color-line)]"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          )}

          {midias.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                aria-label="Mídia anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--color-dark-card)]/80 hover:bg-[var(--color-dark-card)] text-text-primary rounded-full flex items-center justify-center transition-all border border-[var(--color-line)] shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Próxima mídia"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--color-dark-card)]/80 hover:bg-[var(--color-dark-card)] text-text-primary rounded-full flex items-center justify-center transition-all border border-[var(--color-line)] shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores */}
        <div className="flex justify-center gap-2 mt-8">
          {midias.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Mídia ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-8' : 'bg-[var(--color-line)] hover:bg-primary/50'
              }`}
            />
          ))}
        </div>
      </main>

      {/* CTA fixo: Fazer Agendamento (pílula) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-dark-bg)]/85 backdrop-blur-md border-t border-[var(--color-line)] p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigateTo(navigate, '/agendamento')}
            className={`${CTA_PRIMARY} w-full py-4 text-base flex items-center justify-center gap-2`}
          >
            <Calendar className="w-5 h-5" />
            Fazer Agendamento
          </button>
        </div>
      </div>

      {/* Modal Fullscreen com navegação por setas e swipe */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-[#0b0b0e] z-50 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {midias.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                aria-label="Mídia anterior"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Próxima mídia"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-4">
            {currentMidia.tipo === 'FOTO' ? (
              renderMidia(currentMidia, { className: 'max-w-full max-h-full object-contain select-none' })
            ) : (
              <div className="w-full max-w-5xl">
                {renderMidia(currentMidia, { autoPlay: true, className: 'w-full max-h-[85vh] object-contain' })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
