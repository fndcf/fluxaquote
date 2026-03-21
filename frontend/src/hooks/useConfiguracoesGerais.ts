import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracoesGeraisService } from '../services/configuracoesGeraisService';
import { ConfiguracoesGerais } from '../types';

export function useConfiguracoesGerais() {
  return useQuery<ConfiguracoesGerais>({
    queryKey: ['configuracoes-gerais'],
    queryFn: configuracoesGeraisService.buscar,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados de catálogo
  });
}

export function useAtualizarConfiguracoesGerais() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ConfiguracoesGerais>) => configuracoesGeraisService.atualizar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-gerais'] });
    },
  });
}
