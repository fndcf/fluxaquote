import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Register } from '../../pages/Register';
import { authService } from '../../services/authService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/authService', () => ({
  authService: {
    register: vi.fn(),
  },
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar título FluxaQuote', () => {
      renderRegister();
      expect(screen.getByText('FluxaQuote')).toBeInTheDocument();
    });

    it('deve renderizar subtítulo', () => {
      renderRegister();
      expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    });

    it('deve renderizar campos do formulário', () => {
      renderRegister();
      expect(screen.getByLabelText('Nome da Empresa')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
    });

    it('deve renderizar botão de criar conta', () => {
      renderRegister();
      expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
    });

    it('deve renderizar link para login', () => {
      renderRegister();
      expect(screen.getByText('Entrar')).toBeInTheDocument();
      expect(screen.getByText('Já tem uma conta?')).toBeInTheDocument();
    });
  });

  describe('Slug preview', () => {
    it('deve mostrar preview do slug ao digitar nome', async () => {
      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      await userEvent.type(nomeInput, 'Minha Empresa');

      expect(screen.getByText(/fluxaquote.com\//)).toBeInTheDocument();
    });

    it('deve gerar slug sem acentos', async () => {
      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      await userEvent.type(nomeInput, 'Proteção');

      await waitFor(() => {
        expect(screen.getByText(/protecao/)).toBeInTheDocument();
      });
    });
  });

  describe('Validação do formulário', () => {
    it('deve mostrar erro quando senhas não coincidem', async () => {
      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      const emailInput = screen.getByLabelText('Email');
      const telefoneInput = screen.getByLabelText('Telefone');
      const senhaInput = screen.getByLabelText('Senha');
      const confirmarInput = screen.getByLabelText('Confirmar Senha');

      await userEvent.type(nomeInput, 'Empresa Teste');
      await userEvent.type(emailInput, 'teste@teste.com');
      await userEvent.type(telefoneInput, '11999999999');
      await userEvent.type(senhaInput, '123456');
      await userEvent.type(confirmarInput, '654321');

      const submitButton = screen.getByRole('button', { name: 'Criar conta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro quando senha é curta', async () => {
      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      const emailInput = screen.getByLabelText('Email');
      const telefoneInput = screen.getByLabelText('Telefone');
      const senhaInput = screen.getByLabelText('Senha');
      const confirmarInput = screen.getByLabelText('Confirmar Senha');

      await userEvent.type(nomeInput, 'Empresa Teste');
      await userEvent.type(emailInput, 'teste@teste.com');
      await userEvent.type(telefoneInput, '11999999999');
      await userEvent.type(senhaInput, '12345');
      await userEvent.type(confirmarInput, '12345');

      const submitButton = screen.getByRole('button', { name: 'Criar conta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
      });
    });
  });

  describe('Submissão do formulário', () => {
    it('deve registrar com sucesso e navegar para login', async () => {
      (authService.register as any).mockResolvedValue({
        tenantId: 'tenant-123',
        slug: 'empresa-teste',
        uid: 'uid-123',
      });

      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      const emailInput = screen.getByLabelText('Email');
      const telefoneInput = screen.getByLabelText('Telefone');
      const senhaInput = screen.getByLabelText('Senha');
      const confirmarInput = screen.getByLabelText('Confirmar Senha');

      await userEvent.type(nomeInput, 'Empresa Teste');
      await userEvent.type(emailInput, 'teste@teste.com');
      await userEvent.type(telefoneInput, '11999999999');
      await userEvent.type(senhaInput, '123456');
      await userEvent.type(confirmarInput, '123456');

      const submitButton = screen.getByRole('button', { name: 'Criar conta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          nomeEmpresa: 'Empresa Teste',
          email: 'teste@teste.com',
          telefone: '11999999999',
          senha: '123456',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('deve mostrar "Criando conta..." durante loading', async () => {
      (authService.register as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      const emailInput = screen.getByLabelText('Email');
      const telefoneInput = screen.getByLabelText('Telefone');
      const senhaInput = screen.getByLabelText('Senha');
      const confirmarInput = screen.getByLabelText('Confirmar Senha');

      await userEvent.type(nomeInput, 'Empresa Teste');
      await userEvent.type(emailInput, 'teste@teste.com');
      await userEvent.type(telefoneInput, '11999999999');
      await userEvent.type(senhaInput, '123456');
      await userEvent.type(confirmarInput, '123456');

      const submitButton = screen.getByRole('button', { name: 'Criar conta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Criando conta...')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem de erro da API', async () => {
      (authService.register as any).mockRejectedValue({
        response: { data: { message: 'Email já cadastrado' } },
      });

      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      const emailInput = screen.getByLabelText('Email');
      const telefoneInput = screen.getByLabelText('Telefone');
      const senhaInput = screen.getByLabelText('Senha');
      const confirmarInput = screen.getByLabelText('Confirmar Senha');

      await userEvent.type(nomeInput, 'Empresa Teste');
      await userEvent.type(emailInput, 'teste@teste.com');
      await userEvent.type(telefoneInput, '11999999999');
      await userEvent.type(senhaInput, '123456');
      await userEvent.type(confirmarInput, '123456');

      const submitButton = screen.getByRole('button', { name: 'Criar conta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email já cadastrado')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem genérica quando API não retorna mensagem', async () => {
      (authService.register as any).mockRejectedValue(new Error('Network error'));

      renderRegister();

      const nomeInput = screen.getByLabelText('Nome da Empresa');
      const emailInput = screen.getByLabelText('Email');
      const telefoneInput = screen.getByLabelText('Telefone');
      const senhaInput = screen.getByLabelText('Senha');
      const confirmarInput = screen.getByLabelText('Confirmar Senha');

      await userEvent.type(nomeInput, 'Empresa Teste');
      await userEvent.type(emailInput, 'teste@teste.com');
      await userEvent.type(telefoneInput, '11999999999');
      await userEvent.type(senhaInput, '123456');
      await userEvent.type(confirmarInput, '123456');

      const submitButton = screen.getByRole('button', { name: 'Criar conta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao criar conta. Tente novamente.')).toBeInTheDocument();
      });
    });
  });
});
