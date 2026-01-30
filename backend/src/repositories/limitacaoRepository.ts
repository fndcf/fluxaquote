import { getTenantDb } from '../utils/tenantDb';
import { Limitacao } from '../models';

export function createLimitacaoRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('limitacoes');

  async function findAll(): Promise<Limitacao[]> {
    const snapshot = await collection.orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Limitacao[];
  }

  async function findAtivas(): Promise<Limitacao[]> {
    const snapshot = await collection
      .where('ativo', '==', true)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Limitacao[];
  }

  async function findById(id: string): Promise<Limitacao | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Limitacao;
  }

  async function findByTexto(texto: string): Promise<Limitacao | null> {
    const snapshot = await collection
      .where('texto', '==', texto)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Limitacao;
  }

  async function findByIds(ids: string[]): Promise<Limitacao[]> {
    if (ids.length === 0) return [];
    const limitacoes: Limitacao[] = [];
    for (const id of ids) {
      const doc = await collection.doc(id).get();
      if (doc.exists) {
        limitacoes.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()?.createdAt?.toDate(),
          updatedAt: doc.data()?.updatedAt?.toDate(),
        } as Limitacao);
      }
    }
    return limitacoes;
  }

  async function create(data: Omit<Limitacao, 'id' | 'createdAt'>): Promise<Limitacao> {
    const docRef = await collection.add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as Limitacao;
  }

  async function update(id: string, data: Partial<Limitacao>): Promise<Limitacao | null> {
    const docRef = collection.doc(id);
    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Limitacao;
  }

  async function del(id: string): Promise<boolean> {
    await collection.doc(id).delete();
    return true;
  }

  async function getNextOrdem(): Promise<number> {
    const snapshot = await collection.orderBy('ordem', 'desc').limit(1).get();
    if (snapshot.empty) return 1;
    return (snapshot.docs[0].data().ordem || 0) + 1;
  }

  return {
    findAll,
    findAtivas,
    findById,
    findByTexto,
    findByIds,
    create,
    update,
    delete: del,
    getNextOrdem,
  };
}
