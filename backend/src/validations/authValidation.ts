import { z } from 'zod';

export const registerSchema = z.object({
  nomeEmpresa: z
    .string()
    .min(3, 'Nome da empresa deve ter pelo menos 3 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Email inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone inválido'),
  senha: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
