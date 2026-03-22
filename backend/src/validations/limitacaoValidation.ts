import { z } from 'zod';

export const createLimitacaoSchema = z.object({
  texto: z.string().min(3, 'Texto deve ter pelo menos 3 caracteres'),
  ativo: z.boolean().optional().default(true),
});

export const updateLimitacaoSchema = z.object({
  texto: z.string().min(3).optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
});
