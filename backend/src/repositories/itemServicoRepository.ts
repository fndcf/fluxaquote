import { db } from '../config/firebase';
import { getTenantDb } from '../utils/tenantDb';
import { ItemServico } from '../models';

export function createItemServicoRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('itensServico');

  async function findAll(): Promise<ItemServico[]> {
    const snapshot = await collection.orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];
  }

  async function findByCategoria(categoriaId: string): Promise<ItemServico[]> {
    const snapshot = await collection
      .where('categoriaId', '==', categoriaId)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];
  }

  async function findAtivosByCategoria(categoriaId: string): Promise<ItemServico[]> {
    const snapshot = await collection
      .where('categoriaId', '==', categoriaId)
      .where('ativo', '==', true)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];
  }

  async function findAtivosByCategoriaPaginado(
    categoriaId: string,
    limit: number = 10,
    cursor?: string,
    search?: string
  ): Promise<{ itens: ItemServico[]; nextCursor?: string; hasMore: boolean; total: number }> {
    // Query base para itens ativos da categoria ordenados por descrição
    let baseQuery = collection
      .where('categoriaId', '==', categoriaId)
      .where('ativo', '==', true)
      .orderBy('descricao', 'asc');

    // Se há busca, busca todos e filtra no servidor (Firestore não tem LIKE)
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      const snapshot = await baseQuery.get();

      // Filtra por busca case-insensitive
      const allDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ItemServico[];

      const filtered = allDocs.filter(item =>
        item.descricao.toLowerCase().includes(searchLower)
      );

      const total = filtered.length;

      // Aplica paginação nos resultados filtrados
      let startIndex = 0;
      if (cursor) {
        const cursorIndex = filtered.findIndex(item => item.id === cursor);
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1;
        }
      }

      const itens = filtered.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < filtered.length;
      const nextCursor = hasMore && itens.length > 0 ? itens[itens.length - 1].id : undefined;

      return { itens, nextCursor, hasMore, total };
    }

    // Sem busca: paginação normal com cursor
    // Primeiro conta o total
    const countSnapshot = await baseQuery.get();
    const total = countSnapshot.size;

    // Se há cursor, busca a partir dele
    if (cursor) {
      const cursorDoc = await collection.doc(cursor).get();
      if (cursorDoc.exists) {
        baseQuery = baseQuery.startAfter(cursorDoc);
      }
    }

    // Limita resultados
    const snapshot = await baseQuery.limit(limit + 1).get();
    const docs = snapshot.docs;

    // Se retornou mais do que o limite, há mais itens
    const hasMore = docs.length > limit;
    const itens = docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];

    // O cursor para a próxima página é o último item retornado
    const nextCursor = hasMore && itens.length > 0 ? itens[itens.length - 1].id : undefined;

    return { itens, nextCursor, hasMore, total };
  }

  async function findById(id: string): Promise<ItemServico | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as ItemServico;
  }

  async function findByDescricaoInCategoria(descricao: string, categoriaId: string): Promise<ItemServico | null> {
    const snapshot = await collection
      .where('categoriaId', '==', categoriaId)
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
    } as ItemServico;
  }

  async function create(data: Omit<ItemServico, 'id' | 'createdAt'>): Promise<ItemServico> {
    const docRef = await collection.add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as ItemServico;
  }

  async function update(id: string, data: Partial<ItemServico>): Promise<ItemServico | null> {
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
    } as ItemServico;
  }

  async function deleteItemServico(id: string): Promise<boolean> {
    await collection.doc(id).delete();
    return true;
  }

  async function findByCategoriaPaginado(
    categoriaId: string,
    limit: number = 10,
    cursor?: string,
    search?: string
  ): Promise<{ itens: ItemServico[]; nextCursor?: string; hasMore: boolean; total: number }> {
    // Query base para todos os itens da categoria ordenados por descrição
    let baseQuery = collection
      .where('categoriaId', '==', categoriaId)
      .orderBy('descricao', 'asc');

    // Se há busca, busca todos e filtra no servidor (Firestore não tem LIKE)
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      const snapshot = await baseQuery.get();

      // Filtra por busca case-insensitive
      const allDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ItemServico[];

      const filtered = allDocs.filter(item =>
        item.descricao.toLowerCase().includes(searchLower)
      );

      const total = filtered.length;

      // Aplica paginação nos resultados filtrados
      let startIndex = 0;
      if (cursor) {
        const cursorIndex = filtered.findIndex(item => item.id === cursor);
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1;
        }
      }

      const itens = filtered.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < filtered.length;
      const nextCursor = hasMore && itens.length > 0 ? itens[itens.length - 1].id : undefined;

      return { itens, nextCursor, hasMore, total };
    }

    // Sem busca: paginação normal com cursor
    // Primeiro conta o total
    const countSnapshot = await baseQuery.get();
    const total = countSnapshot.size;

    // Se há cursor, busca a partir dele
    if (cursor) {
      const cursorDoc = await collection.doc(cursor).get();
      if (cursorDoc.exists) {
        baseQuery = baseQuery.startAfter(cursorDoc);
      }
    }

    // Limita resultados
    const snapshot = await baseQuery.limit(limit + 1).get();
    const docs = snapshot.docs;

    // Se retornou mais do que o limite, há mais itens
    const hasMore = docs.length > limit;
    const itens = docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];

    // O cursor para a próxima página é o último item retornado
    const nextCursor = hasMore && itens.length > 0 ? itens[itens.length - 1].id : undefined;

    return { itens, nextCursor, hasMore, total };
  }

  async function getNextOrdem(categoriaId: string): Promise<number> {
    const snapshot = await collection
      .where('categoriaId', '==', categoriaId)
      .orderBy('ordem', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return 1;
    return (snapshot.docs[0].data().ordem || 0) + 1;
  }

  async function deleteByCategoria(categoriaId: string): Promise<number> {
    const snapshot = await collection
      .where('categoriaId', '==', categoriaId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return snapshot.size;
  }

  return {
    findAll,
    findByCategoria,
    findAtivosByCategoria,
    findAtivosByCategoriaPaginado,
    findById,
    findByDescricaoInCategoria,
    create,
    update,
    delete: deleteItemServico,
    findByCategoriaPaginado,
    getNextOrdem,
    deleteByCategoria,
  };
}
