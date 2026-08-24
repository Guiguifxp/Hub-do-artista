const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Inclui os detalhes de validação (ex: senha sem maiúscula) na mensagem de erro
        let mensagem = data.error || 'Erro na requisição';
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const msgs = data.details.map(d => d.msg).filter(Boolean);
          if (msgs.length > 0) mensagem = `${mensagem}: ${msgs.join('; ')}`;
        }
        const error = new Error(mensagem);
        error.details = data.details;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Agendamentos
  async criarAgendamento(dados) {
    return this.request('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async buscarBloqueios() {
    return this.request('/agendamentos/bloqueios');
  }

  async listarAgendamentos(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/agendamentos${query}`);
  }

  async atualizarStatusAgendamento(id, status, motivo_cancelamento = '') {
    return this.request(`/agendamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, motivo_cancelamento }),
    });
  }

  // Autenticação
  async register(dados) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async adminLogin(email, password) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getSession() {
    return this.request('/auth/session');
  }

  // Portfólio
  async listarPortfolio() {
    return this.request('/portfolio');
  }

  async uploadMidia(formData) {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload');
    }

    return data;
  }

  async deletarMidia(id) {
    return this.request(`/portfolio/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
