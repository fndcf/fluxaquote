import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../services/authService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('deve enviar dados de registro e retornar resultado', async () => {
      const registerData = {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        telefone: '11999999999',
        senha: '123456',
      };
      const responseData = {
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        uid: 'uid-123',
      };

      (api.post as any).mockResolvedValue({
        data: { data: responseData },
      });

      const result = await authService.register(registerData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(responseData);
    });

    it('deve propagar erro do api', async () => {
      (api.post as any).mockRejectedValue(new Error('Network error'));

      await expect(
        authService.register({
          nomeEmpresa: 'Teste',
          email: 'test@test.com',
          telefone: '11999999999',
          senha: '123456',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('checkSlug', () => {
    it('deve retornar true quando slug existe', async () => {
      (api.get as any).mockResolvedValue({
        data: { data: { exists: true } },
      });

      const result = await authService.checkSlug('empresa-teste');

      expect(api.get).toHaveBeenCalledWith('/auth/check-slug/empresa-teste');
      expect(result).toBe(true);
    });

    it('deve retornar false quando slug não existe', async () => {
      (api.get as any).mockResolvedValue({
        data: { data: { exists: false } },
      });

      const result = await authService.checkSlug('slug-novo');

      expect(result).toBe(false);
    });
  });

  describe('getMe', () => {
    it('deve retornar dados do tenant', async () => {
      const meData = {
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        role: 'admin',
        nomeEmpresa: 'Empresa Teste',
      };

      (api.get as any).mockResolvedValue({
        data: { data: meData },
      });

      const result = await authService.getMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(meData);
    });

    it('deve propagar erro do api', async () => {
      (api.get as any).mockRejectedValue(new Error('Unauthorized'));

      await expect(authService.getMe()).rejects.toThrow('Unauthorized');
    });
  });
});
