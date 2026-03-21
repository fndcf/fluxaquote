export interface PalavraChave {
  id?: string;
  palavra: string;
  prazoDias: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreatePalavraChaveDTO = Omit<PalavraChave, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePalavraChaveDTO = Partial<Omit<PalavraChave, 'id' | 'createdAt'>>;
