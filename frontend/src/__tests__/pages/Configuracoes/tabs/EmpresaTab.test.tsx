import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { EmpresaTab } from '../../../../pages/Configuracoes/tabs/EmpresaTab';
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from '../../../../hooks/useConfiguracoesGerais';
// Mock dos hooks
vi.mock('../../../../hooks/useConfiguracoesGerais', () => ({
  useConfiguracoesGerais: vi.fn(),
  useAtualizarConfiguracoesGerais: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockConfiguracoesGerais = {
  nomeEmpresa: 'FLAMA Proteção',
  cnpjEmpresa: '12.345.678/0001-90',
  enderecoEmpresa: 'Rua das Flores, 123 - Centro',
  telefoneEmpresa: '(11) 99999-9999',
  emailEmpresa: 'contato@flama.com.br',
  diasValidadeOrcamento: 30,
};

const mockMutateAsync = vi.fn();

describe('EmpresaTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: mockConfiguracoesGerais,
      isLoading: false,
    } as any);

    vi.mocked(useAtualizarConfiguracoesGerais).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    } as any);
  });

  describe('Renderização básica', () => {
    it('deve renderizar título e descrição', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Dados da Empresa')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure os dados da sua empresa/)
      ).toBeInTheDocument();
    });

    it('deve renderizar campos do formulário', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('CNPJ')).toBeInTheDocument();
      expect(screen.getByText('Nome da Empresa *')).toBeInTheDocument();
      expect(screen.getByText('Endereço Completo')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Telefone')).toBeInTheDocument();
      expect(screen.getByText('Dias de Validade do Orçamento')).toBeInTheDocument();
    });

    it('deve preencher formulário com dados existentes', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('FLAMA Proteção')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12.345.678/0001-90')).toBeInTheDocument();
      expect(screen.getByDisplayValue('contato@flama.com.br')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    });

    it('deve mostrar botão Salvar desabilitado quando form não está dirty', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).toBeDisabled();
    });

    it('deve renderizar com valores default quando não há dados', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  describe('Interações com formulário', () => {
    it('deve atualizar campo nome da empresa', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      expect(screen.getByDisplayValue('Nova Empresa')).toBeInTheDocument();
    });

    it('deve formatar CNPJ ao digitar', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      expect(screen.getByDisplayValue('11.222.333/0001-81')).toBeInTheDocument();
    });

    it('deve formatar telefone fixo ao digitar', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const telefoneInput = screen.getByDisplayValue('(11) 99999-9999');
      fireEvent.change(telefoneInput, { target: { value: '1133334444' } });

      expect(screen.getByDisplayValue('(11) 3333-4444')).toBeInTheDocument();
    });

    it('deve formatar telefone celular ao digitar', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const telefoneInput = screen.getByDisplayValue('(11) 99999-9999');
      fireEvent.change(telefoneInput, { target: { value: '11988887777' } });

      expect(screen.getByDisplayValue('(11) 98888-7777')).toBeInTheDocument();
    });

    it('deve atualizar dias de validade', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const diasInput = screen.getByDisplayValue('30');
      fireEvent.change(diasInput, { target: { value: '45' } });

      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });

    it('deve mostrar botão Cancelar quando form está dirty', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('deve habilitar botão Salvar quando form está dirty', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).not.toBeDisabled();
    });
  });

  describe('Salvar configurações', () => {
    it('deve salvar configurações com sucesso', async () => {
      mockMutateAsync.mockResolvedValue({});

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
        expect(screen.getByText('Configurações salvas com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro ao falhar salvar', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Erro de rede'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar configurações')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Cancelar alterações', () => {
    it('deve restaurar valores originais ao cancelar', async () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nome Alterado' } });

      expect(screen.getByDisplayValue('Nome Alterado')).toBeInTheDocument();

      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('FLAMA Proteção')).toBeInTheDocument();
      });
    });

    it('deve esconder botão cancelar após cancelar', async () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nome Alterado' } });

      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Valores default para diasValidadeOrcamento', () => {
    it('deve usar 30 como valor default quando vazio', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const diasInput = screen.getByDisplayValue('30');
      fireEvent.change(diasInput, { target: { value: '' } });

      // Ao limpar, deve usar 30 como default (parseInt('') || 30)
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  describe('Configurações de Parcelamento', () => {
    it('deve renderizar título e descrição de parcelamento', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Configurações de Parcelamento')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure as regras de parcelamento/)
      ).toBeInTheDocument();
    });

    it('deve renderizar os 4 campos de parcelamento', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Máximo de Parcelas')).toBeInTheDocument();
      expect(screen.getByText('Valor Mínimo por Parcela (R$)')).toBeInTheDocument();
      expect(screen.getByText('Juros a partir da parcela')).toBeInTheDocument();
      expect(screen.getByText('Taxa de Juros por Parcela (%)')).toBeInTheDocument();
    });

    it('deve preencher campos com valores existentes', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          parcelamentoMaxParcelas: 10,
          parcelamentoValorMinimo: 500,
          parcelamentoJurosAPartirDe: 4,
          parcelamentoTaxaJuros: 3.5,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3.5')).toBeInTheDocument();
    });

    it('deve usar valores default quando não configurados', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Default values: 6 parcelas, 1000 mínimo, 3 juros, 2.5 taxa
      expect(screen.getByDisplayValue('6')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2.5')).toBeInTheDocument();
    });

    it('deve atualizar campo máximo de parcelas', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Máximo de Parcelas');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '12' } });

      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });

    it('deve atualizar campo valor mínimo por parcela', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Valor Mínimo por Parcela (R$)');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '2000' } });

      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    });

    it('deve atualizar campo juros a partir da parcela', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Juros a partir da parcela');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '5' } });

      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('deve atualizar campo taxa de juros', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Taxa de Juros por Parcela (%)');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '4.5' } });

      expect(screen.getByDisplayValue('4.5')).toBeInTheDocument();
    });

    it('deve mostrar textos de ajuda para parcelamento', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Número máximo de parcelas permitidas')).toBeInTheDocument();
      expect(screen.getByText('Valor mínimo de cada parcela')).toBeInTheDocument();
      expect(screen.getByText('A partir de qual parcela aplicar juros')).toBeInTheDocument();
      expect(screen.getByText('Percentual de juros por parcela após o limite')).toBeInTheDocument();
    });

    it('deve marcar form como dirty ao alterar parcelamento', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).toBeDisabled();

      const label = screen.getByText('Máximo de Parcelas');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '8' } });

      expect(salvarButton).not.toBeDisabled();
    });

    it('deve salvar configurações de parcelamento', async () => {
      mockMutateAsync.mockResolvedValue({});

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Máximo de Parcelas');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '8' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            parcelamentoMaxParcelas: 8,
          })
        );
      });
    });
  });

  describe('Custo Fixo da Empresa', () => {
    it('deve renderizar título e descrição', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Custo Fixo da Empresa')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure o custo fixo mensal/)
      ).toBeInTheDocument();
    });

    it('deve renderizar campo de custo fixo mensal', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Custo Fixo Mensal (R$)')).toBeInTheDocument();
      expect(screen.getByText('Valor usado para calcular o lucro líquido nos relatórios')).toBeInTheDocument();
    });

    it('deve preencher com valor existente', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          custoFixoMensal: 5000,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    });

    it('deve atualizar campo custo fixo mensal', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Custo Fixo Mensal (R$)');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '7500' } });

      expect(screen.getByDisplayValue('7500')).toBeInTheDocument();
    });

    it('deve salvar custo fixo junto com outros dados', async () => {
      mockMutateAsync.mockResolvedValue({});

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const label = screen.getByText('Custo Fixo Mensal (R$)');
      const formGroup = label.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '8000' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            custoFixoMensal: 8000,
          })
        );
      });
    });
  });

  describe('Configurações de Impostos', () => {
    it('deve renderizar seção de impostos', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Impostos')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure os percentuais de impostos/)
      ).toBeInTheDocument();
    });

    it('deve renderizar campos de imposto sobre material e serviço', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Imposto sobre Material (%)')).toBeInTheDocument();
      expect(screen.getByText('Imposto sobre Serviço (%)')).toBeInTheDocument();
    });

    it('deve preencher campos de impostos com valores existentes', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    it('deve usar 0 como valor default para impostos quando não definidos', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: mockConfiguracoesGerais, // Sem impostoMaterial e impostoServico
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Deve haver campos com valor 0 para impostos
      const zeroInputs = screen.getAllByDisplayValue('0');
      expect(zeroInputs.length).toBeGreaterThanOrEqual(2);
    });

    it('deve atualizar campo imposto sobre material', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Encontrar o input pelo label
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '12.5' } });

      expect(screen.getByDisplayValue('12.5')).toBeInTheDocument();
    });

    it('deve atualizar campo imposto sobre serviço', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Encontrar o input pelo label
      const impostoServicoLabel = screen.getByText('Imposto sobre Serviço (%)');
      const formGroup = impostoServicoLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '18' } });

      expect(screen.getByDisplayValue('18')).toBeInTheDocument();
    });

    it('deve marcar formulário como dirty ao alterar impostos', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 5,
          impostoServico: 10,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Inicialmente o botão Salvar deve estar desabilitado
      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).toBeDisabled();

      // Encontrar e alterar o input de imposto sobre material
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '8' } });

      // Agora o botão Salvar deve estar habilitado
      expect(salvarButton).not.toBeDisabled();
    });

    it('deve salvar impostos junto com outras configurações', async () => {
      mockMutateAsync.mockResolvedValue({});

      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 5,
          impostoServico: 10,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Alterar imposto sobre material
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '12' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            impostoMaterial: 12,
            impostoServico: 10,
          })
        );
      });
    });

    it('deve restaurar valores de impostos ao cancelar', async () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 8,
          impostoServico: 12,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Alterar imposto sobre material
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '20' } });
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();

      // Cancelar
      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        // Valor original deve ser restaurado
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      });
    });

    it('deve aceitar valores decimais para impostos', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '9.75' } });

      expect(screen.getByDisplayValue('9.75')).toBeInTheDocument();
    });

    it('deve mostrar texto de ajuda para campos de impostos', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Percentual de imposto sobre vendas de material')).toBeInTheDocument();
      expect(screen.getByText('Percentual de imposto sobre mão de obra/serviços')).toBeInTheDocument();
    });
  });
});
