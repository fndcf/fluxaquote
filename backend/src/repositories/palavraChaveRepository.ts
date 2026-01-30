import { getTenantDb } from '../utils/tenantDb';
import { PalavraChave } from '../models';

export function createPalavraChaveRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('palavrasChave');

  async function findAll(): Promise<PalavraChave[]> {
    const snapshot = await collection.orderBy('palavra').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PalavraChave[];
  }

  async function findById(id: string): Promise<PalavraChave | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as PalavraChave;
  }

  async function findByPalavra(palavra: string): Promise<PalavraChave | null> {
    const snapshot = await collection
      .where('palavra', '==', palavra.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PalavraChave;
  }

  async function findAtivas(): Promise<PalavraChave[]> {
    const snapshot = await collection
      .where('ativo', '==', true)
      .orderBy('palavra')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PalavraChave[];
  }

  async function create(data: Omit<PalavraChave, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalavraChave> {
    const now = new Date();
    const docRef = await collection.add({
      ...data,
      palavra: data.palavra.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: docRef.id,
      ...data,
      palavra: data.palavra.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
  }

  async function update(id: string, data: Partial<Omit<PalavraChave, 'id' | 'createdAt'>>): Promise<PalavraChave | null> {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.palavra) {
      updateData.palavra = data.palavra.toLowerCase();
    }

    await docRef.update(updateData);

    const updated = await docRef.get();
    return {
      id: updated.id,
      ...updated.data(),
      createdAt: updated.data()?.createdAt?.toDate(),
      updatedAt: updated.data()?.updatedAt?.toDate(),
    } as PalavraChave;
  }

  async function del(id: string): Promise<boolean> {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  }

  return {
    findAll,
    findById,
    findByPalavra,
    findAtivas,
    create,
    update,
    delete: del,
  };
}
