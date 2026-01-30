import api from './api';

interface RegisterData {
  nomeEmpresa: string;
  email: string;
  telefone: string;
  senha: string;
}

interface RegisterResponse {
  tenantId: string;
  slug: string;
  uid: string;
}

interface MeResponse {
  tenantId: string;
  slug: string;
  role: string;
  nomeEmpresa: string;
}

export const authService = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  async checkSlug(slug: string): Promise<boolean> {
    const response = await api.get(`/auth/check-slug/${slug}`);
    return response.data.data.exists;
  },

  async getMe(): Promise<MeResponse> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};
