import { useAuth } from '../contexts/AuthContext';

export function useTenant() {
  const { tenantInfo, tenantLoading } = useAuth();

  const slug = tenantInfo?.slug || '';
  const tenantId = tenantInfo?.tenantId || '';
  const nomeEmpresa = tenantInfo?.nomeEmpresa || '';
  const role = tenantInfo?.role || '';

  const buildPath = (path: string) => `/${slug}${path}`;

  return { slug, tenantId, nomeEmpresa, role, loading: tenantLoading, buildPath };
}
