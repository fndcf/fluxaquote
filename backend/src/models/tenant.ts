export interface Tenant {
  id?: string;
  slug: string;
  nomeEmpresa: string;
  email: string;
  telefone: string;
  ownerId: string;
  plano: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserTenant {
  tenantId: string;
  slug: string;
  role: string;
  createdAt: Date;
}
