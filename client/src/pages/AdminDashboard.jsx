import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Calendar, 
  Image as ImageIcon, 
  ChevronDown,
  Check,
  X,
  Trash2,
  Upload
} from 'lucide-react';
import { api } from '../services/api';
import { navigateTo } from '../services/navigation';

function AdminDashboard({ initialTab = 'agendamentos' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('TODAS');
  const [expandedId, setExpandedId] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  useEffect(() => {
    if (activeTab === 'agendamentos') {
      carregarAgendamentos();
    } else if (activeTab === 'portfolio') {
      carregarPortfolio();
    }
  }, [activeTab, filtroStatus]);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const status = filtroStatus === 'TODAS' ? undefined : filtroStatus;
      const data = await api.listarAgendamentos(status);
      setAgendamentos(data.agendamentos || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const carregarPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.listarPortfolio();
      setPortfolio(data.midias || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar portfólio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigateTo(navigate, '/');
    }
  };

  const handleAtualizarStatus = async (id, novoStatus) => {
    setMotivoCancelamento('');
    setShowConfirmModal(true);
    setConfirmAction({
      id,
      status: novoStatus,
      message: novoStatus === 'CONFIRMADO' 
        ? 'Deseja realmente confirmar este agendamento? O cliente será notificado.'
        : 'Deseja realmente recusar este agendamento? O cliente será notificado.',
    });
  };

  const confirmarAcao = async () => {
    if (!confirmAction) return;

    try {
      setLoading(true);
      const motivo = confirmAction.status === 'RECUSADO' ? motivoCancelamento.trim() : '';
      await api.atualizarStatusAgendamento(confirmAction.id, confirmAction.status, motivo);
      setShowConfirmModal(false);
      setConfirmAction(null);
      setMotivoCancelamento('');
      await carregarAgendamentos();
    } catch (err) {
      setError('Erro ao atualizar status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMidia = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar extensão
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.webp'];
    const extensoesVideo = ['.mp4', '.mkv', '.mov'];
    const extensao = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];

    let tipo = '';
    if (extensoesImagem.includes(extensao)) {
      tipo = 'imagem';
    } else if (extensoesVideo.includes(extensao)) {
      tipo = 'video';
    } else {
      setError('Formato de arquivo não permitido. Use: JPG, PNG, WEBP, MP4, MKV ou MOV');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', tipo);

      await api.uploadMidia(formData);
      await carregarPortfolio();
      setError('');
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload da mídia');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarMidia = async (id) => {
    if (!confirm('Deseja realmente deletar esta mídia?')) return;

    try {
      setLoading(true);
      await api.deletarMidia(id);
      await carregarPortfolio();
      setError('');
    } catch (err) {
      setError('Erro ao deletar mídia');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMADO':
        return 'text-status-success bg-status-success/20 border-status-success';
      case 'RECUSADO':
        return 'text-status-error bg-status-error/20 border-status-error';
      default:
        return 'text-primary bg-primary/20 border-primary';
    }
  };

  // Formata o array de datas do banco para exibição pt-BR
  const formatarDatas = (datas) => {
    if (!datas) return '—';
    const arr = Array.isArray(datas) ? datas : [datas];
    return arr.map(d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')).join(', ');
  };

  // Formata a data/hora em que a solicitação foi enviada (criado_em)
  const formatarCriadoEm = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-container border-b border-gray-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Painel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-status-error hover:bg-red-600 text-white rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-dark-container border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'agendamentos'
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Agendamentos
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'portfolio'
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              <ImageIcon className="w-5 h-5 inline mr-2" />
              Portfólio
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-status-error/20 border border-status-error rounded-lg p-4">
            <p className="text-status-error">{error}</p>
          </div>
        )}

        {/* Aba Agendamentos */}
        {activeTab === 'agendamentos' && (
          <div>
            {/* Filtros */}
            <div className="mb-6 flex gap-2 flex-wrap">
              {['TODAS', 'PENDENTE', 'CONFIRMADO', 'RECUSADO'].map(status => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg ${
                    filtroStatus === status
                      ? 'bg-primary text-white shadow-primary/30'
                      : 'bg-dark-container text-text-secondary hover:bg-dark-card hover:text-text-primary border-2 border-gray-800'
                  }`}
                >
                  {status === 'TODAS' ? 'Todas' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Lista de Agendamentos */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-text-secondary mt-4">Carregando...</p>
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agendamentos.map(agendamento => (
                  <div
                    key={agendamento.id}
                    className="bg-dark-container rounded-2xl border-2 border-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all"
                  >
                    {/* Header do Card */}
                    <div
                      onClick={() => setExpandedId(expandedId === agendamento.id ? null : agendamento.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-card transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <p className="text-text-primary font-semibold">
                            {agendamento.nome_cliente}
                          </p>
                          <p className="text-text-secondary text-sm">
                            {formatarDatas(agendamento.datas_selecionadas)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${
                          expandedId === agendamento.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Detalhes Expandidos (animação suave de abrir/fechar via grid-rows) */}
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        expandedId === agendamento.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
                      <div className="p-4 border-t border-gray-800 bg-dark-card">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Enviada em:</p>
                            <p className="text-text-primary">{formatarCriadoEm(agendamento.criado_em)}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">WhatsApp:</p>
                            <p className="text-text-primary">{agendamento.whatsapp_cliente}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">E-mail:</p>
                            <p className="text-text-primary">{agendamento.email_cliente || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Datas Selecionadas:</p>
                            <p className="text-text-primary">
                              {formatarDatas(agendamento.datas_selecionadas)}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Endereço:</p>
                            <p className="text-text-primary">{agendamento.endereco_local || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Horário:</p>
                            <p className="text-text-primary">
                              {agendamento.horario_inicio} - {agendamento.horario_fim}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Status:</p>
                            <p className="text-text-primary font-semibold">{agendamento.status}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Local do Evento:</p>
                            <p className="text-text-primary">{agendamento.nome_local || agendamento.nome_cliente}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Repertório:</p>
                            <p className="text-text-primary">{agendamento.repertorio || 'Não informado'}</p>
                          </div>
                        </div>
                        
                        {agendamento.detalhes_adicionais && (
                          <div className="mt-4">
                            <p className="text-text-secondary text-sm mb-1">Detalhes Adicionais:</p>
                            <p className="text-text-primary">{agendamento.detalhes_adicionais}</p>
                          </div>
                        )}

                        {agendamento.status === 'RECUSADO' && agendamento.motivo_cancelamento && (
                          <div className="mt-4 p-4 bg-status-error/10 border border-status-error/30 rounded-xl">
                            <p className="text-text-secondary text-sm mb-1">Motivo do cancelamento:</p>
                            <p className="text-text-primary">{agendamento.motivo_cancelamento}</p>
                          </div>
                        )}

                        {/* Botões de Ação */}
                        {agendamento.status === 'PENDENTE' && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleAtualizarStatus(agendamento.id, 'CONFIRMADO')}
                              className="flex-1 px-4 py-3 bg-status-success hover:bg-green-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                              <Check className="w-5 h-5" />
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleAtualizarStatus(agendamento.id, 'RECUSADO')}
                              className="flex-1 px-4 py-3 bg-status-error hover:bg-red-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                              <X className="w-5 h-5" />
                              Recusar
                            </button>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba Portfólio */}
        {activeTab === 'portfolio' && (
          <div>
            {/* Botão Upload */}
            <div className="mb-6">
              <label className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-[1.02]">
                <Upload className="w-5 h-5" />
                Adicionar Mídia
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mkv,.mov"
                  onChange={handleUploadMidia}
                  className="hidden"
                />
              </label>
              <p className="text-text-secondary text-sm mt-3 ml-1">
                Formatos permitidos: JPG, PNG, WEBP, MP4, MKV, MOV
              </p>
            </div>

            {/* Grid de Mídias */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-text-secondary mt-4">Carregando...</p>
              </div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">Nenhuma mídia no portfólio</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio.map(midia => (
                  <div
                    key={midia.id}
                    className="relative group bg-dark-container rounded-2xl overflow-hidden aspect-square border-2 border-gray-800 hover:border-primary transition-all shadow-lg"
                  >
                    {midia.tipo === 'FOTO' ? (
                      <img
                        src={midia.url_midia}
                        alt={midia.titulo || 'Mídia do portfólio'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={midia.url_midia}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Botão excluir sempre visível (funciona no celular, não depende de hover) */}
                    <button
                      onClick={() => handleDeletarMidia(midia.id)}
                      title="Excluir mídia"
                      className="absolute top-2 right-2 w-10 h-10 bg-status-error/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg z-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Confirmação */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-container rounded-2xl p-8 max-w-md w-full border-2 border-gray-800 shadow-2xl">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Confirmar Ação</h3>
            <p className="text-text-secondary mb-6 leading-relaxed">{confirmAction.message}</p>

            {/* Motivo do cancelamento (opcional, apenas ao recusar) */}
            {confirmAction.status === 'RECUSADO' && (
              <div className="mb-6">
                <label className="block text-text-primary font-semibold mb-2">
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Informe o motivo da recusa para o cliente (pode deixar em branco)"
                  rows={3}
                  className="w-full px-5 py-4 bg-dark-card border-2 border-gray-700 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-text-secondary text-xs mt-2 ml-1">
                  Se preenchido, este motivo será incluído na notificação enviada ao cliente.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                  setMotivoCancelamento('');
                }}
                className="flex-1 px-4 py-3 bg-dark-card hover:bg-gray-700 text-text-primary font-semibold rounded-xl transition-all border-2 border-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover disabled:bg-gray-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                {loading ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
