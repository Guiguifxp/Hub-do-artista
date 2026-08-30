import nodemailer from 'nodemailer';
import validator from 'validator';

// Escapa texto fornecido pelo usuário antes de interpolar em HTML (evita XSS no e-mail)
const esc = (value) => validator.escape(String(value ?? ''));

/**
 * Configuração do transporte de e-mail
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Enviar notificação via WhatsApp
 * @param {string} whatsapp - Número do WhatsApp
 * @param {object} data - Dados da notificação
 */
export async function sendWhatsAppNotification(whatsapp, data) {
  try {
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiKey = process.env.WHATSAPP_API_KEY;

    if (!whatsappApiUrl || !whatsappApiKey) {
      throw new Error('Configuração de WhatsApp API não encontrada');
    }

    let mensagem = '';

    switch (data.tipo) {
      case 'confirmacao_recebimento':
        mensagem = `✅ *Solicitação Recebida*\n\nOlá! Recebemos sua solicitação de agendamento para:\n📍 ${data.nome_local}\n📅 Datas: ${data.datas.join(', ')}\n\nEm breve entraremos em contato para confirmar.`;
        break;
      case 'confirmacao_agendamento':
        mensagem = `🎉 *Agendamento Confirmado*\n\nSeu agendamento foi confirmado para:\n📅 ${data.data}\n\nNos vemos em breve!`;
        break;
      case 'recusa_agendamento': {
        const datas = Array.isArray(data.datas) ? data.datas.join(', ') : data.data;
        mensagem = `❌ *Agendamento Não Confirmado*\n\nInfelizmente não foi possível confirmar seu agendamento para:\n📅 ${datas}\n${
          data.motivo ? `\nMotivo: ${data.motivo}\n` : ''
        }\nEntre em contato para verificar outras datas disponíveis.`;
        break;
      }
      default:
        mensagem = 'Notificação do Hub do Artista';
    }

    // Fazer requisição para API do WhatsApp
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappApiKey}`,
      },
      body: JSON.stringify({
        to: whatsapp,
        message: mensagem,
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API retornou status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação via WhatsApp:', error);
    throw error;
  }
}

/**
 * Fallback: Enviar notificação via e-mail
 * @param {string} destinatario - E-mail ou WhatsApp do destinatário
 * @param {object} data - Dados da notificação
 */
export async function sendEmailFallback(destinatario, data) {
  try {
    let assunto = '';
    let corpo = '';

    switch (data.tipo) {
      case 'confirmacao_recebimento':
        assunto = 'Solicitação de Agendamento Recebida';
        corpo = `
          <h2>Solicitação Recebida com Sucesso</h2>
          <p>Olá! Recebemos sua solicitação de agendamento.</p>
          <p><strong>Local:</strong> ${esc(data.nome_local)}</p>
          <p><strong>Datas:</strong> ${esc(data.datas.join(', '))}</p>
          <p>Em breve entraremos em contato para confirmar os detalhes.</p>
        `;
        break;
      case 'confirmacao_agendamento':
        assunto = 'Agendamento Confirmado';
        corpo = `
          <h2>Agendamento Confirmado!</h2>
          <p>Seu agendamento foi confirmado para a data: <strong>${esc(data.data)}</strong></p>
          <p>Nos vemos em breve!</p>
        `;
        break;
      case 'recusa_agendamento': {
        const datas = Array.isArray(data.datas) ? data.datas.join(', ') : data.data;
        assunto = 'Agendamento Não Confirmado';
        corpo = `
          <h2>Agendamento Não Confirmado</h2>
          <p>Infelizmente não foi possível confirmar seu agendamento para: <strong>${esc(datas)}</strong></p>
          ${data.motivo ? `<p><strong>Motivo:</strong> ${esc(data.motivo)}</p>` : ''}
          <p>Entre em contato conosco para verificar outras datas disponíveis.</p>
        `;
        break;
      }
      default:
        assunto = 'Notificação do Hub do Artista';
        corpo = '<p>Você recebeu uma notificação do Hub do Artista.</p>';
    }

    // Se o destinatário é um número de telefone, precisamos de um e-mail
    // Por enquanto, vamos usar o e-mail configurado como padrão
    const emailDestinatario = destinatario.includes('@') 
      ? destinatario 
      : process.env.DEFAULT_NOTIFICATION_EMAIL;

    if (!emailDestinatario) {
      throw new Error('E-mail de destinatário não disponível');
    }

    await transporter.sendMail({
      from: `"Hub do Artista" <${process.env.SMTP_USER}>`,
      to: emailDestinatario,
      subject: assunto,
      html: corpo,
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}
