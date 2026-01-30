import { getTenantDb } from '../utils/tenantDb';
import { ConfiguracoesGerais } from '../models';

// Valores padrão para as configurações
const defaultConfiguracoes: ConfiguracoesGerais = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: '',
  cnpjEmpresa: '',
  enderecoEmpresa: '',
  telefoneEmpresa: '',
  emailEmpresa: '',
  logoUrl: '',
};

export function createConfiguracoesGeraisRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('configuracoes');

  async function get(): Promise<ConfiguracoesGerais> {
    const doc = await collection.doc('gerais').get();
    if (!doc.exists) {
      // Se não existir, cria com valores padrão
      await collection.doc('gerais').set(defaultConfiguracoes);
      return defaultConfiguracoes;
    }
    return doc.data() as ConfiguracoesGerais;
  }

  async function update(data: Partial<ConfiguracoesGerais>): Promise<ConfiguracoesGerais> {
    const docRef = collection.doc('gerais');
    const doc = await docRef.get();

    if (!doc.exists) {
      // Se não existir, cria com os dados fornecidos + valores padrão
      const newData = { ...defaultConfiguracoes, ...data };
      await docRef.set(newData);
      return newData;
    }

    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as ConfiguracoesGerais;
  }

  return {
    get,
    update,
  };
}
