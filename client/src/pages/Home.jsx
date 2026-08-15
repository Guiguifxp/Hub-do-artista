import { useNavigate } from 'react-router-dom';
import { Music, Calendar, BookOpen } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const handleExternalCourse = () => {
    window.open('https://curso.example.com', '_blank');
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
              <Music className="w-16 h-16 mx-auto text-primary mb-4" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-4">
              Hub do Artista
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8">
              Música ao vivo para transformar seu evento em uma experiência inesquecível
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/agendamento')}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                Fazer Agendamento
              </button>
              <button
                onClick={() => navigate('/portfolio')}
                className="px-8 py-4 bg-dark-container hover:bg-dark-card text-text-primary font-semibold rounded-lg border border-gray-700 transition-all"
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
              <div className="bg-dark-container p-6 rounded-lg border border-gray-800 hover:border-primary transition-all">
                <div className="mb-4">
                  <Music className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Portfólio
                </h3>
                <p className="text-text-secondary mb-4">
                  Confira meus trabalhos anteriores e veja a qualidade da performance ao vivo
                </p>
                <button
                  onClick={() => navigate('/portfolio')}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded transition-all"
                >
                  Ver Portfólio
                </button>
              </div>

              {/* Card Agendamento */}
              <div className="bg-dark-container p-6 rounded-lg border border-gray-800 hover:border-secondary transition-all">
                <div className="mb-4">
                  <Calendar className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Agendamento
                </h3>
                <p className="text-text-secondary mb-4">
                  Reserve as datas do seu evento e receba confirmação em tempo real
                </p>
                <button
                  onClick={() => navigate('/agendamento')}
                  className="w-full px-4 py-2 bg-secondary hover:bg-secondary-hover text-white font-semibold rounded transition-all"
                >
                  Fazer Agendamento
                </button>
              </div>

              {/* Card Curso */}
              <div className="bg-dark-container p-6 rounded-lg border border-gray-800 hover:border-status-success transition-all">
                <div className="mb-4">
                  <BookOpen className="w-12 h-12 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Curso Online
                </h3>
                <p className="text-text-secondary mb-4">
                  Aprenda técnicas profissionais e desenvolva suas habilidades musicais
                </p>
                <button
                  onClick={handleExternalCourse}
                  className="w-full px-4 py-2 bg-status-success hover:bg-green-600 text-white font-semibold rounded transition-all"
                >
                  Acessar Curso
                </button>
              </div>
            </div>

            {/* Seção de Informações Adicionais */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Por que escolher meu trabalho?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">10+</div>
                  <p className="text-text-secondary">Anos de Experiência</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">500+</div>
                  <p className="text-text-secondary">Eventos Realizados</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-status-success mb-2">100%</div>
                  <p className="text-text-secondary">Clientes Satisfeitos</p>
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
