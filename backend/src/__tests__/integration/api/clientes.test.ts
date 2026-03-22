import request from 'supertest';
import {
  criarUsuarioTeste,
  criarTenantTeste,
  gerarTokenTeste,
  limparFirestore,
  limparAuth,
} from '../setup';

import app from '../../../index';

describe('API /api/v1/clientes', () => {
  let token: string;
  const tenantId = 'tenant-clientes';

  beforeEach(async () => {
    await limparFirestore();
    await limparAuth();
    const user = await criarUsuarioTeste('clientes@teste.com', '123456');
    await criarTenantTeste(tenantId, user.uid);
    token = await gerarTokenTeste(user.uid);
  });

  describe('POST /api/v1/clientes', () => {
    it('deve criar cliente com dados válidos', async () => {
      const response = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          razaoSocial: 'Cliente Integração LTDA',
          tipoPessoa: 'juridica',
          cnpj: '12345678000199',
          email: 'contato@integracao.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.razaoSocial).toBe('Cliente Integração LTDA');
      expect(response.body.data.id).toBeDefined();
    });

    it('deve rejeitar sem autenticação', async () => {
      const response = await request(app)
        .post('/api/v1/clientes')
        .send({ razaoSocial: 'Teste' });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar razão social curta (validação Zod)', async () => {
      const response = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'AB' });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar CNPJ duplicado', async () => {
      await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'Empresa Original', cnpj: '99999999000199' });

      const response = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'Empresa Duplicada', cnpj: '99999999000199' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('CPF/CNPJ');
    });
  });

  describe('GET /api/v1/clientes', () => {
    it('deve listar clientes do tenant', async () => {
      await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'Cliente Lista' });

      const response = await request(app)
        .get('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/clientes/paginated', () => {
    it('deve retornar paginação', async () => {
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/api/v1/clientes')
          .set('Authorization', `Bearer ${token}`)
          .send({ razaoSocial: `Cliente Paginação ${i}` });
      }

      const response = await request(app)
        .get('/api/v1/clientes/paginated?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.hasMore).toBe(true);
    });
  });

  describe('PUT /api/v1/clientes/:id', () => {
    it('deve atualizar cliente existente', async () => {
      const created = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'Para Atualizar' });

      const id = created.body.data.id;

      const response = await request(app)
        .put(`/api/v1/clientes/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'Atualizado Com Sucesso' });

      expect(response.status).toBe(200);
      expect(response.body.data.razaoSocial).toBe('Atualizado Com Sucesso');
    });
  });

  describe('DELETE /api/v1/clientes/:id', () => {
    it('deve excluir cliente existente', async () => {
      const created = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ razaoSocial: 'Para Excluir' });

      const id = created.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/clientes/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const check = await request(app)
        .get(`/api/v1/clientes/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(check.status).toBe(404);
    });
  });
});
