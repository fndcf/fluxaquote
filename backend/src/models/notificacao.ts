export interface Notificacao {
  id?: string;
  orcamentoId: string;
  orcamentoNumero: number;
  orcamentoDataEmissao?: Date;
  clienteId: string;
  clienteNome: string;
  itemDescricao: string;
  palavraChave: string;
  dataVencimento: Date;
  lida: boolean;
  createdAt: Date;
}

// DTOs
export type CreateNotificacaoDTO = Omit<Notificacao, 'id' | 'createdAt'>;
