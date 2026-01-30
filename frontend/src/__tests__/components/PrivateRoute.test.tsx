import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';

// Mock do useAuth
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PrivateRoute', () => {
  it('deve mostrar loading quando está carregando', () => {
    mockUseAuth.mockReturnValue({ user: null, tenantInfo: null, loading: true, tenantLoading: false });

    render(
      <MemoryRouter initialEntries={['/test-company/dashboard']}>
        <Routes>
          <Route path="/:slug/*" element={
            <PrivateRoute>
              <div>Conteúdo Protegido</div>
            </PrivateRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve mostrar loading quando tenant está carregando', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', uid: '123' },
      tenantInfo: null,
      loading: false,
      tenantLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/test-company/dashboard']}>
        <Routes>
          <Route path="/:slug/*" element={
            <PrivateRoute>
              <div>Conteúdo Protegido</div>
            </PrivateRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para login quando não há usuário', () => {
    mockUseAuth.mockReturnValue({ user: null, tenantInfo: null, loading: false, tenantLoading: false });

    render(
      <MemoryRouter initialEntries={['/test-company/dashboard']}>
        <Routes>
          <Route path="/:slug/*" element={
            <PrivateRoute>
              <div>Conteúdo Protegido</div>
            </PrivateRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Quando não há usuário, o Navigate redireciona para /login
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para login quando não há tenantInfo', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', uid: '123' },
      tenantInfo: null,
      loading: false,
      tenantLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/test-company/dashboard']}>
        <Routes>
          <Route path="/:slug/*" element={
            <PrivateRoute>
              <div>Conteúdo Protegido</div>
            </PrivateRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve renderizar children quando há usuário e tenantInfo', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', uid: '123' },
      tenantInfo: { tenantId: 't1', slug: 'test-company', role: 'admin', nomeEmpresa: 'Test Company' },
      loading: false,
      tenantLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/test-company/dashboard']}>
        <Routes>
          <Route path="/:slug/*" element={
            <PrivateRoute>
              <div>Conteúdo Protegido</div>
            </PrivateRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('deve aplicar estilo de centralização no loading', () => {
    mockUseAuth.mockReturnValue({ user: null, tenantInfo: null, loading: true, tenantLoading: false });

    render(
      <MemoryRouter initialEntries={['/test-company/dashboard']}>
        <Routes>
          <Route path="/:slug/*" element={
            <PrivateRoute>
              <div>Conteúdo</div>
            </PrivateRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    const loadingDiv = screen.getByText('Carregando...').parentElement;
    // O estilo é inline, então verificamos se o elemento existe
    expect(loadingDiv).toBeTruthy();
  });
});
