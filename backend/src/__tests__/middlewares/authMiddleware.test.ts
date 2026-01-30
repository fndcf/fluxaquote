import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../../middlewares/authMiddleware';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

// Mock do Firebase Auth e Firestore
jest.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn(),
  },
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
    }),
  },
}));

import { auth, db } from '../../config/firebase';

describe('authMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('deve chamar next com erro quando não há header de autorização', async () => {
    mockReq.headers = {};

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Token não fornecido');
  });

  it('deve chamar next com erro quando header não começa com Bearer', async () => {
    mockReq.headers = { authorization: 'Basic token123' };

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('deve chamar next com erro quando token é inválido', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Token inválido'));

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Token inválido ou expirado');
  });

  it('deve definir user no request quando token tem custom claims', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-abc',
      slug: 'minha-empresa',
      role: 'admin',
    });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-abc',
      slug: 'minha-empresa',
      role: 'admin',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('deve buscar tenantId do Firestore quando custom claims não existem', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
    });

    const mockDocGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        tenantId: 'tenant-from-db',
        slug: 'empresa-db',
        role: 'admin',
      }),
    });
    const mockDoc = jest.fn().mockReturnValue({ get: mockDocGet });
    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-from-db',
      slug: 'empresa-db',
      role: 'admin',
    });
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-123', {
      tenantId: 'tenant-from-db',
      slug: 'empresa-db',
      role: 'admin',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('deve chamar next com ForbiddenError quando usuário não tem tenant', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
    });

    const mockDocGet = jest.fn().mockResolvedValue({
      exists: false,
    });
    const mockDoc = jest.fn().mockReturnValue({ get: mockDocGet });
    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('deve definir email vazio quando token não tem email', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: undefined,
      tenantId: 'tenant-abc',
      slug: 'minha-empresa',
      role: 'admin',
    });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      uid: 'user-123',
      email: '',
      tenantId: 'tenant-abc',
      slug: 'minha-empresa',
      role: 'admin',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('deve usar role admin como default quando role não existe', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-abc',
      slug: 'minha-empresa',
    });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-abc',
      slug: 'minha-empresa',
      role: 'admin',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });
});
