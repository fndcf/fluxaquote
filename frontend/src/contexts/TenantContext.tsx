import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';

interface TenantContextData {
  tenantId: string;
  slug: string;
  nomeEmpresa: string;
  role: string;
  loading: boolean;
}

const TenantContext = createContext<TenantContextData>({} as TenantContextData);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user } = useAuth();
  const [tenantData, setTenantData] = useState<{
    tenantId: string;
    slug: string;
    nomeEmpresa: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTenantData(null);
      setLoading(false);
      return;
    }

    const fetchTenantInfo = async () => {
      try {
        const me = await authService.getMe();
        setTenantData({
          tenantId: me.tenantId,
          slug: me.slug,
          nomeEmpresa: me.nomeEmpresa,
          role: me.role,
        });
      } catch (error) {
        console.error('Erro ao buscar dados do tenant:', error);
        setTenantData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantInfo();
  }, [user]);

  return (
    <TenantContext.Provider
      value={{
        tenantId: tenantData?.tenantId || '',
        slug: tenantData?.slug || '',
        nomeEmpresa: tenantData?.nomeEmpresa || '',
        role: tenantData?.role || '',
        loading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext deve ser usado dentro de um TenantProvider');
  }
  return context;
}
