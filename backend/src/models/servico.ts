export interface Servico {
  id?: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateServicoDTO = Omit<Servico, 'id' | 'createdAt'>;
export type UpdateServicoDTO = Partial<Servico>;
