import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Image as ImageIcon,
  ChevronDown,
  Check,
  X,
  Trash2,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import PillBar, { CTA_PRIMARY, CTA_SECONDARY } from '../components/PillBar';
import { navigateTo } from '../services/navigation';

function AdminDashboard({ initialTab = 'agendamentos' }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
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
        return 'text-status-success bg-status-success/15 border-status-success/40';
      case 'RECUSADO':
        return 'text-status-error bg-status-error/15 border-status-error/40';
      default:
        return 'text-primary bg-primary/15 border-primary/40';
    }
  };

  const formatarDatas = (datas) => {
    if (!datas) return '—';
    const arr = Array.isArray(datas) ? datas : [datas];
    return arr.map(d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')).join(', ');
  };

  const formatarCriadoEm = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  };

  const DetalheItem = ({ label, value }) => (
    <div>
      <p className="text-text-muted text-sm mb-1">{label}</p>
      <p className="text-text-primary">{value || 'Não informado'}</p>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[var(--color-dark-bg)]"
      data-theme={theme === 'light' ? 'light' : 'dark'}
    >
      <PillBar theme={theme} onToggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-16">
        {/* Cabeçalho do painel + "Ver site" */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-text-primary leading-[0.95]">
              Painel Administrativo
            </h1>
            <p className="mt-2 text-text-muted">Gerencie os pedidos e o portfólio.</p>
          </div>
          <button
            onClick={() => navigateTo(navigate, '/')}
            className={`${CTA_SECONDARY} px-5 py-2.5 text-sm flex items-center gap-2`}
            title="Ver o site pelo lado do cliente"
          >
            <ExternalLink className="w-4 h-4" />
            Ver site
          </button>
        </header>

        {/* Tabs (pílulas) */}
        <div className="inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-dark-container)]/50 p-1 mb-8">
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'agendamentos'
                ? 'bg-primary text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Agendamentos
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-primary text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Portfólio
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-status-error/30 bg-status-error/10 p-4">
            <p className="text-status-error">{error}</p>
          </div>
        )}

        {/* Aba Agendamentos */}
        {activeTab === 'agendamentos' && (
          <div>
            <div className="mb-6 flex gap-2 flex-wrap">
              {['TODAS', 'PENDENTE', 'CONFIRMADO', 'RECUSADO'].map(status => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    filtroStatus === status
                      ? 'bg-primary text-white shadow'
                      : 'border border-[var(--color-line)] bg-[var(--color-dark-container)]/50 text-text-muted hover:text-text-primary'
                  }`}
                >
                  {status === 'TODAS' ? 'Todas' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-text-muted mt-4">Carregando...</p>
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-14 h-14 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agendamentos.map(agendamento => (
                  <div
                    key={agendamento.id}
                    className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-dark-container)]/50 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedId(expandedId === agendamento.id ? null : agendamento.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--color-dark-card)]/50 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="min-w-0">
                          <p className="text-text-primary font-semibold truncate">
                            {agendamento.nome_cliente}
                          </p>
                          <p className="text-text-muted text-sm truncate">
                            {formatarDatas(agendamento.datas_selecionadas)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border shrink-0 ${getStatusColor(agendamento.status)}`}
                        >
                          {agendamento.status}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-text-muted transition-transform duration-300 shrink-0 ${
                          expandedId === agendamento.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Detalhes Expandidos (animação suave) */}
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        expandedId === agendamento.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div className="p-5 border-t border-[var(--color-line)]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <DetalheItem label="Enviada em" value={formatarCriadoEm(agendamento.criado_em)} />
                            <DetalheItem label="WhatsApp" value={agendamento.whatsapp_cliente} />
                            <DetalheItem label="E-mail" value={agendamento.email_cliente} />
                            <DetalheItem label="Datas selecionadas" value={formatarDatas(agendamento.datas_selecionadas)} />
                            <DetalheItem label="Endereço" value={agendamento.endereco_local} />
                            <DetalheItem
                              label="Horário"
                              value={`${agendamento.horario_inicio} - ${agendamento.horario_fim}`}
                            />
                            <DetalheItem label="Status" value={agendamento.status} />
                            <DetalheItem label="Local do evento" value={agendamento.nome_local || agendamento.nome_cliente} />
                            <DetalheItem label="Repertório" value={agendamento.repertorio} />
                          </div>

                          {agendamento.detalhes_adicionais && (
                            <DetalheItem label="Detalhes adicionais" value={agendamento.detalhes_adicionais} />
                          )}

                          {agendamento.status === 'RECUSADO' && agendamento.motivo_cancelamento && (
                            <div className="mt-4 p-4 rounded-xl bg-status-error/10 border border-status-error/30">
                              <p className="text-text-muted text-sm mb-1">Motivo do cancelamento:</p>
                              <p className="text-text-primary">{agendamento.motivo_cancelamento}</p>
                            </div>
                          )}

                          {agendamento.status === 'PENDENTE' && (
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleAtualizarStatus(agendamento.id, 'CONFIRMADO')}
                                className="flex-1 px-4 py-3 rounded-full bg-status-success hover:bg-green-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Confirmar
                              </button>
                              <button
                                onClick={() => handleAtualizarStatus(agendamento.id, 'RECUSADO')}
                                className="flex-1 px-4 py-3 rounded-full bg-status-error hover:bg-red-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
                              >
                                <X className="w-4 h-4" />
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
            <div className="mb-6">
              <label className={`${CTA_PRIMARY} inline-flex items-center gap-2 px-6 py-3 text-sm cursor-pointer`}>
                <Upload className="w-4 h-4" />
                Adicionar Mídia
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mkv,.mov"
                  onChange={handleUploadMidia}
                  className="hidden"
                />
              </label>
              <p className="text-text-muted text-sm mt-3 ml-1">
                Formatos permitidos: JPG, PNG, WEBP, MP4, MKV, MOV
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-text-muted mt-4">Carregando...</p>
              </div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="w-14 h-14 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">Nenhuma mídia no portfólio</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio.map(midia => (
                  <div
                    key={midia.id}
                    className="relative bg-[var(--color-dark-card)] rounded-2xl overflow-hidden aspect-square border border-[var(--color-line)] hover:border-primary transition-all"
                  >
                    {midia.tipo === 'FOTO' ? (
                      <img
                        src={midia.url_midia}
                        alt={midia.titulo || 'Mídia do portfólio'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video src={midia.url_midia} className="w-full h-full object-cover" />
                    )}

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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-dark-container)] rounded-3xl p-8 max-w-md w-full border border-[var(--color-line)] shadow-2xl">
            <h3 className="font-display text-2xl text-text-primary mb-4">Confirmar Ação</h3>
            <p className="text-text-muted mb-6 leading-relaxed">{confirmAction.message}</p>

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
                  className="w-full px-5 py-4 bg-[var(--color-dark-card)] border border-[var(--color-line)] rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-text-muted text-xs mt-2 ml-1">
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
                className="flex-1 px-4 py-3 rounded-full border border-[var(--color-line)] bg-[var(--color-dark-card)] text-text-primary font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-full bg-primary hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all"
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
