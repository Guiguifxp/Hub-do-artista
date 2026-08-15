import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

function Agendamento() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [datasSelecionadas, setDatasSelecionadas] = useState([]);
  const [datasBloqueadas, setDatasBloqueadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    whatsapp_cliente: '',
    nome_local: '',
    endereco_completo: '',
    repertorio: '',
    detalhes_adicionais: '',
  });

  // Estado do calendário
  const [mesAtual, setMesAtual] = useState(new Date());

  useEffect(() => {
    carregarBloqueios();
  }, []);

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
    
    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < diasAntes; i++) {
      dias.push(null);
    }

    // Dias do mês
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
    
    // Validar intervalo de 8 dias
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
    
    // Validações
    if (!formData.whatsapp_cliente.match(/^\d{10,11}$/)) {
      setError('WhatsApp deve conter 10 ou 11 dígitos');
      return;
    }

    if (!formData.nome_local || !formData.endereco_completo || !formData.repertorio) {
      setError('Preencha todos os campos obrigatórios');
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

  // Modal de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="bg-dark-container rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-status-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Solicitação Enviada!</h2>
          <p className="text-text-secondary mb-6">
            Sua solicitação de agendamento foi recebida com sucesso. Em breve entraremos em contato via WhatsApp para confirmar os detalhes.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Header */}
      <header className="bg-dark-container border-b border-gray-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => etapa === 1 ? navigate('/') : setEtapa(1)}
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-text-primary">
            Agendamento {etapa === 1 ? '- Selecionar Datas' : '- Detalhes do Evento'}
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Etapa 1: Calendário */}
        {etapa === 1 && (
          <div>
            <div className="bg-dark-container rounded-lg p-6 mb-6">
              {/* Navegação do Mês */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleMesAnterior}
                  className="px-4 py-2 bg-dark-card hover:bg-gray-700 text-text-primary rounded transition-all"
                >
                  ← Anterior
                </button>
                <h2 className="text-xl font-bold text-text-primary">
                  {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </h2>
                <button
                  onClick={handleProximoMes}
                  className="px-4 py-2 bg-dark-card hover:bg-gray-700 text-text-primary rounded transition-all"
                >
                  Próximo →
                </button>
              </div>

              {/* Grade do Calendário */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {diasDaSemana.map(dia => (
                  <div key={dia} className="text-center text-text-secondary text-sm font-semibold py-2">
                    {dia}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
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
                      className={`aspect-square rounded-lg font-semibold transition-all ${
                        bloqueada
                          ? 'bg-status-error/20 text-status-error cursor-not-allowed'
                          : selecionada
                          ? 'bg-primary text-white'
                          : 'bg-dark-card hover:bg-gray-700 text-text-primary'
                      }`}
                    >
                      {data.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span className="text-text-secondary">Selecionada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-status-error/20 rounded"></div>
                  <span className="text-text-secondary">Indisponível</span>
                </div>
              </div>
            </div>

            {/* Datas Selecionadas */}
            {datasSelecionadas.length > 0 && (
              <div className="bg-dark-container rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-text-primary mb-2">Datas Selecionadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {datasSelecionadas.sort().map(data => (
                    <span key={data} className="px-3 py-1 bg-primary text-white rounded text-sm">
                      {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-status-error/20 border border-status-error rounded-lg p-4 mb-6">
                <p className="text-status-error">{error}</p>
              </div>
            )}

            <button
              onClick={handleProximaEtapa}
              disabled={datasSelecionadas.length === 0}
              className="w-full px-6 py-4 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
            >
              Solicitar Agendamento
            </button>
          </div>
        )}

        {/* Etapa 2: Formulário de Detalhes */}
        {etapa === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="bg-dark-container rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-text-primary mb-6">Detalhes do Evento</h2>

              {/* WhatsApp */}
              <div className="mb-4">
                <label className="block text-text-primary font-semibold mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp_cliente"
                  value={formData.whatsapp_cliente}
                  onChange={handleInputChange}
                  placeholder="11999999999"
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
                  required
                />
                <p className="text-text-secondary text-sm mt-1">Apenas números, sem espaços ou caracteres especiais</p>
              </div>

              {/* Nome do Local */}
              <div className="mb-4">
                <label className="block text-text-primary font-semibold mb-2">
                  Nome do Local *
                </label>
                <input
                  type="text"
                  name="nome_local"
                  value={formData.nome_local}
                  onChange={handleInputChange}
                  placeholder="Ex: Salão de Festas Premium"
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Endereço */}
              <div className="mb-4">
                <label className="block text-text-primary font-semibold mb-2">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  name="endereco_completo"
                  value={formData.endereco_completo}
                  onChange={handleInputChange}
                  placeholder="Rua, número, bairro, cidade, estado"
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Repertório */}
              <div className="mb-4">
                <label className="block text-text-primary font-semibold mb-2">
                  Repertório de Músicas *
                </label>
                <textarea
                  name="repertorio"
                  value={formData.repertorio}
                  onChange={handleInputChange}
                  placeholder="Liste as músicas ou estilos musicais desejados"
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
                  required
                />
              </div>

              {/* Detalhes Adicionais */}
              <div className="mb-4">
                <label className="block text-text-primary font-semibold mb-2">
                  Detalhes Adicionais (Opcional)
                </label>
                <textarea
                  name="detalhes_adicionais"
                  value={formData.detalhes_adicionais}
                  onChange={handleInputChange}
                  placeholder="Informações extras sobre o evento"
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-status-error/20 border border-status-error rounded-lg p-4 mb-6">
                <p className="text-status-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}

export default Agendamento;
