import { authService } from '../../services/authService';
import { auth } from '../../config/firebase';
import { tenantRepository } from '../../repositories/tenantRepository';
import { ValidationError } from '../../utils/errors';

jest.mock('../../repositories/tenantRepository', () => ({
  tenantRepository: {
    slugExists: jest.fn(),
    createTenantWithTransaction: jest.fn(),
    findUserTenant: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../../config/firebase', () => ({
  auth: {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
  },
  db: {
    collection: jest.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validData = {
      nomeEmpresa: 'Empresa Teste',
      email: 'teste@empresa.com',
      telefone: '11999999999',
      senha: '123456',
    };

    it('deve registrar com sucesso', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-123' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(validData);

      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('uid', 'uid-123');
      expect(result.slug).toBe('empresa-teste');
    });

    it('deve gerar slug a partir do nome da empresa', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-123' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register({
        ...validData,
        nomeEmpresa: 'Minha Empresa Incrível',
      });

      expect(result.slug).toBe('minha-empresa-incrivel');
    });

    it('deve adicionar sufixo quando slug já existe', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(true);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-456' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(validData);

      // Slug deve ter sufixo
      expect(result.slug).toMatch(/^empresa-teste-[a-z0-9]+$/);
    });

    it('deve gerar slug fallback para nomes sem caracteres válidos', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-789' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register({
        ...validData,
        nomeEmpresa: '!!!---!!!',
      });

      expect(result.slug).toMatch(/^empresa-[a-z0-9]+$/);
    });

    it('deve criar usuário no Firebase Auth', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-auth' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      await authService.register(validData);

      expect(auth.createUser).toHaveBeenCalledWith({
        email: 'teste@empresa.com',
        password: '123456',
        displayName: 'Empresa Teste',
      });
    });

    it('deve lançar ValidationError para email já cadastrado', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockRejectedValue({ code: 'auth/email-already-exists' });

      await expect(authService.register(validData)).rejects.toThrow(ValidationError);
      await expect(authService.register(validData)).rejects.toThrow('Este email já está cadastrado');
    });

    it('deve re-lançar erros não relacionados ao Auth', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      const genericError = new Error('Erro genérico');
      (auth.createUser as jest.Mock).mockRejectedValue(genericError);

      await expect(authService.register(validData)).rejects.toThrow('Erro genérico');
    });

    it('deve criar tenant com transação', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-tx' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      await authService.register(validData);

      expect(tenantRepository.createTenantWithTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'empresa-teste',
          nomeEmpresa: 'Empresa Teste',
          email: 'teste@empresa.com',
          telefone: '11999999999',
          ownerId: 'uid-tx',
        })
      );
    });

    it('deve deletar usuário Auth se criação do tenant falhar', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-cleanup' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockRejectedValue(
        new Error('Firestore error')
      );

      await expect(authService.register(validData)).rejects.toThrow('Firestore error');
      expect(auth.deleteUser).toHaveBeenCalledWith('uid-cleanup');
    });

    it('deve lançar ValidationError quando SLUG_EXISTS na transação', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-slug' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockRejectedValue(
        new Error('SLUG_EXISTS')
      );

      await expect(authService.register(validData)).rejects.toThrow(ValidationError);
      await expect(authService.register(validData)).rejects.toThrow(
        'Não foi possível criar a empresa. Tente novamente.'
      );
      expect(auth.deleteUser).toHaveBeenCalledWith('uid-slug');
    });

    it('deve setar custom claims após criação do tenant', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-claims' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(validData);

      expect(auth.setCustomUserClaims).toHaveBeenCalledWith('uid-claims', {
        tenantId: result.tenantId,
        slug: 'empresa-teste',
        role: 'admin',
      });
    });

    it('deve remover acentos do slug', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);
      (auth.createUser as jest.Mock).mockResolvedValue({ uid: 'uid-accent' });
      (tenantRepository.createTenantWithTransaction as jest.Mock).mockResolvedValue(undefined);
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register({
        ...validData,
        nomeEmpresa: 'Proteção & Segurança Ltda',
      });

      expect(result.slug).toBe('protecao-seguranca-ltda');
    });
  });

  describe('checkSlug', () => {
    it('deve retornar true quando slug existe', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(true);

      const result = await authService.checkSlug('empresa-teste');

      expect(result).toBe(true);
      expect(tenantRepository.slugExists).toHaveBeenCalledWith('empresa-teste');
    });

    it('deve retornar false quando slug não existe', async () => {
      (tenantRepository.slugExists as jest.Mock).mockResolvedValue(false);

      const result = await authService.checkSlug('slug-inexistente');

      expect(result).toBe(false);
    });
  });

  describe('getMe', () => {
    it('deve retornar dados do tenant para usuário válido', async () => {
      (tenantRepository.findUserTenant as jest.Mock).mockResolvedValue({
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        role: 'admin',
      });
      (tenantRepository.findById as jest.Mock).mockResolvedValue({
        id: 'tenant-123',
        nomeEmpresa: 'Empresa Teste',
        slug: 'empresa-teste',
      });

      const result = await authService.getMe('uid-123');

      expect(result).toEqual({
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        role: 'admin',
        nomeEmpresa: 'Empresa Teste',
      });
    });

    it('deve retornar null quando userTenant não existe', async () => {
      (tenantRepository.findUserTenant as jest.Mock).mockResolvedValue(null);

      const result = await authService.getMe('uid-inexistente');

      expect(result).toBeNull();
      expect(tenantRepository.findById).not.toHaveBeenCalled();
    });

    it('deve retornar null quando tenant não existe', async () => {
      (tenantRepository.findUserTenant as jest.Mock).mockResolvedValue({
        tenantId: 'tenant-orphan',
        slug: 'slug-orphan',
        role: 'admin',
      });
      (tenantRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await authService.getMe('uid-orphan');

      expect(result).toBeNull();
    });
  });
});
