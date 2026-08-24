import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar, ArrowLeft, Maximize } from 'lucide-react';
import { api } from '../services/api';

function Portfolio() {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-text-primary text-xl">Carregando portfólio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-status-error text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded transition-all"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  if (midias.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary text-xl mb-4">Nenhuma mídia disponível no momento</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded transition-all"
          >
            Voltar para Home
          </button>
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
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-container border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Portfólio</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Carrossel */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative">
          {/* Mídia Principal */}
          <div
            className="relative aspect-video bg-dark-container rounded-2xl overflow-hidden mb-6 border-2 border-gray-800 shadow-2xl"
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
                {/* Botão fullscreen para vídeo (os controles nativos não abrem o modal) */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  title="Abrir em tela cheia"
                  className="absolute bottom-4 right-4 w-11 h-11 bg-dark-bg/80 hover:bg-dark-bg text-text-primary rounded-full flex items-center justify-center transition-all shadow-lg"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Botões de Navegação */}
            {midias.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  aria-label="Mídia anterior"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark-bg/80 hover:bg-dark-bg text-text-primary rounded-full flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Próxima mídia"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark-bg/80 hover:bg-dark-bg text-text-primary rounded-full flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mb-6">
            {midias.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Botão de Agendamento Fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-dark-container border-t-2 border-gray-800 p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate('/agendamento')}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]"
            >
              <Calendar className="w-5 h-5" />
              Fazer Agendamento
            </button>
          </div>
        </div>
      </main>

      {/* Modal Fullscreen com navegação por setas e swipe */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
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
