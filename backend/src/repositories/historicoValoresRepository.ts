import { getTenantDb } from '../utils/tenantDb';
import { HistoricoValorItem, HistoricoConfiguracao } from '../models';

export function createHistoricoValoresRepository(tenantId: string) {
  const collectionItens = getTenantDb(tenantId).collection('historicoValoresItens');
  const collectionConfiguracoes = getTenantDb(tenantId).collection('historicoConfiguracoes');

  // ==================== HISTÓRICO DE ITENS ====================

  async function salvarHistoricoItem(
    data: Omit<HistoricoValorItem, 'id' | 'createdAt'>
  ): Promise<HistoricoValorItem> {
    const docRef = await collectionItens.add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data()?.dataVigencia?.toDate(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as HistoricoValorItem;
  }

  async function buscarHistoricoItensPorPeriodo(
    _dataInicio: Date,
    _dataFim: Date
  ): Promise<HistoricoValorItem[]> {
    // Buscar TODOS os históricos ordenados por dataVigencia desc
    // Isso é necessário porque para calcular o valor vigente de um orçamento
    // emitido em uma data específica, precisamos do último registro com dataVigencia <= dataEmissao
    // O registro vigente pode ter sido criado ANTES do período selecionado
    // ou mesmo DEPOIS (se não existia registro anterior à data do orçamento)
    // Os parâmetros são mantidos para compatibilidade da API
    const snapshot = await collectionItens
      .orderBy('dataVigencia', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as HistoricoValorItem[];
  }

  async function buscarUltimoHistoricoItem(itemServicoId: string): Promise<HistoricoValorItem | null> {
    const snapshot = await collectionItens
      .where('itemServicoId', '==', itemServicoId)
      .orderBy('dataVigencia', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    } as HistoricoValorItem;
  }

  // ==================== HISTÓRICO DE CONFIGURAÇÕES ====================

  async function salvarHistoricoConfiguracao(
    data: Omit<HistoricoConfiguracao, 'id' | 'createdAt'>
  ): Promise<HistoricoConfiguracao> {
    const docRef = await collectionConfiguracoes.add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data()?.dataVigencia?.toDate(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as HistoricoConfiguracao;
  }

  async function buscarHistoricoConfiguracoesPorPeriodo(
    _dataInicio: Date,
    _dataFim: Date
  ): Promise<HistoricoConfiguracao[]> {
    // Buscar TODOS os históricos de configurações ordenados por dataVigencia desc
    // Mesma lógica dos itens: precisamos de todos os registros para encontrar
    // o valor vigente na data de emissão de cada orçamento
    // Os parâmetros são mantidos para compatibilidade da API
    const snapshot = await collectionConfiguracoes
      .orderBy('dataVigencia', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as HistoricoConfiguracao[];
  }

  async function buscarUltimaHistoricoConfiguracao(): Promise<HistoricoConfiguracao | null> {
    const snapshot = await collectionConfiguracoes
      .orderBy('dataVigencia', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    } as HistoricoConfiguracao;
  }

  return {
    salvarHistoricoItem,
    buscarHistoricoItensPorPeriodo,
    buscarUltimoHistoricoItem,
    salvarHistoricoConfiguracao,
    buscarHistoricoConfiguracoesPorPeriodo,
    buscarUltimaHistoricoConfiguracao,
  };
}
