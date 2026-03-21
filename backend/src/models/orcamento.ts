import { TipoPessoa } from './cliente';

export type OrcamentoStatus = "aberto" | "aceito" | "recusado" | "expirado";
export type OrcamentoTipo = "completo";
export type EtapaTipo = "comercial" | "residencial";

export interface OrcamentoItemCompleto {
  etapa: EtapaTipo;
  categoriaId: string;
  categoriaNome: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitarioMaoDeObra: number;
  valorUnitarioMaterial: number;
  valorTotalMaoDeObra: number;
  valorTotalMaterial: number;
  valorTotal: number;
}

export interface ParcelamentoOpcao {
  numeroParcelas: number;
  valorParcela: number;
  valorTotal: number;
  temJuros: boolean;
  taxaJuros: number;
}

export interface ParcelamentoDados {
  entradaPercent: number;
  valorEntrada: number;
  valorRestante: number;
  opcoes: ParcelamentoOpcao[];
}

export interface DescontoAVistaDados {
  percentual: number;
  valorDesconto: number;
  valorFinal: number;
}

export interface Orcamento {
  id?: string;
  numero: number;
  versao: number;
  tipo: OrcamentoTipo;
  clienteId: string;
  clienteNome: string;
  clienteCnpj: string;
  clienteTipoPessoa?: TipoPessoa;
  clienteEndereco?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteCep?: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
  status: OrcamentoStatus;
  dataEmissao: Date;
  dataValidade: Date;
  dataAceite?: Date;
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados | null;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  introducao?: string;
  valorTotal: number;
  valorTotalMaoDeObra?: number;
  valorTotalMaterial?: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateOrcamentoDTO = Omit<Orcamento, 'id' | 'createdAt'>;
export type UpdateOrcamentoDTO = Partial<Orcamento>;
