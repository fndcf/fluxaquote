import { getTenantId } from '../../utils/requestContext';
import { ForbiddenError } from '../../utils/errors';
import { AuthRequest } from '../../middlewares/authMiddleware';

describe('requestContext', () => {
  describe('getTenantId', () => {
    it('deve retornar tenantId quando presente no request', () => {
      const req = {
        user: {
          uid: 'user-123',
          email: 'teste@test.com',
          tenantId: 'tenant-abc',
          slug: 'empresa-teste',
          role: 'admin',
        },
      } as AuthRequest;

      const result = getTenantId(req);
      expect(result).toBe('tenant-abc');
    });

    it('deve lançar ForbiddenError quando tenantId não existe', () => {
      const req = {
        user: {
          uid: 'user-123',
          email: 'teste@test.com',
          tenantId: '',
          slug: 'empresa-teste',
          role: 'admin',
        },
      } as AuthRequest;

      expect(() => getTenantId(req)).toThrow(ForbiddenError);
      expect(() => getTenantId(req)).toThrow('Tenant não encontrado para este usuário');
    });

    it('deve lançar ForbiddenError quando user é undefined', () => {
      const req = {} as AuthRequest;

      expect(() => getTenantId(req)).toThrow(ForbiddenError);
      expect(() => getTenantId(req)).toThrow('Tenant não encontrado para este usuário');
    });

    it('deve lançar ForbiddenError quando tenantId é undefined', () => {
      const req = {
        user: {
          uid: 'user-123',
          email: 'teste@test.com',
          slug: 'empresa-teste',
          role: 'admin',
        },
      } as AuthRequest;

      expect(() => getTenantId(req)).toThrow(ForbiddenError);
    });
  });
});
