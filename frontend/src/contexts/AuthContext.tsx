import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { authService } from '../services/authService';

interface TenantInfo {
  tenantId: string;
  slug: string;
  role: string;
  nomeEmpresa: string;
}

interface AuthContextData {
  user: User | null;
  tenantInfo: TenantInfo | null;
  loading: boolean;
  tenantLoading: boolean;
  signIn: (email: string, password: string) => Promise<string>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantLoading, setTenantLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setTenantLoading(true);
        try {
          const me = await authService.getMe();
          setTenantInfo({
            tenantId: me.tenantId,
            slug: me.slug,
            role: me.role,
            nomeEmpresa: me.nomeEmpresa,
          });
        } catch (error) {
          console.error('Erro ao buscar tenant info:', error);
          setTenantInfo(null);
        } finally {
          setTenantLoading(false);
        }
      } else {
        setTenantInfo(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string> => {
    await signInWithEmailAndPassword(auth, email, password);
    const me = await authService.getMe();
    setTenantInfo({
      tenantId: me.tenantId,
      slug: me.slug,
      role: me.role,
      nomeEmpresa: me.nomeEmpresa,
    });
    return me.slug;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setTenantInfo(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, tenantInfo, loading, tenantLoading, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
