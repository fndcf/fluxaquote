import { z } from 'zod';

export const createItemServicoSchema = z.object({
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  ativo: z.boolean().optional().default(true),
  valorUnitario: z.number().min(0).optional(),
  valorMaoDeObraUnitario: z.number().min(0).optional(),
  valorCusto: z.number().min(0).optional(),
  valorMaoDeObraCusto: z.number().min(0).optional(),
});

export const updateItemServicoSchema = z.object({
  descricao: z.string().min(2).optional(),
  unidade: z.string().min(1).optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
  valorUnitario: z.number().min(0).optional(),
  valorMaoDeObraUnitario: z.number().min(0).optional(),
  valorCusto: z.number().min(0).optional(),
  valorMaoDeObraCusto: z.number().min(0).optional(),
});
