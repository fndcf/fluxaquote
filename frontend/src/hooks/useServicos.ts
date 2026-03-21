import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicoService } from '../services/servicoService';
import { Servico } from '../types';

export function useServicos() {
  return useQuery<Servico[]>({
    queryKey: ['servicos'],
    queryFn: servicoService.listar,
  });
}

export function useServicosAtivos() {
  return useQuery<Servico[]>({
    queryKey: ['servicos-ativos'],
    queryFn: servicoService.listarAtivos,
  });
}

export function useCriarServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { descricao: string; ativo?: boolean }) => servicoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos-ativos'] });
    },
  });
}

export function useAtualizarServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { descricao?: string; ativo?: boolean; ordem?: number } }) =>
      servicoService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos-ativos'] });
    },
  });
}

export function useToggleServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicoService.toggleAtivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos-ativos'] });
    },
  });
}

export function useExcluirServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicoService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos-ativos'] });
    },
  });
}
