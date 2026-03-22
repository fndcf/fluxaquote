import { z } from 'zod';

export const createPalavraChaveSchema = z.object({
  palavra: z.string().min(2, 'Palavra deve ter pelo menos 2 caracteres'),
  prazoDias: z.number().int().min(1, 'Prazo deve ser de pelo menos 1 dia'),
  ativo: z.boolean().optional().default(true),
});

export const updatePalavraChaveSchema = z.object({
  palavra: z.string().min(2).optional(),
  prazoDias: z.number().int().min(1).optional(),
  ativo: z.boolean().optional(),
});
