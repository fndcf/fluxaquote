import { z } from 'zod';

export const updateConfiguracoesSchema = z.object({
  diasValidadeOrcamento: z.number().int().min(1).optional(),
  nomeEmpresa: z.string().min(2).optional(),
  cnpjEmpresa: z.string().optional(),
  enderecoEmpresa: z.string().optional(),
  telefoneEmpresa: z.string().optional(),
  emailEmpresa: z.string().email().optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  parcelamentoMaxParcelas: z.number().int().min(1).max(24).optional(),
  parcelamentoValorMinimo: z.number().min(0).optional(),
  parcelamentoJurosAPartirDe: z.number().int().min(1).optional(),
  parcelamentoTaxaJuros: z.number().min(0).max(100).optional(),
  custoFixoMensal: z.number().min(0).optional(),
  impostoMaterial: z.number().min(0).max(100).optional(),
  impostoServico: z.number().min(0).max(100).optional(),
  corPrimaria: z.string().optional(),
  corSecundaria: z.string().optional(),
}).partial();
