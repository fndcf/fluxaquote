/**
 * Testes de Firestore Rules usando o Admin SDK + Emulator.
 *
 * O Admin SDK bypassa as rules (é admin), então testamos as rules
 * indiretamente: verificamos que a lógica de isolamento multi-tenant
 * funciona corretamente através da API.
 *
 * Para testes puros de rules, use: firebase emulators:start + Firebase Console Emulator UI
 */
import request from 'supertest';
import {
  criarUsuarioTeste,
  criarTenantTeste,
  gerarTokenTeste,
  limparFirestore,
  limparAuth,
  db,
} from '../setup';

import app from '../../../index';

describe('Isolamento Multi-Tenant via API', () => {
  let tokenTenant1: string;
  let tokenTenant2: string;
  const tenant1Id = 'tenant-rules-1';
  const tenant2Id = 'tenant-rules-2';

  beforeEach(async () => {
    await limparFirestore();
    await limparAuth();

    // Criar tenant 1
    const user1 = await criarUsuarioTeste('tenant1@teste.com', '123456');
    await criarTenantTeste(tenant1Id, user1.uid);
    tokenTenant1 = await gerarTokenTeste(user1.uid);

    // Criar tenant 2
    const user2 = await criarUsuarioTeste('tenant2@teste.com', '123456');
    await criarTenantTeste(tenant2Id, user2.uid);
    tokenTenant2 = await gerarTokenTeste(user2.uid);
  });

  it('tenant 1 não vê clientes do tenant 2', async () => {
    // Tenant 1 cria cliente
    await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', `Bearer ${tokenTenant1}`)
      .send({ razaoSocial: 'Cliente do Tenant 1' });

    // Tenant 2 cria cliente
    await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', `Bearer ${tokenTenant2}`)
      .send({ razaoSocial: 'Cliente do Tenant 2' });

    // Tenant 1 lista — deve ver apenas seu cliente
    const res1 = await request(app)
      .get('/api/v1/clientes')
      .set('Authorization', `Bearer ${tokenTenant1}`);

    expect(res1.body.data).toHaveLength(1);
    expect(res1.body.data[0].razaoSocial).toBe('Cliente do Tenant 1');

    // Tenant 2 lista — deve ver apenas seu cliente
    const res2 = await request(app)
      .get('/api/v1/clientes')
      .set('Authorization', `Bearer ${tokenTenant2}`);

    expect(res2.body.data).toHaveLength(1);
    expect(res2.body.data[0].razaoSocial).toBe('Cliente do Tenant 2');
  });

  it('tenant 1 não vê orçamentos do tenant 2', async () => {
    // Tenant 1 cria cliente e orçamento
    const cliente1 = await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', `Bearer ${tokenTenant1}`)
      .send({ razaoSocial: 'Cliente T1' });

    await request(app)
      .post('/api/v1/orcamentos')
      .set('Authorization', `Bearer ${tokenTenant1}`)
      .send({
        tipo: 'completo',
        clienteId: cliente1.body.data.id,
        clienteNome: 'Cliente T1',
        clienteCnpj: '',
        servicoId: 'srv-1',
        status: 'aberto',
        dataEmissao: new Date().toISOString(),
        dataValidade: new Date(Date.now() + 30 * 86400000).toISOString(),
        itensCompleto: [{
          etapa: 'comercial',
          categoriaId: 'cat-1',
          categoriaNome: 'Cat',
          descricao: 'Item teste',
          unidade: 'un',
          quantidade: 1,
          valorUnitarioMaoDeObra: 100,
          valorUnitarioMaterial: 0,
          valorTotalMaoDeObra: 100,
          valorTotalMaterial: 0,
          valorTotal: 100,
        }],
        valorTotal: 100,
      });

    // Tenant 2 lista orçamentos — deve estar vazio
    const res2 = await request(app)
      .get('/api/v1/orcamentos')
      .set('Authorization', `Bearer ${tokenTenant2}`);

    expect(res2.body.data).toHaveLength(0);
  });

  it('dados ficam isolados no Firestore por tenant', async () => {
    // Tenant 1 cria cliente via API
    await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', `Bearer ${tokenTenant1}`)
      .send({ razaoSocial: 'Isolado T1' });

    // Verificar diretamente no Firestore que o dado está na subcollection correta
    const t1Clientes = await db.collection('tenants').doc(tenant1Id)
      .collection('clientes').get();
    const t2Clientes = await db.collection('tenants').doc(tenant2Id)
      .collection('clientes').get();

    expect(t1Clientes.size).toBe(1);
    expect(t2Clientes.size).toBe(0);
  });

  it('request sem token é rejeitada', async () => {
    const response = await request(app)
      .get('/api/v1/clientes');

    expect(response.status).toBe(401);
  });
});
