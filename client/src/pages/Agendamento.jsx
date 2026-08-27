import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import PillBar, { CTA_PRIMARY } from '../components/PillBar';
import { navigateBack } from '../services/navigation';

const INPUT_CLASS =
  'w-full px-5 py-4 bg-[var(--color-dark-card)] border border-[var(--color-line)] rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all';

function Agendamento() {
  const navigate = useNavigate();
  const user = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [etapa, setEtapa] = useState(1);
  const [datasSelecionadas, setDatasSelecionadas] = useState([]);
  const [datasBloqueadas, setDatasBloqueadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    whatsapp_cliente: '',
    email_cliente: '',
    horario_inicio: '',
    horario_fim: '',
    nome_local: '',
    endereco_completo: '',
    repertorio: '',
    detalhes_adicionais: '',
  });

  // Pré-preencher e-mail e WhatsApp com os dados do usuário logado (editáveis)
  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      whatsapp_cliente: prev.whatsapp_cliente || user.whatsapp || '',
      email_cliente: prev.email_cliente || user.email || '',
    }));
  }, [user]);

  // Estado do calendário
  const [mesAtual, setMesAtual] = useState(new Date());

  useEffect(() => {
    carregarBloqueios();
  }, []);

  // Alerta de perda de informação antes de reiniciar/fechar a página
  const temInformacaoPendente = () => {
    if (etapa === 2) return true;
    if (datasSelecionadas.length > 0) return true;
    return Object.values(formData).some(v => v.trim() !== '');
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!temInformacaoPendente()) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  const handleVoltar = () => {
    if (etapa === 2) {
      setEtapa(1);
    } else {
      navigateBack(navigate, '/');
    }
  };

  const carregarBloqueios = async () => {
    try {
      const data = await api.buscarBloqueios();
      setDatasBloqueadas(data.datas_bloqueadas || []);
    } catch (err) {
      console.error('Erro ao carregar bloqueios:', err);
    }
  };

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasAntes = primeiroDia.getDay();
    const diasNoMes = ultimoDia.getDate();

    const dias = [];

    for (let i = 0; i < diasAntes; i++) {
      dias.push(null);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (data >= hoje) {
        dias.push(data);
      } else {
        dias.push(null);
      }
    }

    return dias;
  };

  const formatarData = (data) => {
    if (!data) return '';
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const isDataBloqueada = (data) => {
    if (!data) return false;
    const dataFormatada = formatarData(data);
    return datasBloqueadas.includes(dataFormatada);
  };

  const isDataSelecionada = (data) => {
    if (!data) return false;
    const dataFormatada = formatarData(data);
    return datasSelecionadas.includes(dataFormatada);
  };

  const handleSelecionarData = (data) => {
    if (!data || isDataBloqueada(data)) return;

    const dataFormatada = formatarData(data);

    if (isDataSelecionada(data)) {
      setDatasSelecionadas(datasSelecionadas.filter(d => d !== dataFormatada));
      setError('');
      return;
    }

    const novasDatas = [...datasSelecionadas, dataFormatada];

    if (novasDatas.length > 1) {
      const datasOrdenadas = novasDatas.sort();
      const primeiraData = new Date(datasOrdenadas[0]);
      const ultimaData = new Date(datasOrdenadas[datasOrdenadas.length - 1]);
      const diferencaDias = Math.ceil((ultimaData - primeiraData) / (1000 * 60 * 60 * 24));

      if (diferencaDias > 8) {
        setError('O intervalo entre a primeira e última data não pode exceder 8 dias');
        return;
      }
    }

    setDatasSelecionadas(novasDatas);
    setError('');
  };

  const handleMesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  };

  const handleProximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  };

  const handleProximaEtapa = () => {
    if (datasSelecionadas.length === 0) {
      setError('Selecione ao menos uma data');
      return;
    }
    setError('');
    setEtapa(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.whatsapp_cliente.match(/^\d{10,11}$/)) {
      setError('WhatsApp deve conter 10 ou 11 dígitos');
      return;
    }

    if (!formData.nome_local || !formData.endereco_completo || !formData.repertorio) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.horario_inicio || !formData.horario_fim) {
      setError('Preencha os horários de início e fim do evento');
      return;
    }

    if (formData.horario_fim <= formData.horario_inicio) {
      setError('O horário de fim deve ser após o horário de início');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.criarAgendamento({
        datas: datasSelecionadas,
        ...formData,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const ErrorBox = () =>
    error ? (
      <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-4">
        <p className="text-status-error">{error}</p>
      </div>
    ) : null;

  const SectionLabel = ({ children }) => (
    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted mb-5">
      {children}
    </h2>
  );

  // Modal de sucesso
  if (success) {
    return (
      <div
        className="min-h-screen bg-[var(--color-dark-bg)]"
        data-theme={theme === 'light' ? 'light' : 'dark'}
      >
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-[var(--color-dark-container)] rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border border-[var(--color-line)] shadow-2xl">
            <CheckCircle className="w-16 h-16 text-status-success mx-auto mb-5" />
            <h2 className="font-display text-3xl text-text-primary mb-3">
              Solicitação enviada!
            </h2>
            <p className="text-text-muted mb-8 leading-relaxed">
              Sua solicitação de agendamento foi recebida com sucesso. Em breve entraremos
              em contato via WhatsApp para confirmar os detalhes.
            </p>
            <button
              onClick={() => navigateBack(navigate, '/')}
              className={`${CTA_PRIMARY} w-full py-4 text-base`}
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--color-dark-bg)]"
      data-theme={theme === 'light' ? 'light' : 'dark'}
    >
      <PillBar theme={theme} onToggleTheme={toggleTheme} />

      {/* Brilho âmbar suave ao fundo */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(52% 42% at 80% 0%, rgba(217,119,6,.10), transparent 62%)',
        }}
      />

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-40">
        {/* Cabeçalho editorial + stepper */}
        <header className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl text-text-primary leading-[0.95]">
            {etapa === 1 ? 'Escolha suas datas' : 'Detalhes do evento'}
          </h1>
          <div className="mt-6 flex items-center gap-3 text-sm">
            <span className={etapa === 1 ? 'text-primary font-semibold' : 'text-text-muted'}>
              1 · Datas
            </span>
            <span className="w-8 h-px bg-[var(--color-line)]" aria-hidden="true" />
            <span className={etapa === 2 ? 'text-primary font-semibold' : 'text-text-muted'}>
              2 · Detalhes
            </span>
          </div>
          {etapa === 1 && (
            <p className="mt-4 max-w-md text-text-muted leading-relaxed">
              Escolha as datas do seu evento — até 8 dias seguidos. A confirmação chega
              direto no seu WhatsApp.
            </p>
          )}
        </header>

        {/* Etapa 1: Calendário */}
        {etapa === 1 && (
          <section>
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-dark-container)]/50 p-4 sm:p-6 md:p-8">
              {/* Navegação do mês — chevrons em pílulas */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleMesAnterior}
                  aria-label="Mês anterior"
                  className="w-11 h-11 rounded-full border border-[var(--color-line)] bg-[var(--color-dark-card)]/70 text-text-primary hover:text-primary hover:border-primary flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-display text-2xl text-text-primary">
                  {meses[mesAtual.getMonth()]} {meses[mesAtual.getFullYear()]}
                </h2>
                <button
                  onClick={handleProximoMes}
                  aria-label="Próximo mês"
                  className="w-11 h-11 rounded-full border border-[var(--color-line)] bg-[var(--color-dark-card)]/70 text-text-primary hover:text-primary hover:border-primary flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Cabeçalho da semana */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1">
                {diasDaSemana.map(dia => (
                  <div
                    key={dia}
                    className="text-center text-xs sm:text-sm text-text-muted font-medium uppercase tracking-wide py-2"
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* Grade de dias */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {getDiasDoMes().map((data, index) => {
                  if (!data) {
                    return <div key={index} className="aspect-square"></div>;
                  }

                  const bloqueada = isDataBloqueada(data);
                  const selecionada = isDataSelecionada(data);

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelecionarData(data)}
                      disabled={bloqueada}
                      className={`aspect-square rounded-xl font-semibold text-sm sm:text-base transition-all ${
                        bloqueada
                          ? 'text-text-secondary/40 cursor-not-allowed line-through'
                          : selecionada
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-text-primary hover:bg-[var(--color-dark-card)] hover:border-primary/40 border border-transparent'
                      }`}
                    >
                      {data.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-primary" aria-hidden="true" />
                  Selecionada
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-md border border-[var(--color-line)] bg-[var(--color-dark-card)]"
                    aria-hidden="true"
                  />
                  Disponível
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-md bg-[var(--color-line)] line-through"
                    aria-hidden="true"
                  />
                  Indisponível
                </div>
              </div>
            </div>

            {/* Datas selecionadas */}
            {datasSelecionadas.length > 0 && (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-[var(--color-dark-container)]/40 p-5">
                <h3 className="font-semibold text-text-primary mb-3">Suas datas:</h3>
                <div className="flex flex-wrap gap-2">
                  {datasSelecionadas.sort().map(data => (
                    <span
                      key={data}
                      className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold"
                    >
                      {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <ErrorBox />
            </div>
          </section>
        )}

        {/* Etapa 2: Formulário por contexto */}
        {etapa === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-dark-container)]/50 p-6 md:p-10">
              {/* Seus contatos */}
              <SectionLabel>Seus contatos</SectionLabel>
              <div className="space-y-5">
                <div className="animate-cascade" style={{ animationDelay: '0ms' }}>
                  <label className="block text-text-primary font-semibold mb-2">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_cliente"
                    value={formData.whatsapp_cliente}
                    onChange={handleInputChange}
                    placeholder="11999999999"
                    className={INPUT_CLASS}
                    required
                  />
                  <p className="text-text-muted text-sm mt-2 ml-1">
                    Apenas números, sem espaços ou caracteres especiais
                  </p>
                </div>
                <div className="animate-cascade" style={{ animationDelay: '80ms' }}>
                  <label className="block text-text-primary font-semibold mb-2">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    name="email_cliente"
                    value={formData.email_cliente}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <hr className="my-8 border-[var(--color-line)]" />

              {/* O evento */}
              <SectionLabel>O evento</SectionLabel>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-cascade" style={{ animationDelay: '160ms' }}>
                  <div>
                    <label className="block text-text-primary font-semibold mb-2">
                      Horário de Início *
                    </label>
                    <input
                      type="time"
                      name="horario_inicio"
                      value={formData.horario_inicio}
                      onChange={handleInputChange}
                      className={INPUT_CLASS}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-text-primary font-semibold mb-2">
                      Horário de Fim *
                    </label>
                    <input
                      type="time"
                      name="horario_fim"
                      value={formData.horario_fim}
                      onChange={handleInputChange}
                      className={INPUT_CLASS}
                      required
                    />
                  </div>
                </div>
                <div className="animate-cascade" style={{ animationDelay: '240ms' }}>
                  <label className="block text-text-primary font-semibold mb-2">
                    Nome do Local *
                  </label>
                  <input
                    type="text"
                    name="nome_local"
                    value={formData.nome_local}
                    onChange={handleInputChange}
                    placeholder="Ex: Salão de Festas Premium"
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div className="animate-cascade" style={{ animationDelay: '320ms' }}>
                  <label className="block text-text-primary font-semibold mb-2">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    name="endereco_completo"
                    value={formData.endereco_completo}
                    onChange={handleInputChange}
                    placeholder="Rua, número, bairro, cidade, estado"
                    className={INPUT_CLASS}
                    required
                  />
                </div>
              </div>

              <hr className="my-8 border-[var(--color-line)]" />

              {/* A música */}
              <SectionLabel>A música</SectionLabel>
              <div className="space-y-5">
                <div className="animate-cascade" style={{ animationDelay: '400ms' }}>
                  <label className="block text-text-primary font-semibold mb-2">
                    Repertório de Músicas *
                  </label>
                  <textarea
                    name="repertorio"
                    value={formData.repertorio}
                    onChange={handleInputChange}
                    placeholder="Liste as músicas ou estilos musicais desejados"
                    rows={4}
                    className={`${INPUT_CLASS} resize-none`}
                    required
                  />
                </div>
                <div className="animate-cascade" style={{ animationDelay: '480ms' }}>
                  <label className="block text-text-primary font-semibold mb-2">
                    Detalhes Adicionais (Opcional)
                  </label>
                  <textarea
                    name="detalhes_adicionais"
                    value={formData.detalhes_adicionais}
                    onChange={handleInputChange}
                    placeholder="Informações extras sobre o evento"
                    rows={3}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <ErrorBox />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${CTA_PRIMARY} w-full mt-8 py-4 text-base flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  Enviar Solicitação
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* CTA flutuante (etapa 1, com data selecionada) */}
      {etapa === 1 && datasSelecionadas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-dark-bg)]/85 backdrop-blur-md border-t border-[var(--color-line)] p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleProximaEtapa}
              className={`${CTA_PRIMARY} w-full py-4 text-base flex items-center justify-center gap-2`}
            >
              <CalendarIcon className="w-5 h-5" />
              Solicitar Agendamento ({datasSelecionadas.length}{' '}
              {datasSelecionadas.length === 1 ? 'data' : 'datas'})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendamento;
