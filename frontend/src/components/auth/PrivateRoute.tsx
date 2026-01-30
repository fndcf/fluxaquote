import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, tenantInfo, loading, tenantLoading } = useAuth();
  const { slug } = useParams<{ slug: string }>();

  if (loading || tenantLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!tenantInfo) {
    return <Navigate to="/login" replace />;
  }

  // Se o slug na URL não bate com o tenant do usuário, redirecionar
  if (slug && slug !== tenantInfo.slug) {
    return <Navigate to={`/${tenantInfo.slug}/dashboard`} replace />;
  }

  return <>{children}</>;
}
