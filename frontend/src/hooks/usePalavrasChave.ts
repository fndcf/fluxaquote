import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { palavraChaveService } from '../services/palavraChaveService';
import { PalavraChave } from '../types';

export function usePalavrasChave() {
  return useQuery<PalavraChave[]>({
    queryKey: ['palavrasChave'],
    queryFn: palavraChaveService.listar,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados de catálogo
  });
}

export function usePalavrasChaveAtivas() {
  return useQuery<PalavraChave[]>({
    queryKey: ['palavrasChaveAtivas'],
    queryFn: palavraChaveService.listarAtivas,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados de catálogo
  });
}

export function useCriarPalavraChave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { palavra: string; prazoDias: number; ativo?: boolean }) =>
      palavraChaveService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['palavrasChave'] });
      queryClient.invalidateQueries({ queryKey: ['palavrasChaveAtivas'] });
    },
  });
}

export function useAtualizarPalavraChave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { palavra?: string; prazoDias?: number; ativo?: boolean } }) =>
      palavraChaveService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['palavrasChave'] });
      queryClient.invalidateQueries({ queryKey: ['palavrasChaveAtivas'] });
    },
  });
}

export function useTogglePalavraChave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => palavraChaveService.toggleAtivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['palavrasChave'] });
      queryClient.invalidateQueries({ queryKey: ['palavrasChaveAtivas'] });
    },
  });
}

export function useExcluirPalavraChave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => palavraChaveService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['palavrasChave'] });
      queryClient.invalidateQueries({ queryKey: ['palavrasChaveAtivas'] });
    },
  });
}
