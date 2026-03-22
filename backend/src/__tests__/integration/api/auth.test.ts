import request from 'supertest';
import { limparFirestore, limparAuth } from '../setup';

import app from '../../../index';

describe('API /api/v1/auth', () => {
  beforeEach(async () => {
    await limparFirestore();
    await limparAuth();
  });

  describe('POST /api/v1/auth/register', () => {
    it('deve registrar nova empresa', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nomeEmpresa: 'Empresa Registro Teste',
          email: 'registro@teste.com',
          telefone: '11999999999',
          senha: '123456',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tenantId');
      expect(response.body.data).toHaveProperty('slug');
    });

    it('deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nomeEmpresa: 'Empresa Teste',
          email: 'email-invalido',
          telefone: '11999999999',
          senha: '123456',
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar senha curta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nomeEmpresa: 'Empresa Teste',
          email: 'valido@teste.com',
          telefone: '11999999999',
          senha: '123',
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar nome da empresa curto', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nomeEmpresa: 'AB',
          email: 'valido@teste.com',
          telefone: '11999999999',
          senha: '123456',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/check-slug/:slug', () => {
    it('deve retornar slug disponível', async () => {
      const response = await request(app)
        .get('/api/v1/auth/check-slug/slug-inexistente');

      expect(response.status).toBe(200);
      expect(response.body.data.exists).toBe(false);
    });
  });
});

describe('API /api/v1/health', () => {
  it('deve retornar status OK', async () => {
    const response = await request(app)
      .get('/api/v1/health');

    expect(response.status).toBe(200);
  });
});
