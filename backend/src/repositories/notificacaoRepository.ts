import { db } from '../config/firebase';
import { getTenantDb } from '../utils/tenantDb';
import { Notificacao, PaginatedResponse } from '../models';

// Helper para mapear documento do Firestore para Notificacao
const mapDocToNotificacao = (doc: FirebaseFirestore.DocumentSnapshot): Notificacao => ({
  id: doc.id,
  ...doc.data(),
  dataVencimento: doc.data()?.dataVencimento?.toDate(),
  orcamentoDataEmissao: doc.data()?.orcamentoDataEmissao?.toDate?.() || doc.data()?.orcamentoDataEmissao,
  createdAt: doc.data()?.createdAt?.toDate(),
} as Notificacao);

// Helper para codificar/decodificar cursor
const encodeCursor = (id: string): string => Buffer.from(id).toString('base64');
const decodeCursor = (cursor: string): string => Buffer.from(cursor, 'base64').toString();

export function createNotificacaoRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('notificacoes');

  async function findAll(): Promise<Notificacao[]> {
    const snapshot = await collection
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  }

  async function findById(id: string): Promise<Notificacao | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return mapDocToNotificacao(doc);
  }

  async function findByOrcamentoId(orcamentoId: string): Promise<Notificacao[]> {
    const snapshot = await collection
      .where('orcamentoId', '==', orcamentoId)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  }

  async function findNaoLidas(): Promise<Notificacao[]> {
    const snapshot = await collection
      .where('lida', '==', false)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  }

  async function findProximas(dias: number = 30): Promise<Notificacao[]> {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    const snapshot = await collection
      .where('dataVencimento', '>=', hoje)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  }

  async function findVencidas(): Promise<Notificacao[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Busca todas as notificações vencidas, independente se foram lidas ou não
    const snapshot = await collection
      .where('dataVencimento', '<', hoje)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  }

  async function create(data: Omit<Notificacao, 'id' | 'createdAt'>): Promise<Notificacao> {
    const now = new Date();
    const docRef = await collection.add({
      ...data,
      createdAt: now,
    });

    return {
      id: docRef.id,
      ...data,
      createdAt: now,
    };
  }

  async function createMany(notificacoes: Omit<Notificacao, 'id' | 'createdAt'>[]): Promise<Notificacao[]> {
    const batch = db.batch();
    const now = new Date();
    const results: Notificacao[] = [];

    for (const data of notificacoes) {
      const docRef = collection.doc();
      batch.set(docRef, {
        ...data,
        createdAt: now,
      });
      results.push({
        id: docRef.id,
        ...data,
        createdAt: now,
      });
    }

    await batch.commit();
    return results;
  }

  async function marcarComoLida(id: string): Promise<Notificacao | null> {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    await docRef.update({ lida: true });

    const updated = await docRef.get();
    return mapDocToNotificacao(updated);
  }

  async function marcarTodasComoLidas(): Promise<number> {
    const snapshot = await collection
      .where('lida', '==', false)
      .get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { lida: true });
    });

    await batch.commit();
    return snapshot.size;
  }

  async function del(id: string): Promise<boolean> {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  }

  async function deleteByOrcamentoId(orcamentoId: string): Promise<number> {
    const snapshot = await collection
      .where('orcamentoId', '==', orcamentoId)
      .get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  }

  // Verifica se já existe notificação para este orçamento/item/palavra-chave
  async function exists(orcamentoId: string, itemDescricao: string, palavraChave: string): Promise<boolean> {
    const snapshot = await collection
      .where('orcamentoId', '==', orcamentoId)
      .where('itemDescricao', '==', itemDescricao)
      .where('palavraChave', '==', palavraChave)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  // Busca notificações ativas (não lidas E que já venceram ou vão vencer em até X dias)
  async function findAtivas(diasAntecedencia: number = 60): Promise<Notificacao[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date();
    limite.setDate(limite.getDate() + diasAntecedencia);

    // Buscar não lidas que vencem até o limite
    const snapshot = await collection
      .where('lida', '==', false)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  }

  // ========== MÉTODOS PAGINADOS ==========

  async function findAllPaginated(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    let query = collection
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await collection.doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await collection.count().get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  }

  async function findNaoLidasPaginated(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    let query = collection
      .where('lida', '==', false)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await collection.doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await collection
      .where('lida', '==', false)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  }

  async function findVencidasPaginated(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let query = collection
      .where('dataVencimento', '<', hoje)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await collection.doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await collection
      .where('dataVencimento', '<', hoje)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  }

  async function findAtivasPaginated(diasAntecedencia: number = 60, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const limite = new Date();
    limite.setDate(limite.getDate() + diasAntecedencia);

    let query = collection
      .where('lida', '==', false)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await collection.doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await collection
      .where('lida', '==', false)
      .where('dataVencimento', '<=', limite)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  }

  async function findProximasPaginated(dias: number = 30, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    let query = collection
      .where('dataVencimento', '>=', hoje)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await collection.doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await collection
      .where('dataVencimento', '>=', hoje)
      .where('dataVencimento', '<=', limite)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  }

  return {
    findAll,
    findById,
    findByOrcamentoId,
    findNaoLidas,
    findProximas,
    findVencidas,
    create,
    createMany,
    marcarComoLida,
    marcarTodasComoLidas,
    delete: del,
    deleteByOrcamentoId,
    exists,
    findAtivas,
    findAllPaginated,
    findNaoLidasPaginated,
    findVencidasPaginated,
    findAtivasPaginated,
    findProximasPaginated,
  };
}
