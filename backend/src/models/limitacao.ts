export interface Limitacao {
  id?: string;
  texto: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateLimitacaoDTO = Omit<Limitacao, 'id' | 'createdAt'>;
export type UpdateLimitacaoDTO = Partial<Limitacao>;
