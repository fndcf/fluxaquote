import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TenantProvider, useTenantContext } from '../../contexts/TenantContext';

// Mock do AuthContext
const mockUser = { email: 'test@test.com', uid: '123' };
let mockUserValue: any = null;

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUserValue,
  }),
}));

// Mock do authService
const mockGetMe = vi.fn();
vi.mock('../../services/authService', () => ({
  authService: {
    getMe: (...args: any[]) => mockGetMe(...args),
  },
}));

function TestComponent() {
  const { tenantId, slug, nomeEmpresa, role, loading } = useTenantContext();
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="tenantId">{tenantId || 'null'}</span>
      <span data-testid="slug">{slug || 'null'}</span>
      <span data-testid="nomeEmpresa">{nomeEmpresa || 'null'}</span>
      <span data-testid="role">{role || 'null'}</span>
    </div>
  );
}

describe('TenantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = null;
  });

  describe('TenantProvider', () => {
    it('deve renderizar children', () => {
      render(
        <TenantProvider>
          <div data-testid="child">Child</div>
        </TenantProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('deve iniciar com loading e depois finalizar sem user', async () => {
      mockUserValue = null;

      render(
        <TenantProvider>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('tenantId').textContent).toBe('null');
    });

    it('deve buscar tenant info quando user existe', async () => {
      mockUserValue = mockUser;
      mockGetMe.mockResolvedValue({
        tenantId: 'tenant-abc',
        slug: 'empresa-teste',
        nomeEmpresa: 'Empresa Teste',
        role: 'admin',
      });

      render(
        <TenantProvider>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenantId').textContent).toBe('tenant-abc');
        expect(screen.getByTestId('slug').textContent).toBe('empresa-teste');
        expect(screen.getByTestId('nomeEmpresa').textContent).toBe('Empresa Teste');
        expect(screen.getByTestId('role').textContent).toBe('admin');
      });
    });

    it('deve lidar com erro ao buscar tenant info', async () => {
      mockUserValue = mockUser;
      mockGetMe.mockRejectedValue(new Error('Erro de rede'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TenantProvider>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
        expect(screen.getByTestId('tenantId').textContent).toBe('null');
      });

      consoleSpy.mockRestore();
    });

    it('deve limpar dados quando user fica null', async () => {
      mockUserValue = null;

      render(
        <TenantProvider>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenantId').textContent).toBe('null');
        expect(screen.getByTestId('slug').textContent).toBe('null');
      });
    });
  });

  describe('useTenantContext', () => {
    it('deve funcionar quando dentro do TenantProvider', async () => {
      render(
        <TenantProvider>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
      });
    });
  });
});
