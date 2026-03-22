import { z } from 'zod';

export const createServicoSchema = z.object({
  descricao: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  ativo: z.boolean().optional().default(true),
});

export const updateServicoSchema = z.object({
  descricao: z.string().min(2).optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
});
