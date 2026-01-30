import { AuthRequest } from '../middlewares/authMiddleware';
import { ForbiddenError } from './errors';

export function getTenantId(req: AuthRequest): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    throw new ForbiddenError('Tenant não encontrado para este usuário');
  }
  return tenantId;
}
