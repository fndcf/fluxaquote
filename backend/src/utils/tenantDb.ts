import { db } from '../config/firebase';

export function getTenantDb(tenantId: string) {
  const tenantRef = db.collection('tenants').doc(tenantId);

  return {
    collection: (name: string) => tenantRef.collection(name),
    tenantRef,
    tenantId,
  };
}
