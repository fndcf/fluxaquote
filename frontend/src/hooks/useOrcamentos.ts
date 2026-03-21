import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { orcamentoService } from '../services/orcamentoService';
import { OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, ParcelamentoDados, DescontoAVistaDados } from '../types';

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number | null;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number | null;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  introducao?: string;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

export function useOrcamentos() {
  return useQuery({
    queryKey: ['orcamentos'],
    queryFn: orcamentoService.listar,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useOrcamento(id: string) {
  return useQuery({
    queryKey: ['orcamento', id],
    queryFn: () => orcamentoService.buscarPorId(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useOrcamentosPorCliente(clienteId: string) {
  return useQuery({
    queryKey: ['orcamentos', 'cliente', clienteId],
    queryFn: () => orcamentoService.buscarPorCliente(clienteId),
    enabled: !!clienteId,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useHistoricoCliente(clienteId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['orcamentos', 'historico', clienteId, limit],
    queryFn: () => orcamentoService.getHistoricoCliente(clienteId, limit),
    enabled: !!clienteId,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useOrcamentosPorStatus(status: OrcamentoStatus) {
  return useQuery({
    queryKey: ['orcamentos', 'status', status],
    queryFn: () => orcamentoService.buscarPorStatus(status),
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useOrcamentosPorPeriodo(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: ['orcamentos', 'periodo', dataInicio, dataFim],
    queryFn: () => orcamentoService.buscarPorPeriodo(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useOrcamentosPaginados(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: OrcamentoStatus;
    clienteId?: string;
    busca?: string;
  }
) {
  return useQuery({
    queryKey: ['orcamentos', 'paginated', page, limit, filters],
    queryFn: () => orcamentoService.listarPaginado(page, limit, filters),
    placeholderData: keepPreviousData, // Mantém dados anteriores enquanto carrega nova página
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useEstatisticasOrcamentos() {
  return useQuery({
    queryKey: ['orcamentos', 'estatisticas'],
    queryFn: orcamentoService.getEstatisticas,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['orcamentos', 'dashboard-stats'],
    queryFn: () => orcamentoService.getDashboardStats(),
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useCriarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CriarOrcamentoDTO) => orcamentoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
    },
  });
}

export function useAtualizarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarOrcamentoDTO }) =>
      orcamentoService.atualizar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', id] });
    },
  });
}

export function useAtualizarStatusOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrcamentoStatus }) =>
      orcamentoService.atualizarStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', id] });
    },
  });
}

export function useExcluirOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orcamentoService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
    },
  });
}

export function useDuplicarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orcamentoService.duplicar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
    },
  });
}

export function useVerificarExpirados() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => orcamentoService.verificarExpirados(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
    },
  });
}
