import { db } from '../config/firebase';
import { GLOBAL_COLLECTIONS } from '../utils/constants';
import { Tenant, UserTenant } from '../models';

const tenantsCol = db.collection(GLOBAL_COLLECTIONS.TENANTS);
const slugsCol = db.collection(GLOBAL_COLLECTIONS.SLUGS);
const userTenantsCol = db.collection(GLOBAL_COLLECTIONS.USER_TENANTS);

export const tenantRepository = {
  async findById(tenantId: string): Promise<Tenant | null> {
    const doc = await tenantsCol.doc(tenantId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Tenant;
  },

  async findBySlug(slug: string): Promise<{ tenantId: string } | null> {
    const doc = await slugsCol.doc(slug).get();
    if (!doc.exists) return null;
    return doc.data() as { tenantId: string };
  },

  async slugExists(slug: string): Promise<boolean> {
    const doc = await slugsCol.doc(slug).get();
    return doc.exists;
  },

  async findUserTenant(uid: string): Promise<UserTenant | null> {
    const doc = await userTenantsCol.doc(uid).get();
    if (!doc.exists) return null;
    return doc.data() as UserTenant;
  },

  async createTenantWithTransaction(data: {
    tenantId: string;
    slug: string;
    nomeEmpresa: string;
    email: string;
    telefone: string;
    ownerId: string;
  }): Promise<void> {
    const now = new Date();

    await db.runTransaction(async (transaction) => {
      // Verificar se slug já existe
      const slugRef = slugsCol.doc(data.slug);
      const slugDoc = await transaction.get(slugRef);
      if (slugDoc.exists) {
        throw new Error('SLUG_EXISTS');
      }

      // Criar tenant
      const tenantRef = tenantsCol.doc(data.tenantId);
      transaction.set(tenantRef, {
        slug: data.slug,
        nomeEmpresa: data.nomeEmpresa,
        email: data.email,
        telefone: data.telefone,
        ownerId: data.ownerId,
        plano: 'basico',
        ativo: true,
        createdAt: now,
      });

      // Criar slug lookup
      transaction.set(slugRef, {
        tenantId: data.tenantId,
        createdAt: now,
      });

      // Criar user-tenant mapping
      const userTenantRef = userTenantsCol.doc(data.ownerId);
      transaction.set(userTenantRef, {
        tenantId: data.tenantId,
        slug: data.slug,
        role: 'admin',
        createdAt: now,
      });

      // Criar configurações gerais iniciais do tenant
      const configRef = tenantsCol
        .doc(data.tenantId)
        .collection('configuracoes')
        .doc('gerais');
      transaction.set(configRef, {
        diasValidadeOrcamento: 30,
        nomeEmpresa: data.nomeEmpresa,
        cnpjEmpresa: '',
        enderecoEmpresa: '',
        telefoneEmpresa: data.telefone,
        emailEmpresa: data.email,
      });
    });
  },
};
