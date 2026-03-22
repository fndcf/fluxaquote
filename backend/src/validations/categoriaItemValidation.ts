import { z } from 'zod';

export const createCategoriaItemSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  ativo: z.boolean().optional().default(true),
});

export const updateCategoriaItemSchema = z.object({
  nome: z.string().min(2).optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
});
