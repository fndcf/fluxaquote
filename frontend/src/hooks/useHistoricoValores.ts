import { useQuery } from '@tanstack/react-query';
import { historicoValoresService } from '../services/historicoValoresService';
import { HistoricoValorItem, HistoricoConfiguracao } from '../types';

export function useHistoricoItens(dataInicio: string, dataFim: string, enabled = true) {
  return useQuery<HistoricoValorItem[]>({
    queryKey: ['historico-itens', dataInicio, dataFim],
    queryFn: () => historicoValoresService.buscarHistoricoItens(dataInicio, dataFim),
    enabled: enabled && !!dataInicio && !!dataFim,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}

export function useHistoricoConfiguracoes(dataInicio: string, dataFim: string, enabled = true) {
  return useQuery<HistoricoConfiguracao[]>({
    queryKey: ['historico-configuracoes', dataInicio, dataFim],
    queryFn: () => historicoValoresService.buscarHistoricoConfiguracoes(dataInicio, dataFim),
    enabled: enabled && !!dataInicio && !!dataFim,
    staleTime: 1 * 60 * 1000, // 1 minuto - dados de negócio
  });
}
