import request from 'supertest';
import {
  criarUsuarioTeste,
  criarTenantTeste,
  gerarTokenTeste,
  limparFirestore,
  limparAuth,
} from '../setup';

import app from '../../../index';

describe('API /api/v1/orcamentos', () => {
  let token: string;
  let clienteId: string;
  const tenantId = 'tenant-orcamentos';

  beforeEach(async () => {
    await limparFirestore();
    await limparAuth();
    const user = await criarUsuarioTeste('orcamentos@teste.com', '123456');
    await criarTenantTeste(tenantId, user.uid);
    token = await gerarTokenTeste(user.uid);

    const clienteRes = await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ razaoSocial: 'Cliente Orçamentos' });

    clienteId = clienteRes.body.data.id;
  });

  const criarOrcamentoBase = (overrides = {}) => ({
    tipo: 'completo',
    clienteId,
    clienteNome: 'Cliente Orçamentos',
    clienteCnpj: '',
    servicoId: 'servico-teste',
    servicoDescricao: 'Serviço Teste',
    status: 'aberto',
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    condicaoPagamento: 'a_vista',
    itensCompleto: [
      {
        etapa: 'comercial' as const,
        categoriaId: 'cat-1',
        categoriaNome: 'Categoria Teste',
        descricao: 'Item de teste',
        unidade: 'un',
        quantidade: 1,
        valorUnitarioMaoDeObra: 200,
        valorUnitarioMaterial: 100,
        valorTotalMaoDeObra: 200,
        valorTotalMaterial: 100,
        valorTotal: 300,
      },
    ],
    valorTotal: 300,
    valorTotalMaoDeObra: 200,
    valorTotalMaterial: 100,
    ...overrides,
  });

  describe('POST /api/v1/orcamentos', () => {
    it('deve criar orçamento completo', async () => {
      const response = await request(app)
        .post('/api/v1/orcamentos')
        .set('Authorization', `Bearer ${token}`)
        .send(criarOrcamentoBase({
          itensCompleto: [
            {
              etapa: 'comercial',
              categoriaId: 'cat-1',
              categoriaNome: 'Categoria Teste',
              descricao: 'Item teste',
              unidade: 'un',
              quantidade: 2,
              valorUnitarioMaoDeObra: 100,
              valorUnitarioMaterial: 50,
              valorTotalMaoDeObra: 200,
              valorTotalMaterial: 100,
              valorTotal: 300,
            },
          ],
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 100,
        }));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.numero).toBeDefined();
      expect(response.body.data.id).toBeDefined();
    });

    it('deve rejeitar sem autenticação', async () => {
      const response = await request(app)
        .post('/api/v1/orcamentos')
        .send(criarOrcamentoBase());

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/orcamentos/:id/status', () => {
    it('deve mudar status de aberto para aceito', async () => {
      const created = await request(app)
        .post('/api/v1/orcamentos')
        .set('Authorization', `Bearer ${token}`)
        .send(criarOrcamentoBase());

      const id = created.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/orcamentos/${id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'aceito' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('aceito');
    });

    it('deve rejeitar transição inválida (aceito → recusado)', async () => {
      const created = await request(app)
        .post('/api/v1/orcamentos')
        .set('Authorization', `Bearer ${token}`)
        .send(criarOrcamentoBase());

      const id = created.body.data.id;

      // Aceitar primeiro
      await request(app)
        .patch(`/api/v1/orcamentos/${id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'aceito' });

      // Tentar recusar (inválido: aceito → recusado)
      const response = await request(app)
        .patch(`/api/v1/orcamentos/${id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'recusado' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/orcamentos/dashboard-stats', () => {
    it('deve retornar estatísticas', async () => {
      const response = await request(app)
        .get('/api/v1/orcamentos/dashboard-stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('abertos');
      expect(response.body.data).toHaveProperty('valorTotal');
    });
  });

  describe('POST /api/v1/orcamentos/:id/duplicar', () => {
    it('deve duplicar orçamento', async () => {
      const created = await request(app)
        .post('/api/v1/orcamentos')
        .set('Authorization', `Bearer ${token}`)
        .send(criarOrcamentoBase({ valorTotal: 1000 }));

      const id = created.body.data.id;

      const response = await request(app)
        .post(`/api/v1/orcamentos/${id}/duplicar`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.data.id).not.toBe(id);
      expect(response.body.data.status).toBe('aberto');
    });
  });
});
