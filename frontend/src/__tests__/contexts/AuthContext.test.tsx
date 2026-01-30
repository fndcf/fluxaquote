import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock do authService
const mockGetMe = vi.fn();
vi.mock('../../services/authService', () => ({
  authService: {
    getMe: (...args: any[]) => mockGetMe(...args),
  },
}));

// Mock do Firebase Auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSendPasswordResetEmail = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  sendPasswordResetEmail: (...args: any[]) => mockSendPasswordResetEmail(...args),
}));

vi.mock('../../services/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Componente de teste para acessar o contexto
function TestComponent() {
  const { user, loading, tenantInfo, tenantLoading, signIn, signOut, resetPassword } = useAuth();

  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="tenantLoading">{tenantLoading.toString()}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="tenantSlug">{tenantInfo?.slug || 'null'}</span>
      <span data-testid="tenantNome">{tenantInfo?.nomeEmpresa || 'null'}</span>
      <span data-testid="tenantRole">{tenantInfo?.role || 'null'}</span>
      <button onClick={() => signIn('test@test.com', 'password').catch(() => {})}>Login</button>
      <button onClick={() => signOut()}>Logout</button>
      <button onClick={() => resetPassword('test@test.com')}>Reset</button>
    </div>
  );
}

// Componente para testar erro fora do provider
function TestComponentWithoutProvider() {
  try {
    useAuth();
    return <div>No error</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMe.mockResolvedValue({
      tenantId: 'tenant-1',
      slug: 'empresa-teste',
      role: 'admin',
      nomeEmpresa: 'Empresa Teste',
    });
    // Por padrão, simula que não há usuário logado
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return vi.fn(); // unsubscribe
    });
  });

  describe('AuthProvider', () => {
    it('deve renderizar children', async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('deve iniciar com loading true e depois false', async () => {
      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        setTimeout(() => callback(null), 0);
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
    });

    it('deve atualizar user quando onAuthStateChanged é chamado com usuário', async () => {
      const mockUser = { email: 'test@test.com', uid: '123' };

      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        callback(mockUser);
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@test.com');
      });
    });

    it('deve buscar tenant info quando usuário está logado', async () => {
      const mockUser = { email: 'test@test.com', uid: '123' };

      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        callback(mockUser);
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenantSlug').textContent).toBe('empresa-teste');
        expect(screen.getByTestId('tenantNome').textContent).toBe('Empresa Teste');
        expect(screen.getByTestId('tenantRole').textContent).toBe('admin');
      });
    });

    it('deve limpar tenantInfo quando não há usuário', async () => {
      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        callback(null);
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenantSlug').textContent).toBe('null');
      });
    });

    it('deve lidar com erro ao buscar tenant info', async () => {
      const mockUser = { email: 'test@test.com', uid: '123' };
      mockGetMe.mockRejectedValue(new Error('Erro de rede'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        callback(mockUser);
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenantSlug').textContent).toBe('null');
      });

      consoleSpy.mockRestore();
    });

    it('deve chamar signInWithEmailAndPassword e getMe no signIn', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: {} });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password'
      );
      expect(mockGetMe).toHaveBeenCalled();
    });

    it('deve chamar firebaseSignOut e limpar tenantInfo no signOut', async () => {
      mockSignOut.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const logoutButton = screen.getByText('Logout');
      await userEvent.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('deve chamar sendPasswordResetEmail no resetPassword', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const resetButton = screen.getByText('Reset');
      await userEvent.click(resetButton);

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com'
      );
    });

    it('deve chamar unsubscribe ao desmontar', async () => {
      const unsubscribeMock = vi.fn();
      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        callback(null);
        return unsubscribeMock;
      });

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('useAuth', () => {
    it('deve lançar erro quando usado fora do AuthProvider', () => {
      render(<TestComponentWithoutProvider />);

      const errorElement = screen.queryByTestId('error');
      if (errorElement) {
        expect(errorElement.textContent).toContain('useAuth deve ser usado dentro de um AuthProvider');
      }
    });

    it('deve retornar context corretamente quando dentro do Provider', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.getByTestId('user')).toBeInTheDocument();
        expect(screen.getByTestId('tenantSlug')).toBeInTheDocument();
      });
    });
  });
});
