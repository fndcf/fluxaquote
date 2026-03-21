import { OrcamentoStatus } from "../models";

/**
 * Mapa de transicoes de status validas para orcamentos.
 */
const transicoesValidas: Record<OrcamentoStatus, OrcamentoStatus[]> = {
  aberto: ["aceito", "recusado", "expirado"],
  aceito: ["aberto"],
  recusado: ["aberto"],
  expirado: ["aberto"],
};

/**
 * Verifica se uma transicao de status eh valida.
 */
export function validarTransicaoStatus(
  statusAtual: OrcamentoStatus,
  statusNovo: OrcamentoStatus
): boolean {
  return transicoesValidas[statusAtual]?.includes(statusNovo) ?? false;
}
