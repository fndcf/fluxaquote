export interface ConfiguracoesGerais {
  diasValidadeOrcamento: number;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  enderecoEmpresa: string;
  telefoneEmpresa: string;
  emailEmpresa?: string;
  logoUrl?: string;
  parcelamentoMaxParcelas?: number;
  parcelamentoValorMinimo?: number;
  parcelamentoJurosAPartirDe?: number;
  parcelamentoTaxaJuros?: number;
  custoFixoMensal?: number;
  impostoMaterial?: number;
  impostoServico?: number;
  corPrimaria?: string;
  corSecundaria?: string;
}

// DTOs
export type UpdateConfiguracoesDTO = Partial<ConfiguracoesGerais>;
