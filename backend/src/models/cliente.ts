export type TipoPessoa = "fisica" | "juridica";

export interface Cliente {
  id?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  tipoPessoa?: TipoPessoa;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateClienteDTO = Omit<Cliente, 'id' | 'createdAt'>;
export type UpdateClienteDTO = Partial<CreateClienteDTO>;
