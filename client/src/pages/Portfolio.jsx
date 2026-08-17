import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

function Portfolio() {
  const navigate = useNavigate();
  const [midias, setMidias] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? midias.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === midias.length - 1 ? 0 : prev + 1));
  };

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
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
          <div className="relative aspect-video bg-dark-container rounded-2xl overflow-hidden mb-6 border-2 border-gray-800 shadow-2xl">
            {currentMidia.tipo === 'imagem' ? (
              <img
                src={currentMidia.url}
                alt={currentMidia.nome_arquivo}
                className="w-full h-full object-contain cursor-pointer"
                onClick={handleOpenFullscreen}
              />
            ) : (
              <video
                src={currentMidia.url}
                controls
                className="w-full h-full object-contain"
                onClick={handleOpenFullscreen}
              >
                Seu navegador não suporta vídeos.
              </video>
            )}

            {/* Botões de Navegação */}
            {midias.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark-bg/80 hover:bg-dark-bg text-text-primary rounded-full flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
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

          {/* Informações */}
          <div className="bg-dark-container rounded-2xl p-6 mb-6 border-2 border-gray-800 shadow-lg">
            <p className="text-text-secondary text-sm mb-2">
              {currentIndex + 1} de {midias.length}
            </p>
            <p className="text-text-primary font-semibold text-lg">{currentMidia.nome_arquivo}</p>
          </div>
        </div>

        {/* Botão de Agendamento Fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-dark-container border-t-2 border-gray-800 p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate('/agendamento')}
              className="w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]"
            >
              <Calendar className="w-5 h-5" />
              Fazer Agendamento
            </button>
          </div>
        </div>
      </main>

      {/* Modal Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 w-12 h-12 bg-dark-bg/80 hover:bg-dark-bg text-text-primary rounded-full flex items-center justify-center transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {currentMidia.tipo === 'imagem' ? (
            <img
              src={currentMidia.url}
              alt={currentMidia.nome_arquivo}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={currentMidia.url}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain"
            >
              Seu navegador não suporta vídeos.
            </video>
          )}
        </div>
      )}
    </div>
  );
}

export default Portfolio;
