import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ServicoSection,
  LimitacoesSection,
  PrazosSection,
  CondicaoPagamentoFormSection,
} from '../../../components/orcamentos/OrcamentoModal/OrcamentoCompletoSections';
import { Servico, Limitacao } from '../../../types';

describe('OrcamentoCompletoSections', () => {
  describe('ServicoSection', () => {
    const mockServicos: Servico[] = [
      { id: 's1', descricao: 'Assessoria de incêndio', ativo: true, ordem: 0, createdAt: new Date() },
      { id: 's2', descricao: 'Consultoria de segurança', ativo: true, ordem: 1, createdAt: new Date() },
    ];
    const mockOnServicoChange = vi.fn();

    it('deve renderizar título Serviço', () => {
      render(
        <ServicoSection
          servicoId=""
          servicos={mockServicos}
          onServicoChange={mockOnServicoChange}
        />
      );

      expect(screen.getByText('Serviço')).toBeInTheDocument();
    });

    it('deve renderizar opções de serviço', () => {
      render(
        <ServicoSection
          servicoId=""
          servicos={mockServicos}
          onServicoChange={mockOnServicoChange}
        />
      );

      expect(screen.getByText('Selecione um serviço')).toBeInTheDocument();
      expect(screen.getByText('Assessoria de incêndio')).toBeInTheDocument();
      expect(screen.getByText('Consultoria de segurança')).toBeInTheDocument();
    });

    it('deve chamar onServicoChange ao selecionar', () => {
      render(
        <ServicoSection
          servicoId=""
          servicos={mockServicos}
          onServicoChange={mockOnServicoChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 's1' } });

      expect(mockOnServicoChange).toHaveBeenCalledWith('s1');
    });

    it('deve exibir erro quando fornecido', () => {
      render(
        <ServicoSection
          servicoId=""
          servicos={mockServicos}
          error="Serviço é obrigatório"
          onServicoChange={mockOnServicoChange}
        />
      );

      expect(screen.getByText('Serviço é obrigatório')).toBeInTheDocument();
    });

    it('deve renderizar sem serviços', () => {
      render(
        <ServicoSection
          servicoId=""
          servicos={undefined}
          onServicoChange={mockOnServicoChange}
        />
      );

      expect(screen.getByText('Selecione um serviço')).toBeInTheDocument();
    });

    it('deve truncar descrição longa', () => {
      const servicoLongo: Servico[] = [
        {
          id: 's1',
          descricao: 'A'.repeat(100),
          ativo: true,
          ordem: 0,
          createdAt: new Date(),
        },
      ];

      render(
        <ServicoSection
          servicoId=""
          servicos={servicoLongo}
          onServicoChange={mockOnServicoChange}
        />
      );

      // Deve truncar a 80 chars
      const option = screen.getByText(/A{1,}\.{3}/);
      expect(option).toBeInTheDocument();
    });
  });

  describe('LimitacoesSection', () => {
    const mockLimitacoes: Limitacao[] = [
      { id: 'l1', texto: 'Não inclui obras civis', ativo: true, ordem: 0, createdAt: new Date() },
      { id: 'l2', texto: 'Sujeito a disponibilidade', ativo: true, ordem: 1, createdAt: new Date() },
      { id: 'l3', texto: 'Não inclui materiais elétricos', ativo: true, ordem: 2, createdAt: new Date() },
    ];
    const mockOnToggle = vi.fn();
    const mockOnToggleAll = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('deve renderizar título Observações', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={[]}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('Observações')).toBeInTheDocument();
    });

    it('deve renderizar checkboxes para cada limitação', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={[]}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('Não inclui obras civis')).toBeInTheDocument();
      expect(screen.getByText('Sujeito a disponibilidade')).toBeInTheDocument();
    });

    it('deve marcar checkboxes para limitações selecionadas', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={['l1']}
          onToggle={mockOnToggle}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('deve chamar onToggle ao clicar no checkbox', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={[]}
          onToggle={mockOnToggle}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnToggle).toHaveBeenCalledWith('l1');
    });

    it('deve mostrar mensagem quando não há limitações', () => {
      render(
        <LimitacoesSection
          limitacoes={[]}
          selecionadas={[]}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText(/Nenhuma observação cadastrada/)).toBeInTheDocument();
    });

    it('deve mostrar mensagem quando limitações é undefined', () => {
      render(
        <LimitacoesSection
          limitacoes={undefined}
          selecionadas={[]}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText(/Nenhuma observação cadastrada/)).toBeInTheDocument();
    });

    it('deve renderizar botão Selecionar Todos quando onToggleAll fornecido', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={[]}
          onToggle={mockOnToggle}
          onToggleAll={mockOnToggleAll}
        />
      );

      expect(screen.getByText('Selecionar Todos')).toBeInTheDocument();
    });

    it('deve renderizar botão Desmarcar Todos quando todos selecionados', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={['l1', 'l2', 'l3']}
          onToggle={mockOnToggle}
          onToggleAll={mockOnToggleAll}
        />
      );

      expect(screen.getByText('Desmarcar Todos')).toBeInTheDocument();
    });

    it('deve chamar onToggleAll com todos os ids ao selecionar todos', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={[]}
          onToggle={mockOnToggle}
          onToggleAll={mockOnToggleAll}
        />
      );

      fireEvent.click(screen.getByText('Selecionar Todos'));

      expect(mockOnToggleAll).toHaveBeenCalledWith(['l1', 'l2', 'l3']);
    });

    it('deve chamar onToggleAll com array vazio ao desmarcar todos', () => {
      render(
        <LimitacoesSection
          limitacoes={mockLimitacoes}
          selecionadas={['l1', 'l2', 'l3']}
          onToggle={mockOnToggle}
          onToggleAll={mockOnToggleAll}
        />
      );

      fireEvent.click(screen.getByText('Desmarcar Todos'));

      expect(mockOnToggleAll).toHaveBeenCalledWith([]);
    });
  });

  describe('PrazosSection', () => {
    const mockOnPrazoExecucaoChange = vi.fn();
    const mockOnPrazoVistoriaChange = vi.fn();

    it('deve renderizar título Prazos', () => {
      render(
        <PrazosSection
          prazoExecucao={null}
          prazoVistoria={null}
          onPrazoExecucaoChange={mockOnPrazoExecucaoChange}
          onPrazoVistoriaChange={mockOnPrazoVistoriaChange}
        />
      );

      expect(screen.getByText('Prazos')).toBeInTheDocument();
    });

    it('deve renderizar campo de prazo de execução', () => {
      render(
        <PrazosSection
          prazoExecucao={15}
          prazoVistoria={null}
          onPrazoExecucaoChange={mockOnPrazoExecucaoChange}
          onPrazoVistoriaChange={mockOnPrazoVistoriaChange}
        />
      );

      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    it('deve chamar onPrazoExecucaoChange ao alterar', () => {
      render(
        <PrazosSection
          prazoExecucao={15}
          prazoVistoria={null}
          onPrazoExecucaoChange={mockOnPrazoExecucaoChange}
          onPrazoVistoriaChange={mockOnPrazoVistoriaChange}
        />
      );

      const input = screen.getByDisplayValue('15');
      fireEvent.change(input, { target: { value: '30' } });

      expect(mockOnPrazoExecucaoChange).toHaveBeenCalledWith(30);
    });

    it('deve chamar com null quando campo vazio', () => {
      render(
        <PrazosSection
          prazoExecucao={15}
          prazoVistoria={null}
          onPrazoExecucaoChange={mockOnPrazoExecucaoChange}
          onPrazoVistoriaChange={mockOnPrazoVistoriaChange}
        />
      );

      const input = screen.getByDisplayValue('15');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnPrazoExecucaoChange).toHaveBeenCalledWith(null);
    });
  });

  describe('CondicaoPagamentoFormSection', () => {
    const defaultProps = {
      condicao: 'a_combinar' as const,
      parcelamentoTexto: '',
      parcelamentoDados: undefined,
      descontoAVista: undefined,
      onCondicaoChange: vi.fn(),
      onParcelamentoTextoChange: vi.fn(),
      onParcelamentoDadosChange: vi.fn(),
      onDescontoAVistaChange: vi.fn(),
      valorTotal: 5000,
      configuracoes: undefined,
    };

    it('deve renderizar título Preços e Condições de Pagamento', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      expect(screen.getByText(/Preços e Condições de Pagamento/)).toBeInTheDocument();
    });

    it('deve renderizar opções de condição', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      expect(screen.getByText('A combinar')).toBeInTheDocument();
      expect(screen.getByText('À vista')).toBeInTheDocument();
      expect(screen.getByText('Parcelado')).toBeInTheDocument();
    });

    it('deve chamar onCondicaoChange ao selecionar condição', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      fireEvent.click(screen.getByText('À vista'));

      expect(defaultProps.onCondicaoChange).toHaveBeenCalledWith('a_vista');
    });

    it('deve renderizar radio selecionado para A combinar', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} condicao="a_combinar" />);

      const radios = screen.getAllByRole('radio');
      // a_vista, a_combinar, parcelado - a_combinar is the second
      const aCombinarRadio = radios.find(
        (r) => (r as HTMLInputElement).checked
      );
      expect(aCombinarRadio).toBeTruthy();
    });

    it('deve renderizar opções de parcelamento para Parcelado', () => {
      render(
        <CondicaoPagamentoFormSection
          {...defaultProps}
          condicao="parcelado"
          valorTotal={10000}
        />
      );

      expect(screen.getByText('Entrada')).toBeInTheDocument();
    });
  });
});
