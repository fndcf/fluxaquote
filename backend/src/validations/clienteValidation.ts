import { z } from 'zod';

export const createClienteSchema = z.object({
  razaoSocial: z.string().min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  tipoPessoa: z.enum(['fisica', 'juridica']).optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export const updateClienteSchema = createClienteSchema.partial();
