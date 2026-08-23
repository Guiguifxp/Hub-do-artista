import { useNavigate } from 'react-router-dom';
import { Music, Calendar, BookOpen } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const handleExternalCourse = () => {
    window.open('https://lucasrezendesv.com.br', '_blank');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Barra Superior Fixa */}
      <header className="fixed top-0 left-0 right-0 h-[30px] bg-dark-container border-b border-gray-800 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => navigate('/agendamento')}
          className="text-xs font-semibold text-text-primary hover:text-primary transition-colors"
        >
          Agendar Agora
        </button>
        <button
          onClick={() => navigate('/login')}
          className="text-xs font-semibold text-text-primary hover:text-primary transition-colors"
        >
          Fazer Login
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-[30px]">
        {/* Seção Hero */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Gradiente de fundo dinâmico */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-bg to-secondary/20 animate-pulse" 
               style={{ animationDuration: '3s' }}>
          </div>
          
          {/* Conteúdo Hero */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <div className="mb-6">
              <Music className="w-20 h-20 mx-auto text-primary mb-4 drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 drop-shadow-lg">
              Hub do Artista
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-lg md:text-xl text-text-secondary/80 mb-8 leading-relaxed">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/agendamento')}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-lg hover:shadow-primary/50"
              >
                Fazer Agendamento
              </button>
              <button
                onClick={() => navigate('/portfolio')}
                className="px-8 py-4 bg-dark-container hover:bg-dark-card text-text-primary font-semibold rounded-2xl border-2 border-gray-700 hover:border-primary transition-all shadow-lg"
              >
                Ver Portfólio
              </button>
            </div>
          </div>
        </section>

        {/* Seção de Rolagem */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Portfólio */}
              <div className="bg-dark-container p-8 rounded-2xl border-2 border-gray-800 hover:border-primary transition-all shadow-lg hover:shadow-primary/20 hover:transform hover:scale-105">
                <div className="mb-4">
                  <Music className="w-14 h-14 text-primary drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  Portfólio
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Confira meus trabalhos anteriores e veja a qualidade da performance ao vivo
                </p>
                <button
                  onClick={() => navigate('/portfolio')}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  Ver Portfólio
                </button>
              </div>

              {/* Card Agendamento */}
              <div className="bg-dark-container p-8 rounded-2xl border-2 border-gray-800 hover:border-secondary transition-all shadow-lg hover:shadow-secondary/20 hover:transform hover:scale-105">
                <div className="mb-4">
                  <Calendar className="w-14 h-14 text-secondary drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  Agendamento
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Reserve as datas do seu evento e receba confirmação em tempo real
                </p>
                <button
                  onClick={() => navigate('/agendamento')}
                  className="w-full px-4 py-3 bg-secondary hover:bg-secondary-hover text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  Fazer Agendamento
                </button>
              </div>

              {/* Card Curso */}
              <div className="bg-dark-container p-8 rounded-2xl border-2 border-gray-800 hover:border-status-success transition-all shadow-lg hover:shadow-status-success/20 hover:transform hover:scale-105">
                <div className="mb-4">
                  <BookOpen className="w-14 h-14 text-status-success drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  Curso Online
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Aprenda técnicas profissionais e desenvolva suas habilidades musicais
                </p>
                <button
                  onClick={handleExternalCourse}
                  className="w-full px-4 py-3 bg-status-success hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  Acessar Curso
                </button>
              </div>
            </div>

            {/* Seção de Informações Adicionais */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                Por que escolher meu trabalho?
              </h2>
              <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center p-6 bg-dark-container rounded-2xl border-2 border-gray-800 hover:border-primary transition-all">
                  <div className="text-5xl font-bold text-primary mb-3 drop-shadow-lg">10+</div>
                  <p className="text-text-primary font-semibold text-lg mb-2">Anos de Experiência</p>
                  <p className="text-text-secondary text-sm">Lorem ipsum dolor sit amet consectetur</p>
                </div>
                <div className="text-center p-6 bg-dark-container rounded-2xl border-2 border-gray-800 hover:border-secondary transition-all">
                  <div className="text-5xl font-bold text-secondary mb-3 drop-shadow-lg">500+</div>
                  <p className="text-text-primary font-semibold text-lg mb-2">Eventos Realizados</p>
                  <p className="text-text-secondary text-sm">Sed do eiusmod tempor incididunt</p>
                </div>
                <div className="text-center p-6 bg-dark-container rounded-2xl border-2 border-gray-800 hover:border-status-success transition-all">
                  <div className="text-5xl font-bold text-status-success mb-3 drop-shadow-lg">100%</div>
                  <p className="text-text-primary font-semibold text-lg mb-2">Clientes Satisfeitos</p>
                  <p className="text-text-secondary text-sm">Ut enim ad minim veniam quis</p>
                </div>
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
