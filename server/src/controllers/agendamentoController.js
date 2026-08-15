import { supabase } from '../config/supabase.js';
import { sendWhatsAppNotification, sendEmailFallback } from '../services/notificationService.js';

/**
 * Criar nova solicitação de agendamento
 * POST /api/agendamentos
 */
export async function criarAgendamento(req, res) {
  try {
    const { datas, whatsapp_cliente, nome_local, endereco_completo, repertorio, detalhes_adicionais } = req.body;

    // Validação: Intervalo entre primeira e última data não pode exceder 8 dias
    const datasOrdenadas = datas.sort();
    const primeiraData = new Date(datasOrdenadas[0]);
    const ultimaData = new Date(datasOrdenadas[datasOrdenadas.length - 1]);
    const diferencaDias = Math.ceil((ultimaData - primeiraData) / (1000 * 60 * 60 * 24));

    if (diferencaDias > 8) {
      return res.status(400).json({
        error: 'O intervalo entre a primeira e última data não pode exceder 8 dias',
      });
    }

    // Verificar se as datas solicitadas já estão bloqueadas
    const { data: bloqueios, error: bloqueiosError } = await supabase
      .from('datas_bloqueadas')
      .select('data')
      .in('data', datas);

    if (bloqueiosError) {
      throw bloqueiosError;
    }

    if (bloqueios && bloqueios.length > 0) {
      const datasBloqueadas = bloqueios.map(b => b.data);
      return res.status(409).json({
        error: 'Uma ou mais datas selecionadas já estão ocupadas',
        datas_bloqueadas: datasBloqueadas,
      });
    }

    // Verificar agendamentos confirmados nas mesmas datas
    const { data: agendamentosExistentes, error: agendamentosError } = await supabase
      .from('solicitacoes_agendamento')
      .select('data_evento')
      .in('data_evento', datas)
      .eq('status', 'CONFIRMADO');

    if (agendamentosError) {
      throw agendamentosError;
    }

    if (agendamentosExistentes && agendamentosExistentes.length > 0) {
      const datasOcupadas = agendamentosExistentes.map(a => a.data_evento);
      return res.status(409).json({
        error: 'Uma ou mais datas já possuem agendamentos confirmados',
        datas_ocupadas: datasOcupadas,
      });
    }

    // Criar solicitações de agendamento para cada data
    const solicitacoes = datas.map(data => ({
      nome_cleinte: nome_local, // Mantendo o nome da coluna conforme especificado
      whatsapp_cleinte: whatsapp_cliente,
      data_evento: data,
      horario_inicio: '00:00:00', // Placeholder - será definido posteriormente
      horario_fim: '23:59:59',
      status: 'PENDENTE',
    }));

    const { data: novasSolicitacoes, error: insertError } = await supabase
      .from('solicitacoes_agendamento')
      .insert(solicitacoes)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Tentar enviar notificação via WhatsApp
    try {
      await sendWhatsAppNotification(whatsapp_cliente, {
        tipo: 'confirmacao_recebimento',
        nome_local,
        datas,
      });
    } catch (whatsappError) {
      console.error('Erro ao enviar WhatsApp, tentando fallback por e-mail:', whatsappError);
      
      // Fallback: enviar e-mail
      try {
        await sendEmailFallback(whatsapp_cliente, {
          tipo: 'confirmacao_recebimento',
          nome_local,
          datas,
        });
      } catch (emailError) {
        console.error('Erro no fallback de e-mail:', emailError);
        // Não bloqueia o agendamento se a notificação falhar
      }
    }

    return res.status(201).json({
      message: 'Solicitação de agendamento criada com sucesso',
      solicitacoes: novasSolicitacoes,
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({
      error: 'Erro interno ao processar solicitação de agendamento',
    });
  }
}

/**
 * Buscar datas bloqueadas
 * GET /api/agendamentos/bloqueios
 */
export async function buscarBloqueios(req, res) {
  try {
    // Buscar datas bloqueadas explicitamente
    const { data: datasBloquedas, error: bloqueiosError } = await supabase
      .from('datas_bloqueadas')
      .select('data');

    if (bloqueiosError) {
      throw bloqueiosError;
    }

    // Buscar agendamentos confirmados
    const { data: agendamentosConfirmados, error: agendamentosError } = await supabase
      .from('solicitacoes_agendamento')
      .select('data_evento')
      .eq('status', 'CONFIRMADO');

    if (agendamentosError) {
      throw agendamentosError;
    }

    // Combinar ambas as fontes de bloqueio
    const bloqueios = new Set([
      ...(datasBloquedas || []).map(d => d.data),
      ...(agendamentosConfirmados || []).map(a => a.data_evento),
    ]);

    return res.status(200).json({
      datas_bloqueadas: Array.from(bloqueios),
    });
  } catch (error) {
    console.error('Erro ao buscar bloqueios:', error);
    return res.status(500).json({
      error: 'Erro ao buscar datas bloqueadas',
    });
  }
}

/**
 * Listar todas as solicitações (rota administrativa)
 * GET /api/agendamentos
 */
export async function listarAgendamentos(req, res) {
  try {
    const { status } = req.query;

    let query = supabase
      .from('solicitacoes_agendamento')
      .select('*')
      .order('data_evento', { ascending: true });

    if (status && ['PENDENTE', 'CONFIRMADO', 'RECUSADO'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: agendamentos, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      agendamentos: agendamentos || [],
    });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return res.status(500).json({
      error: 'Erro ao buscar agendamentos',
    });
  }
}

/**
 * Atualizar status de agendamento (rota administrativa)
 * PATCH /api/agendamentos/:id
 */
export async function atualizarStatusAgendamento(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Buscar agendamento atual
    const { data: agendamento, error: fetchError } = await supabase
      .from('solicitacoes_agendamento')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !agendamento) {
      return res.status(404).json({
        error: 'Agendamento não encontrado',
      });
    }

    // Atualizar status
    const { error: updateError } = await supabase
      .from('solicitacoes_agendamento')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Se confirmado, bloquear a data
    if (status === 'CONFIRMADO') {
      const { error: bloqueioError } = await supabase
        .from('datas_bloqueadas')
        .insert([{ data: agendamento.data_evento }]);

      if (bloqueioError) {
        console.error('Erro ao bloquear data:', bloqueioError);
      }

      // Notificar cliente
      try {
        await sendWhatsAppNotification(agendamento.whatsapp_cleinte, {
          tipo: 'confirmacao_agendamento',
          data: agendamento.data_evento,
        });
      } catch (whatsappError) {
        console.error('Erro ao enviar notificação de confirmação:', whatsappError);
        await sendEmailFallback(agendamento.whatsapp_cleinte, {
          tipo: 'confirmacao_agendamento',
          data: agendamento.data_evento,
        });
      }
    }

    // Se recusado, notificar cliente
    if (status === 'RECUSADO') {
      try {
        await sendWhatsAppNotification(agendamento.whatsapp_cleinte, {
          tipo: 'recusa_agendamento',
          data: agendamento.data_evento,
        });
      } catch (whatsappError) {
        console.error('Erro ao enviar notificação de recusa:', whatsappError);
        await sendEmailFallback(agendamento.whatsapp_cleinte, {
          tipo: 'recusa_agendamento',
          data: agendamento.data_evento,
        });
      }
    }

    return res.status(200).json({
      message: 'Status atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar status do agendamento',
    });
  }
}
