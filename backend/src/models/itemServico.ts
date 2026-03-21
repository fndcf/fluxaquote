export interface ItemServico {
  id?: string;
  categoriaId: string;
  descricao: string;
  unidade: string;
  valorUnitario?: number;
  valorMaoDeObraUnitario?: number;
  valorCusto?: number;
  valorMaoDeObraCusto?: number;
  ativo: boolean;
  ordem: number;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateItemServicoDTO = Omit<ItemServico, 'id' | 'createdAt'>;
export type UpdateItemServicoDTO = Partial<ItemServico>;
