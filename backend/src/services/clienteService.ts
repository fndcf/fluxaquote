import { Cliente, PaginatedResponse } from '../models';
import { createClienteRepository } from '../repositories/clienteRepository';
import { ValidationError } from '../utils/errors';

export function createClienteService(tenantId: string) {
  const clienteRepo = createClienteRepository(tenantId);

  const listar = async (): Promise<Cliente[]> => {
    return clienteRepo.findAll();
  };

  const listarPaginado = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      busca?: string;
    }
  ): Promise<PaginatedResponse<Cliente>> => {
    return clienteRepo.findPaginated(page, limit, filters);
  };

  const buscarPorId = async (id: string): Promise<Cliente> => {
    return clienteRepo.findById(id);
  };

  const buscarPorDocumento = async (documento: string): Promise<Cliente | null> => {
    return clienteRepo.findByDocumento(documento);
  };

  const pesquisar = async (termo: string): Promise<Cliente[]> => {
    if (!termo || termo.length < 2) {
      return [];
    }
    return clienteRepo.search(termo);
  };

  const criar = async (data: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> => {
    // Validações
    if (!data.razaoSocial || data.razaoSocial.trim().length < 3) {
      throw new ValidationError('Nome/Razão social deve ter pelo menos 3 caracteres');
    }

    const docLimpo = data.cnpj?.replace(/\D/g, '') || '';

    // Se documento foi informado, validar
    if (docLimpo) {
      // Validar CPF (11 dígitos) ou CNPJ (14 dígitos)
      if (docLimpo.length !== 11 && docLimpo.length !== 14) {
        throw new ValidationError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }

      // Verificar se já existe cliente com este documento
      const existente = await clienteRepo.findByDocumento(docLimpo);
      if (existente) {
        throw new ValidationError('Já existe um cliente cadastrado com este CPF/CNPJ');
      }
    } else if (data.tipoPessoa === 'juridica') {
      // CNPJ é obrigatório para pessoa jurídica
      throw new ValidationError('CNPJ é obrigatório para pessoa jurídica');
    }

    return clienteRepo.create(data);
  };

  const atualizar = async (id: string, data: Partial<Cliente>): Promise<Cliente> => {
    if (data.razaoSocial && data.razaoSocial.trim().length < 3) {
      throw new ValidationError('Nome/Razão social deve ter pelo menos 3 caracteres');
    }

    if (data.cnpj) {
      const docLimpo = data.cnpj.replace(/\D/g, '');

      // Se documento foi informado, validar formato
      if (docLimpo && docLimpo.length !== 11 && docLimpo.length !== 14) {
        throw new ValidationError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }

      // Verificar se já existe outro cliente com este documento
      if (docLimpo) {
        const existente = await clienteRepo.findByDocumento(docLimpo);
        if (existente && existente.id !== id) {
          throw new ValidationError('Já existe outro cliente cadastrado com este CPF/CNPJ');
        }
      }
    }

    // Se está mudando para pessoa jurídica, CNPJ é obrigatório
    if (data.tipoPessoa === 'juridica') {
      const docLimpo = data.cnpj?.replace(/\D/g, '') || '';
      if (!docLimpo || docLimpo.length !== 14) {
        throw new ValidationError('CNPJ é obrigatório para pessoa jurídica');
      }
    }

    return clienteRepo.update(id, data);
  };

  const excluir = async (id: string): Promise<void> => {
    return clienteRepo.delete(id);
  };

  return {
    listar,
    listarPaginado,
    buscarPorId,
    buscarPorDocumento,
    pesquisar,
    criar,
    atualizar,
    excluir,
  };
}
