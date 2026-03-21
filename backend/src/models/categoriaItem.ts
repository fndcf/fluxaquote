export interface CategoriaItem {
  id?: string;
  nome: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateCategoriaItemDTO = Omit<CategoriaItem, 'id' | 'createdAt'>;
export type UpdateCategoriaItemDTO = Partial<CategoriaItem>;
