import { getTenantDb } from '../utils/tenantDb';
import { Servico } from '../models';

export function createServicoRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('servicos');

  async function findAll(): Promise<Servico[]> {
    const snapshot = await collection.orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Servico[];
  }

  async function findAtivos(): Promise<Servico[]> {
    const snapshot = await collection
      .where('ativo', '==', true)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Servico[];
  }

  async function findById(id: string): Promise<Servico | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Servico;
  }

  async function findByDescricao(descricao: string): Promise<Servico | null> {
    const snapshot = await collection
      .where('descricao', '==', descricao)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Servico;
  }

  async function create(data: Omit<Servico, 'id' | 'createdAt'>): Promise<Servico> {
    const docRef = await collection.add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as Servico;
  }

  async function update(id: string, data: Partial<Servico>): Promise<Servico | null> {
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
    } as Servico;
  }

  async function deleteServico(id: string): Promise<boolean> {
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
    findAtivos,
    findById,
    findByDescricao,
    create,
    update,
    delete: deleteServico,
    getNextOrdem,
  };
}
