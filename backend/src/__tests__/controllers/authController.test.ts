import { Request, Response, NextFunction } from 'express';
import { authController } from '../../controllers/authController';
import { authService } from '../../services/authService';
import { AuthRequest } from '../../middlewares/authMiddleware';

jest.mock('../../services/authService', () => ({
  authService: {
    register: jest.fn(),
    checkSlug: jest.fn(),
    getMe: jest.fn(),
  },
}));

describe('authController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar com sucesso e retornar 201', async () => {
      const registerData = {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        telefone: '11999999999',
        senha: '123456',
      };
      const registerResult = {
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        uid: 'uid-123',
      };

      mockReq.body = registerData;
      (authService.register as jest.Mock).mockResolvedValue(registerResult);

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: registerResult,
      });
    });

    it('deve chamar next com erro de validação para dados inválidos', async () => {
      mockReq.body = {
        nomeEmpresa: 'AB',
        email: 'invalido',
        telefone: '123',
        senha: '12',
      };

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('deve chamar next com erro quando body está vazio', async () => {
      mockReq.body = {};

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('deve chamar next com erro quando service falha', async () => {
      mockReq.body = {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        telefone: '11999999999',
        senha: '123456',
      };
      const error = new Error('Erro no registro');
      (authService.register as jest.Mock).mockRejectedValue(error);

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve construir mensagem de erro concatenando erros de validação', async () => {
      mockReq.body = {
        nomeEmpresa: 'AB',
        email: 'invalido',
        telefone: '123',
        senha: '12',
      };

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.message).toContain(',');
    });
  });

  describe('checkSlug', () => {
    it('deve retornar exists: true quando slug existe', async () => {
      mockReq.params = { slug: 'empresa-teste' };
      (authService.checkSlug as jest.Mock).mockResolvedValue(true);

      await authController.checkSlug(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { exists: true },
      });
    });

    it('deve retornar exists: false quando slug não existe', async () => {
      mockReq.params = { slug: 'slug-novo' };
      (authService.checkSlug as jest.Mock).mockResolvedValue(false);

      await authController.checkSlug(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { exists: false },
      });
    });

    it('deve chamar next com erro quando service falha', async () => {
      mockReq.params = { slug: 'erro-slug' };
      const error = new Error('Erro ao verificar slug');
      (authService.checkSlug as jest.Mock).mockRejectedValue(error);

      await authController.checkSlug(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('me', () => {
    it('deve retornar dados do tenant para usuário autenticado', async () => {
      const tenantInfo = {
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        role: 'admin',
        nomeEmpresa: 'Empresa Teste',
      };
      (mockReq as any).user = { uid: 'uid-123' };
      (authService.getMe as jest.Mock).mockResolvedValue(tenantInfo);

      await authController.me(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: tenantInfo,
      });
    });

    it('deve chamar next com NotFoundError quando uid não existe', async () => {
      (mockReq as any).user = undefined;

      await authController.me(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.message).toBe('Usuário não encontrado');
    });

    it('deve chamar next com NotFoundError quando tenant não encontrado', async () => {
      (mockReq as any).user = { uid: 'uid-orphan' };
      (authService.getMe as jest.Mock).mockResolvedValue(null);

      await authController.me(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const errorArg = (mockNext as jest.Mock).mock.calls[0][0];
      expect(errorArg.message).toBe('Tenant não encontrado para este usuário');
    });

    it('deve chamar next com erro quando service falha', async () => {
      (mockReq as any).user = { uid: 'uid-err' };
      const error = new Error('Erro interno');
      (authService.getMe as jest.Mock).mockRejectedValue(error);

      await authController.me(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
