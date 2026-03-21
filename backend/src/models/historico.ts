export interface HistoricoValorItem {
  id?: string;
  itemServicoId: string;
  descricao: string;
  dataVigencia: Date;
  valorUnitario: number;
  valorMaoDeObraUnitario: number;
  valorCusto: number;
  valorMaoDeObraCusto: number;
  createdAt: Date;
}

export interface HistoricoConfiguracao {
  id?: string;
  dataVigencia: Date;
  custoFixoMensal: number;
  impostoMaterial: number;
  impostoServico: number;
  createdAt: Date;
}

// DTOs
export type CreateHistoricoValorItemDTO = Omit<HistoricoValorItem, 'id' | 'createdAt'>;
export type CreateHistoricoConfiguracaoDTO = Omit<HistoricoConfiguracao, 'id' | 'createdAt'>;
