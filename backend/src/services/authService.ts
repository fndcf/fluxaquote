import { auth } from '../config/firebase';
import { tenantRepository } from '../repositories/tenantRepository';
import { ValidationError } from '../utils/errors';
import { RegisterInput } from '../validations/authValidation';

function generateSlug(nomeEmpresa: string): string {
  return nomeEmpresa
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function generateSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

export const authService = {
  async register(data: RegisterInput) {
    // Gerar slug
    let slug = generateSlug(data.nomeEmpresa);
    if (!slug) {
      slug = `empresa-${generateSuffix()}`;
    }

    // Verificar unicidade do slug
    const slugExists = await tenantRepository.slugExists(slug);
    if (slugExists) {
      slug = `${slug}-${generateSuffix()}`;
    }

    // Gerar tenantId
    const tenantId = `tenant_${Date.now()}_${generateSuffix()}`;

    // Criar usuário no Firebase Auth
    let uid: string;
    try {
      const userRecord = await auth.createUser({
        email: data.email,
        password: data.senha,
        displayName: data.nomeEmpresa,
      });
      uid = userRecord.uid;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/email-already-exists') {
        throw new ValidationError('Este email já está cadastrado');
      }
      throw error;
    }

    // Criar tenant + slug + userTenant no Firestore (transação atômica)
    try {
      await tenantRepository.createTenantWithTransaction({
        tenantId,
        slug,
        nomeEmpresa: data.nomeEmpresa,
        email: data.email,
        telefone: data.telefone,
        ownerId: uid,
      });
    } catch (error: unknown) {
      // Limpar usuário Auth se Firestore falhar
      await auth.deleteUser(uid);
      const err = error as { message?: string };
      if (err.message === 'SLUG_EXISTS') {
        throw new ValidationError('Não foi possível criar a empresa. Tente novamente.');
      }
      throw error;
    }

    // Setar custom claims no Firebase Auth
    await auth.setCustomUserClaims(uid, {
      tenantId,
      slug,
      role: 'admin',
    });

    return { tenantId, slug, uid };
  },

  async checkSlug(slug: string): Promise<boolean> {
    return tenantRepository.slugExists(slug);
  },

  async getMe(uid: string) {
    const userTenant = await tenantRepository.findUserTenant(uid);
    if (!userTenant) {
      return null;
    }

    const tenant = await tenantRepository.findById(userTenant.tenantId);
    if (!tenant) {
      return null;
    }

    return {
      tenantId: userTenant.tenantId,
      slug: userTenant.slug,
      role: userTenant.role,
      nomeEmpresa: tenant.nomeEmpresa,
    };
  },
};
