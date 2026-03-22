import { z } from 'zod';

const orcamentoItemCompletoSchema = z.object({
  etapa: z.enum(['comercial', 'residencial']),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  categoriaNome: z.string().optional().default(''),
  descricao: z.string().min(3, 'Descrição do item deve ter pelo menos 3 caracteres'),
  unidade: z.string().min(1),
  quantidade: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  valorUnitarioMaoDeObra: z.number().min(0).default(0),
  valorUnitarioMaterial: z.number().min(0).default(0),
  valorTotalMaoDeObra: z.number().min(0).optional().default(0),
  valorTotalMaterial: z.number().min(0).optional().default(0),
  valorTotal: z.number().min(0).optional().default(0),
});

const parcelamentoOpcaoSchema = z.object({
  numeroParcelas: z.number().int().min(1),
  valorParcela: z.number().min(0),
  valorTotal: z.number().min(0),
  temJuros: z.boolean(),
  taxaJuros: z.number().min(0),
});

const parcelamentoDadosSchema = z.object({
  entradaPercent: z.number().min(0).max(100),
  valorEntrada: z.number().min(0),
  valorRestante: z.number().min(0),
  opcoes: z.array(parcelamentoOpcaoSchema),
});

const descontoAVistaDadosSchema = z.object({
  percentual: z.number().min(0).max(100),
  valorDesconto: z.number().min(0),
  valorFinal: z.number().min(0),
});

export const createOrcamentoSchema = z.object({
  tipo: z.literal('completo').default('completo'),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  servicoId: z.string().optional(),
  servicoDescricao: z.string().optional(),
  itensCompleto: z.array(orcamentoItemCompletoSchema).optional(),
  limitacoesSelecionadas: z.array(z.string()).optional(),
  prazoExecucaoServicos: z.number().int().min(1).nullable().optional(),
  prazoVistoriaBombeiros: z.number().int().min(1).nullable().optional(),
  condicaoPagamento: z.enum(['a_vista', 'a_combinar', 'parcelado']).optional(),
  parcelamentoTexto: z.string().optional(),
  parcelamentoDados: parcelamentoDadosSchema.nullable().optional(),
  descontoAVista: descontoAVistaDadosSchema.nullable().optional(),
  mostrarValoresDetalhados: z.boolean().optional(),
  introducao: z.string().optional(),
  observacoes: z.string().optional(),
  diasValidade: z.number().int().min(1).optional(),
  consultor: z.string().optional(),
  contato: z.string().optional(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  enderecoServico: z.string().optional(),
}).passthrough(); // Permite campos extras (clienteNome, clienteCnpj, etc.)

export const updateOrcamentoSchema = z.object({
  servicoId: z.string().min(1).optional(),
  servicoDescricao: z.string().optional(),
  itensCompleto: z.array(orcamentoItemCompletoSchema).min(1, 'O orçamento deve ter pelo menos um item').optional(),
  limitacoesSelecionadas: z.array(z.string()).optional(),
  prazoExecucaoServicos: z.number().int().min(1).nullable().optional(),
  prazoVistoriaBombeiros: z.number().int().min(1).nullable().optional(),
  condicaoPagamento: z.enum(['a_vista', 'a_combinar', 'parcelado']).optional(),
  parcelamentoTexto: z.string().optional(),
  parcelamentoDados: parcelamentoDadosSchema.nullable().optional(),
  descontoAVista: descontoAVistaDadosSchema.nullable().optional(),
  mostrarValoresDetalhados: z.boolean().optional(),
  introducao: z.string().optional(),
  observacoes: z.string().optional(),
  dataValidade: z.string().or(z.date()).optional(),
  consultor: z.string().optional(),
  contato: z.string().optional(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  enderecoServico: z.string().optional(),
}).passthrough(); // Permite campos extras

export const updateOrcamentoStatusSchema = z.object({
  status: z.enum(['aberto', 'aceito', 'recusado', 'expirado'], {
    required_error: 'Status é obrigatório',
  }),
});
