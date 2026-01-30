import { getTenantDb } from '../utils/tenantDb';
import { CategoriaItem } from '../models';

export function createCategoriaItemRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('categoriasItem');

  async function findAll(): Promise<CategoriaItem[]> {
    const snapshot = await collection.orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as CategoriaItem[];
  }

  async function findAtivas(): Promise<CategoriaItem[]> {
    const snapshot = await collection
      .where('ativo', '==', true)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as CategoriaItem[];
  }

  async function findById(id: string): Promise<CategoriaItem | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as CategoriaItem;
  }

  async function findByNome(nome: string): Promise<CategoriaItem | null> {
    const snapshot = await collection
      .where('nome', '==', nome)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as CategoriaItem;
  }

  async function create(data: Omit<CategoriaItem, 'id' | 'createdAt'>): Promise<CategoriaItem> {
    const docRef = await collection.add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as CategoriaItem;
  }

  async function update(id: string, data: Partial<CategoriaItem>): Promise<CategoriaItem | null> {
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
    } as CategoriaItem;
  }

  async function deleteCategoriaItem(id: string): Promise<boolean> {
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
    findByNome,
    create,
    update,
    delete: deleteCategoriaItem,
    getNextOrdem,
  };
}
