import { supabase } from '../config/supabase.js';
import { sendWhatsAppNotification, sendEmailFallback } from '../services/notificationService.js';

/**
 * Criar nova solicitação de agendamento
 * POST /api/agendamentos
 */
export async function criarAgendamento(req, res) {
  try {
    const { datas, whatsapp_cliente, email_cliente, nome_local, endereco_completo, repertorio, detalhes_adicionais } = req.body;
    const usuario_id = req.user?.id || null; // Pegar do usuário autenticado se houver

    // Validação: Intervalo entre primeira e última data não pode exceder 8 dias
    const datasOrdenadas = [...datas].sort();
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
    // (datas_selecionadas é um array nativo no banco)
    const { data: agendamentosExistentes, error: agendamentosError } = await supabase
      .from('solicitacoes_agendamento')
      .select('datas_selecionadas')
      .contains('datas_selecionadas', datas)
      .eq('status', 'CONFIRMADO');

    if (agendamentosError) {
      throw agendamentosError;
    }

    if (agendamentosExistentes && agendamentosExistentes.length > 0) {
      return res.status(409).json({
        error: 'Uma ou mais datas já possuem agendamentos confirmados',
      });
    }

    // Criar solicitação de agendamento (uma única entrada com múltiplas datas)
    // A coluna de endereço no banco chama-se endereco_local (NOT NULL)
    // criado_em é NOT NULL sem default no banco: é preenchido aqui explicitamente.
    const solicitacao = {
      usuario_id,
      nome_cliente: nome_local,
      nome_local,
      whatsapp_cliente,
      email_cliente: email_cliente || null,
      endereco_local: endereco_completo,
      datas_selecionadas: datas, // Array nativo (coluna do tipo array no banco)
      horario_inicio: '00:00:00', // Placeholder - será definido posteriormente
      horario_fim: '23:59:59',
      status: 'PENDENTE',
      repertorio,
      detalhes_adicionais: detalhes_adicionais || null,
      notificacao_whatsapp_enviada: false,
      notificacao_email_enviada: false,
      criado_em: new Date().toISOString(),
    };

    const { data: novaSolicitacao, error: insertError } = await supabase
      .from('solicitacoes_agendamento')
      .insert([solicitacao])
      .select();

    if (insertError) {
      throw insertError;
    }

    // Tentar enviar notificação via WhatsApp
    let whatsappEnviado = false;
    let emailEnviado = false;

    try {
      await sendWhatsAppNotification(whatsapp_cliente, {
        tipo: 'confirmacao_recebimento',
        nome_local,
        datas,
      });
      whatsappEnviado = true;
    } catch (whatsappError) {
      console.error('Erro ao enviar WhatsApp, tentando fallback por e-mail:', whatsappError);
      
      // Fallback: enviar e-mail
      if (email_cliente) {
        try {
          await sendEmailFallback(email_cliente, {
            tipo: 'confirmacao_recebimento',
            nome_local,
            datas,
          });
          emailEnviado = true;
        } catch (emailError) {
          console.error('Erro no fallback de e-mail:', emailError);
          // Não bloqueia o agendamento se a notificação falhar
        }
      }
    }

    // Atualizar flags de notificação
    if (whatsappEnviado || emailEnviado) {
      await supabase
        .from('solicitacoes_agendamento')
        .update({
          notificacao_whatsapp_enviada: whatsappEnviado,
          notificacao_email_enviada: emailEnviado,
        })
        .eq('id', novaSolicitacao[0].id);
    }

    return res.status(201).json({
      message: 'Solicitação de agendamento criada com sucesso',
      solicitacao: novaSolicitacao[0],
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

    // Buscar agendamentos confirmados e extrair suas datas
    const { data: agendamentosConfirmados, error: agendamentosError } = await supabase
      .from('solicitacoes_agendamento')
      .select('datas_selecionadas')
      .eq('status', 'CONFIRMADO');

    if (agendamentosError) {
      throw agendamentosError;
    }

    // Extrair datas dos agendamentos confirmados (datas_selecionadas é um array nativo)
    const datasDeAgendamentos = [];
    if (agendamentosConfirmados) {
      agendamentosConfirmados.forEach(agendamento => {
        if (agendamento.datas_selecionadas && Array.isArray(agendamento.datas_selecionadas)) {
          datasDeAgendamentos.push(...agendamento.datas_selecionadas);
        }
      });
    }

    // Combinar ambas as fontes de bloqueio
    const bloqueios = new Set([
      ...(datasBloquedas || []).map(d => d.data),
      ...datasDeAgendamentos,
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
      .order('criado_em', { ascending: false })
      .order('id', { ascending: false });

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

    // Se confirmado, bloquear todas as datas (datas_selecionadas é array nativo)
    if (status === 'CONFIRMADO') {
      const datas = agendamento.datas_selecionadas || [];

      // Inserir múltiplas datas bloqueadas
      const datasBloqueadas = datas.map(data => ({ data }));
      const { error: bloqueioError } = await supabase
        .from('datas_bloqueadas')
        .insert(datasBloqueadas);

      if (bloqueioError) {
        console.error('Erro ao bloquear datas:', bloqueioError);
      }

      // Notificar cliente
      try {
        await sendWhatsAppNotification(agendamento.whatsapp_cliente, {
          tipo: 'confirmacao_agendamento',
          nome_cliente: agendamento.nome_cliente,
          datas,
        });
        
        // Atualizar flag de notificação
        await supabase
          .from('solicitacoes_agendamento')
          .update({ notificacao_whatsapp_enviada: true })
          .eq('id', id);
      } catch (whatsappError) {
        console.error('Erro ao enviar notificação de confirmação:', whatsappError);
        
        // Fallback para e-mail
        if (agendamento.email_cliente) {
          try {
            await sendEmailFallback(agendamento.email_cliente, {
              tipo: 'confirmacao_agendamento',
              nome_cliente: agendamento.nome_cliente,
              datas,
            });
            
            // Atualizar flag de notificação
            await supabase
              .from('solicitacoes_agendamento')
              .update({ notificacao_email_enviada: true })
              .eq('id', id);
          } catch (emailError) {
            console.error('Erro no fallback de e-mail:', emailError);
          }
        }
      }
    }

    // Se recusado, notificar cliente
    if (status === 'RECUSADO') {
      const datas = agendamento.datas_selecionadas || [];

      try {
        await sendWhatsAppNotification(agendamento.whatsapp_cliente, {
          tipo: 'recusa_agendamento',
          nome_cliente: agendamento.nome_cliente,
          datas,
        });
        
        await supabase
          .from('solicitacoes_agendamento')
          .update({ notificacao_whatsapp_enviada: true })
          .eq('id', id);
      } catch (whatsappError) {
        console.error('Erro ao enviar notificação de recusa:', whatsappError);
        
        if (agendamento.email_cliente) {
          try {
            await sendEmailFallback(agendamento.email_cliente, {
              tipo: 'recusa_agendamento',
              nome_cliente: agendamento.nome_cliente,
              datas,
            });
            
            await supabase
              .from('solicitacoes_agendamento')
              .update({ notificacao_email_enviada: true })
              .eq('id', id);
          } catch (emailError) {
            console.error('Erro no fallback de e-mail:', emailError);
          }
        }
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
