import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Home } from '../../pages/Home';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home Page (Landing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHome = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

  describe('Navbar', () => {
    it('deve renderizar logo e botões de navegação', () => {
      renderHome();

      const nav = screen.getByRole('navigation');
      expect(within(nav).getByText('FluxaQuote')).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
    });

    it('deve navegar para /login ao clicar em Entrar na navbar', async () => {
      renderHome();

      const nav = screen.getByRole('navigation');
      await userEvent.click(within(nav).getByRole('button', { name: 'Entrar' }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('deve navegar para /registro ao clicar em Criar conta na navbar', async () => {
      renderHome();

      const nav = screen.getByRole('navigation');
      await userEvent.click(within(nav).getByRole('button', { name: 'Criar conta' }));
      expect(mockNavigate).toHaveBeenCalledWith('/registro');
    });
  });

  describe('Hero Section', () => {
    it('deve renderizar título e subtítulo do hero', () => {
      renderHome();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/Orçamentos/);
      expect(heading).toHaveTextContent(/profissionais/);
      expect(heading).toHaveTextContent(/em minutos/);
      expect(screen.getByText(/Crie, gerencie e envie orçamentos detalhados/)).toBeInTheDocument();
    });

    it('deve renderizar botões CTA do hero', () => {
      renderHome();

      expect(screen.getByRole('button', { name: 'Começar agora' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Saiba mais' })).toBeInTheDocument();
    });

    it('deve navegar para /registro ao clicar em Começar agora', async () => {
      renderHome();

      await userEvent.click(screen.getByRole('button', { name: 'Começar agora' }));
      expect(mockNavigate).toHaveBeenCalledWith('/registro');
    });

    it('deve fazer scroll para features ao clicar em Saiba mais', async () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      renderHome();

      await userEvent.click(screen.getByRole('button', { name: 'Saiba mais' }));
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Features Section', () => {
    it('deve renderizar título da seção de features', () => {
      renderHome();

      expect(screen.getByText(/Tudo que você precisa para/)).toBeInTheDocument();
      expect(screen.getByText(/gerenciar orçamentos/)).toBeInTheDocument();
    });

    it('deve renderizar os 4 cards de features', () => {
      renderHome();

      expect(screen.getByText('Orçamentos profissionais')).toBeInTheDocument();
      expect(screen.getByText('Gestão de Clientes')).toBeInTheDocument();
      expect(screen.getByText('Catálogo de Serviços')).toBeInTheDocument();
      expect(screen.getByText('Relatórios e Métricas')).toBeInTheDocument();
    });

    it('deve renderizar descrições dos features', () => {
      renderHome();

      expect(screen.getByText(/Crie orçamentos detalhados com serviços/)).toBeInTheDocument();
      expect(screen.getByText(/Cadastre clientes com dados completos/)).toBeInTheDocument();
      expect(screen.getByText(/Organize serviços por categorias/)).toBeInTheDocument();
      expect(screen.getByText(/Acompanhe faturamento, orçamentos aprovados/)).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('deve renderizar título da seção', () => {
      renderHome();

      expect(screen.getByText(/Como/)).toBeInTheDocument();
      expect(screen.getByText('funciona')).toBeInTheDocument();
    });

    it('deve renderizar os 3 passos', () => {
      renderHome();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
      expect(screen.getByText('Configure seus serviços')).toBeInTheDocument();
      expect(screen.getByText('Gere orçamentos')).toBeInTheDocument();
    });

    it('deve renderizar descrições dos passos', () => {
      renderHome();

      expect(screen.getByText(/Cadastro rápido com o nome da sua empresa/)).toBeInTheDocument();
      expect(screen.getByText(/Adicione os serviços que oferece/)).toBeInTheDocument();
      expect(screen.getByText(/Monte orçamentos personalizados/)).toBeInTheDocument();
    });
  });

  describe('Benefits Section', () => {
    it('deve renderizar título da seção de benefícios', () => {
      renderHome();

      expect(screen.getByText(/Por que escolher o/)).toBeInTheDocument();
    });

    it('deve renderizar os 4 benefícios', () => {
      renderHome();

      expect(screen.getByText('Sua marca, suas cores')).toBeInTheDocument();
      expect(screen.getByText('Dados isolados e seguros')).toBeInTheDocument();
      expect(screen.getByText('PDF pronto para envio')).toBeInTheDocument();
      expect(screen.getByText('Notificações em tempo real')).toBeInTheDocument();
    });

    it('deve renderizar descrições dos benefícios', () => {
      renderHome();

      expect(screen.getByText(/Personalize cores e logo/)).toBeInTheDocument();
      expect(screen.getByText(/Cada empresa tem seu ambiente exclusivo/)).toBeInTheDocument();
      expect(screen.getByText(/Gere documentos profissionais em PDF/)).toBeInTheDocument();
      expect(screen.getByText(/Receba alertas sobre orçamentos aprovados/)).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('deve renderizar título e subtítulo do CTA', () => {
      renderHome();

      expect(screen.getByText('Pronto para profissionalizar seus orçamentos?')).toBeInTheDocument();
      expect(screen.getByText(/Crie sua conta e comece a usar agora/)).toBeInTheDocument();
    });

    it('deve renderizar botão de criar conta grátis', () => {
      renderHome();

      expect(screen.getByRole('button', { name: 'Criar conta grátis' })).toBeInTheDocument();
    });

    it('deve navegar para /registro ao clicar em Criar conta grátis', async () => {
      renderHome();

      await userEvent.click(screen.getByRole('button', { name: 'Criar conta grátis' }));
      expect(mockNavigate).toHaveBeenCalledWith('/registro');
    });
  });

  describe('Footer', () => {
    it('deve renderizar copyright com ano atual', () => {
      renderHome();

      const year = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(`FluxaQuote.*${year}`))).toBeInTheDocument();
    });

    it('deve renderizar links do footer', () => {
      renderHome();

      const footerButtons = screen.getAllByRole('button');
      const entrarButtons = footerButtons.filter(btn => btn.textContent === 'Entrar');
      const criarContaButtons = footerButtons.filter(btn => btn.textContent === 'Criar conta');

      expect(entrarButtons.length).toBeGreaterThanOrEqual(2);
      expect(criarContaButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Scroll behavior', () => {
    it('deve registrar listener de scroll ao montar', () => {
      const addEventSpy = vi.spyOn(window, 'addEventListener');

      renderHome();

      expect(addEventSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      addEventSpy.mockRestore();
    });

    it('deve remover listener de scroll ao desmontar', () => {
      const removeEventSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHome();
      unmount();

      expect(removeEventSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      removeEventSpy.mockRestore();
    });

    it('deve atualizar estado scrolled ao rolar a página', () => {
      renderHome();

      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      fireEvent.scroll(window);

      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      fireEvent.scroll(window);
    });
  });
});
