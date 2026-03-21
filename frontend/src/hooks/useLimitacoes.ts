import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { limitacaoService } from '../services/limitacaoService';
import { Limitacao } from '../types';

export function useLimitacoes() {
  return useQuery<Limitacao[]>({
    queryKey: ['limitacoes'],
    queryFn: limitacaoService.listar,
  });
}

export function useLimitacoesAtivas() {
  return useQuery<Limitacao[]>({
    queryKey: ['limitacoes-ativas'],
    queryFn: limitacaoService.listarAtivas,
  });
}

export function useCriarLimitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { texto: string; ativo?: boolean }) => limitacaoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['limitacoes-ativas'] });
    },
  });
}

export function useAtualizarLimitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { texto?: string; ativo?: boolean; ordem?: number } }) =>
      limitacaoService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['limitacoes-ativas'] });
    },
  });
}

export function useToggleLimitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => limitacaoService.toggleAtivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['limitacoes-ativas'] });
    },
  });
}

export function useExcluirLimitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => limitacaoService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['limitacoes-ativas'] });
    },
  });
}
