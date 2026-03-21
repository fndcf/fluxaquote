import { createOrcamentoRepository } from "../repositories/orcamentoRepository";
import { createClienteRepository } from "../repositories/clienteRepository";
import { createConfiguracoesGeraisRepository } from "../repositories/configuracoesGeraisRepository";
import {
  Orcamento,
  OrcamentoItemCompleto,
  OrcamentoStatus,
  OrcamentoTipo,
  TipoPessoa,
  ParcelamentoDados,
  DescontoAVistaDados,
  DashboardStats,
  PaginatedResponse,
} from "../models";
import { ValidationError, NotFoundError } from "../utils/errors";
import { eventBus, OrcamentoEvents } from "../events";
import { FieldValue } from "../config/firebase";
import { calcularItens, calcularTotais } from "./orcamentoCalculator";
import { validarTransicaoStatus } from "./orcamentoStatusMachine";
import { calcularDashboardStats } from "./orcamentoDashboardService";

// Helper para detectar tipo de pessoa baseado no documento (CPF ou CNPJ)
function detectarTipoPessoa(documento: string): TipoPessoa {
  const docLimpo = documento?.replace(/\D/g, "") || "";
  return docLimpo.length <= 11 ? "fisica" : "juridica";
}

// Helper para comparar valores de forma profunda (para detectar mudanças reais)
function isEqual(a: any, b: any): boolean {
  // Se ambos são null/undefined
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  // Se são tipos primitivos
  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  // Se são objetos Date, comparar timestamps
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Se apenas um é Date, não são iguais
  if (a instanceof Date || b instanceof Date) {
    return false;
  }

  // Se são arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // Se são objetos
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => isEqual(a[key], b[key]));
}

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number | null;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados;
  mostrarValoresDetalhados?: boolean;
  introducao?: string;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number | null;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados;
  mostrarValoresDetalhados?: boolean;
  introducao?: string;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

export function createOrcamentoService(tenantId: string) {
  const orcamentoRepo = createOrcamentoRepository(tenantId);
  const clienteRepo = createClienteRepository(tenantId);
  const configRepo = createConfiguracoesGeraisRepository(tenantId);

  const listar = async (): Promise<Orcamento[]> => {
    return orcamentoRepo.findAll();
  };

  const listarPaginado = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: OrcamentoStatus;
      clienteId?: string;
      busca?: string;
    }
  ): Promise<PaginatedResponse<Orcamento>> => {
    return orcamentoRepo.findPaginated(page, limit, filters);
  };

  const buscarPorId = async (id: string): Promise<Orcamento> => {
    return orcamentoRepo.findById(id);
  };

  const buscarPorCliente = async (clienteId: string): Promise<Orcamento[]> => {
    return orcamentoRepo.findByClienteId(clienteId);
  };

  const getHistoricoCliente = async (clienteId: string, limit: number = 5): Promise<{
    orcamentos: Orcamento[];
    resumo: {
      total: number;
      aceitos: number;
      valorTotalAceitos: number;
    };
  }> => {
    return orcamentoRepo.getHistoricoCliente(clienteId, limit);
  };

  const buscarPorStatus = async (status: OrcamentoStatus): Promise<Orcamento[]> => {
    return orcamentoRepo.findByStatus(status);
  };

  const buscarPorPeriodo = async (dataInicio: string, dataFim: string): Promise<Orcamento[]> => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new ValidationError('Datas inválidas');
    }

    // Ajustar fim para o final do dia
    fim.setHours(23, 59, 59, 999);

    return orcamentoRepo.findByPeriodo(inicio, fim);
  };

  const criar = async (data: CriarOrcamentoDTO): Promise<Orcamento> => {
    // Validar cliente
    const cliente = await clienteRepo.findById(data.clienteId);
    if (!cliente) {
      throw new NotFoundError("Cliente não encontrado");
    }

    // Obter próximo número
    const numero = await orcamentoRepo.getNextNumero();

    // Buscar configuração de dias de validade
    const configuracoes = await configRepo.get();
    const diasValidadeConfig = configuracoes.diasValidadeOrcamento || 30;

    // Definir datas
    const dataEmissao = new Date();
    const diasValidade = data.diasValidade || diasValidadeConfig;
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + diasValidade);

    // Validar itens completos
    if (!data.itensCompleto || data.itensCompleto.length === 0) {
      throw new ValidationError("O orçamento deve ter pelo menos um item");
    }

    // Validar serviço
    if (!data.servicoId) {
      throw new ValidationError("O orçamento deve ter um serviço selecionado");
    }

    // Validar cada item completo
    for (const item of data.itensCompleto) {
      if (!item.categoriaId) {
        throw new ValidationError("Cada item deve ter uma categoria");
      }
      if (!item.descricao || item.descricao.trim().length < 3) {
        throw new ValidationError(
          "Descrição do item deve ter pelo menos 3 caracteres"
        );
      }
      if (item.quantidade <= 0) {
        throw new ValidationError("Quantidade deve ser maior que zero");
      }
    }

    // Calcular valores dos itens completos
    const itensCalculados = calcularItens(data.itensCompleto);
    const { valorTotalMaoDeObra, valorTotalMaterial, valorTotal } =
      calcularTotais(itensCalculados);

    // Base do orçamento
    const orcamento: Omit<Orcamento, "id" | "createdAt"> = {
      numero,
      versao: 0,
      tipo: "completo",
      clienteId: data.clienteId,
      clienteNome: cliente.razaoSocial,
      clienteCnpj: cliente.cnpj || "",
      clienteTipoPessoa: detectarTipoPessoa(cliente.cnpj || ""),
      status: "aberto",
      dataEmissao,
      dataValidade,
      servicoId: data.servicoId,
      itensCompleto: itensCalculados,
      valorTotalMaoDeObra,
      valorTotalMaterial,
      valorTotal,
    };

    // Adicionar dados do cliente (Firestore não aceita undefined)
    if (cliente.endereco) orcamento.clienteEndereco = cliente.endereco;
    if (cliente.cidade) orcamento.clienteCidade = cliente.cidade;
    if (cliente.estado) orcamento.clienteEstado = cliente.estado;
    if (cliente.cep) orcamento.clienteCep = cliente.cep;
    if (cliente.telefone) orcamento.clienteTelefone = cliente.telefone;
    if (cliente.email) orcamento.clienteEmail = cliente.email;

    // Adicionar consultor, contato, email, telefone e enderecoServico se existirem
    if (data.consultor?.trim()) orcamento.consultor = data.consultor.trim();
    if (data.contato?.trim()) orcamento.contato = data.contato.trim();
    if (data.email?.trim()) orcamento.email = data.email.trim();
    if (data.telefone?.trim()) orcamento.telefone = data.telefone.trim();
    if (data.enderecoServico?.trim()) orcamento.enderecoServico = data.enderecoServico.trim();

    // Adicionar observações apenas se existir
    if (data.observacoes?.trim()) {
      orcamento.observacoes = data.observacoes.trim();
    }

    // Campos opcionais do orçamento
    if (data.servicoDescricao)
      orcamento.servicoDescricao = data.servicoDescricao;
    if (data.limitacoesSelecionadas && data.limitacoesSelecionadas.length > 0) {
      orcamento.limitacoesSelecionadas = data.limitacoesSelecionadas;
    }
    if (data.prazoExecucaoServicos)
      orcamento.prazoExecucaoServicos = data.prazoExecucaoServicos;
    if (data.prazoVistoriaBombeiros)
      orcamento.prazoVistoriaBombeiros = data.prazoVistoriaBombeiros;
    if (data.condicaoPagamento)
      orcamento.condicaoPagamento = data.condicaoPagamento;
    if (data.parcelamentoTexto?.trim())
      orcamento.parcelamentoTexto = data.parcelamentoTexto.trim();
    if (data.parcelamentoDados)
      orcamento.parcelamentoDados = data.parcelamentoDados;
    if (data.descontoAVista) orcamento.descontoAVista = data.descontoAVista;
    if (data.mostrarValoresDetalhados !== undefined)
      orcamento.mostrarValoresDetalhados = data.mostrarValoresDetalhados;
    if (data.introducao?.trim())
      orcamento.introducao = data.introducao.trim();

    return orcamentoRepo.create(orcamento);
  };

  const atualizar = async (id: string, data: AtualizarOrcamentoDTO): Promise<Orcamento> => {
    const orcamento = await orcamentoRepo.findById(id);

    // Só permite atualizar se estiver aberto
    if (orcamento.status !== "aberto") {
      throw new ValidationError(
        'Só é possível atualizar orçamentos com status "aberto"'
      );
    }

    const updateData: Partial<Orcamento> = {};

    // Atualização dos itens - compara com valores existentes
    if (data.itensCompleto) {
      if (data.itensCompleto.length === 0) {
        throw new ValidationError("O orçamento deve ter pelo menos um item");
      }

      // Validar cada item completo
      for (const item of data.itensCompleto) {
        if (!item.categoriaId) {
          throw new ValidationError("Cada item deve ter uma categoria");
        }
        if (!item.descricao || item.descricao.trim().length < 3) {
          throw new ValidationError(
            "Descrição do item deve ter pelo menos 3 caracteres"
          );
        }
        if (item.quantidade <= 0) {
          throw new ValidationError("Quantidade deve ser maior que zero");
        }
      }

      // Calcular valores dos itens completos
      const itensCalculados = calcularItens(data.itensCompleto);

      // Só atualiza itens se realmente mudaram
      if (!isEqual(itensCalculados, orcamento.itensCompleto)) {
        const totais = calcularTotais(itensCalculados);

        updateData.itensCompleto = itensCalculados;
        updateData.valorTotalMaoDeObra = totais.valorTotalMaoDeObra;
        updateData.valorTotalMaterial = totais.valorTotalMaterial;
        updateData.valorTotal = totais.valorTotal;
      }
    }

    // Campos opcionais do orçamento - só atualiza se mudou
    if (
      data.servicoId !== undefined &&
      data.servicoId !== orcamento.servicoId
    ) {
      updateData.servicoId = data.servicoId;
    }
    if (
      data.servicoDescricao !== undefined &&
      data.servicoDescricao !== orcamento.servicoDescricao
    ) {
      updateData.servicoDescricao = data.servicoDescricao;
    }
    if (
      data.limitacoesSelecionadas !== undefined &&
      !isEqual(data.limitacoesSelecionadas, orcamento.limitacoesSelecionadas)
    ) {
      updateData.limitacoesSelecionadas = data.limitacoesSelecionadas;
    }
    // prazoExecucaoServicos - pode ser null para remover
    if (data.prazoExecucaoServicos !== undefined) {
      if (data.prazoExecucaoServicos !== orcamento.prazoExecucaoServicos) {

        updateData.prazoExecucaoServicos = data.prazoExecucaoServicos
          ? data.prazoExecucaoServicos
          : (FieldValue.delete() as any);
      }
    }
    // prazoVistoriaBombeiros - pode ser null para remover
    if (data.prazoVistoriaBombeiros !== undefined) {
      if (data.prazoVistoriaBombeiros !== orcamento.prazoVistoriaBombeiros) {
        updateData.prazoVistoriaBombeiros = data.prazoVistoriaBombeiros
          ? data.prazoVistoriaBombeiros
          : (FieldValue.delete() as any);
      }
    }

    // Condição de pagamento - só atualiza se mudou
    if (
      data.condicaoPagamento !== undefined &&
      data.condicaoPagamento !== orcamento.condicaoPagamento
    ) {
      updateData.condicaoPagamento = data.condicaoPagamento;
      // Limpar dados de parcelamento se a condição não for "parcelado"
      if (data.condicaoPagamento !== "parcelado") {
        updateData.parcelamentoTexto = "";
        updateData.parcelamentoDados = null;
      }
      // Limpar dados de desconto se a condição não for "a_vista"
      if (data.condicaoPagamento !== "a_vista") {
        updateData.descontoAVista = null;
      }
    }

    // Parcelamento - só atualiza se mudou
    const novoParcelamentoTexto = data.parcelamentoTexto?.trim() || "";
    if (
      data.parcelamentoTexto !== undefined &&
      novoParcelamentoTexto !== (orcamento.parcelamentoTexto || "")
    ) {
      updateData.parcelamentoTexto = novoParcelamentoTexto;
    }
    if (
      data.parcelamentoDados !== undefined &&
      !isEqual(data.parcelamentoDados, orcamento.parcelamentoDados)
    ) {
      updateData.parcelamentoDados = data.parcelamentoDados || null;
    }

    // Desconto à vista - só atualiza se mudou
    if ("descontoAVista" in data) {
      const novoDesconto =
        data.descontoAVista &&
        typeof data.descontoAVista === "object" &&
        data.descontoAVista.percentual > 0
          ? data.descontoAVista
          : null;
      if (!isEqual(novoDesconto, orcamento.descontoAVista)) {
        updateData.descontoAVista = novoDesconto;
      }
    }

    // Mostrar valores detalhados - só atualiza se mudou
    if (
      data.mostrarValoresDetalhados !== undefined &&
      data.mostrarValoresDetalhados !== orcamento.mostrarValoresDetalhados
    ) {
      updateData.mostrarValoresDetalhados = data.mostrarValoresDetalhados;
    }

    // Introdução - só atualiza se mudou
    if (data.introducao !== undefined) {
      const novaIntro = data.introducao?.trim() || "";
      if (novaIntro !== (orcamento.introducao || "")) {

        updateData.introducao = novaIntro ? novaIntro : (FieldValue.delete() as any);
      }
    }

    // Observações - só atualiza se mudou
    if (data.observacoes !== undefined) {
      const novaObs = data.observacoes?.trim() || "";
      if (novaObs !== (orcamento.observacoes || "")) {

        updateData.observacoes = novaObs ? novaObs : (FieldValue.delete() as any);
      }
    }

    if (
      data.dataValidade &&
      !isEqual(data.dataValidade, orcamento.dataValidade)
    ) {
      updateData.dataValidade = data.dataValidade;
    }

    // Campos consultor, contato, email e telefone - só atualiza se mudou
    if (data.consultor !== undefined) {
      const novoValor = data.consultor?.trim() || '';
      const valorAtual = orcamento.consultor || '';
      if (novoValor !== valorAtual) {

        updateData.consultor = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.contato !== undefined) {
      const novoValor = data.contato?.trim() || '';
      const valorAtual = orcamento.contato || '';
      if (novoValor !== valorAtual) {

        updateData.contato = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.email !== undefined) {
      const novoValor = data.email?.trim() || '';
      const valorAtual = orcamento.email || '';
      if (novoValor !== valorAtual) {

        updateData.email = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.telefone !== undefined) {
      const novoValor = data.telefone?.trim() || '';
      const valorAtual = orcamento.telefone || '';
      if (novoValor !== valorAtual) {

        updateData.telefone = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.enderecoServico !== undefined) {
      const novoValor = data.enderecoServico?.trim() || '';
      const valorAtual = orcamento.enderecoServico || '';
      if (novoValor !== valorAtual) {

        updateData.enderecoServico = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    // Só incrementa a versão se houve alterações reais nos dados
    // Verifica se há alguma propriedade em updateData (além de versao que ainda não foi adicionada)
    const hasChanges = Object.keys(updateData).length > 0;

    if (hasChanges) {
      updateData.versao = (orcamento.versao || 0) + 1;
      return orcamentoRepo.update(id, updateData);
    }

    // Se não houve mudanças, retorna o orçamento sem atualizar
    return orcamento;
  };

  const atualizarStatus = async (
    id: string,
    status: OrcamentoStatus
  ): Promise<Orcamento> => {
    const orcamento = await orcamentoRepo.findById(id);

    // Validar transições de status
    if (!validarTransicaoStatus(orcamento.status, status)) {
      throw new ValidationError(
        `Não é possível mudar o status de "${orcamento.status}" para "${status}"`
      );
    }

    const dataAceite = status === "aceito" ? new Date() : undefined;
    const statusAnterior = orcamento.status;

    const orcamentoAtualizado = await orcamentoRepo.updateStatus(
      id,
      status,
      dataAceite
    );

    // Emite evento de mudança de status - notificacaoService escuta e reage
    // Isso elimina a dependência circular entre os serviços
    eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      tenantId,
      orcamentoId: id,
      statusAnterior,
      statusNovo: status,
    });

    return orcamentoAtualizado;
  };

  const excluir = async (id: string): Promise<void> => {
    const orcamento = await orcamentoRepo.findById(id);

    // Só permite excluir se não estiver aceito
    if (orcamento.status === "aceito") {
      throw new ValidationError("Não é possível excluir um orçamento aceito");
    }

    return orcamentoRepo.delete(id);
  };

  const duplicar = async (id: string): Promise<Orcamento> => {
    const orcamentoOriginal = await orcamentoRepo.findById(id);

    // Verificar se o cliente ainda existe
    let cliente;
    try {
      cliente = await clienteRepo.findById(orcamentoOriginal.clienteId);
    } catch {
      throw new ValidationError(
        "Cliente do orçamento original não existe mais"
      );
    }

    // Obter próximo número
    const numero = await orcamentoRepo.getNextNumero();

    // Buscar configuração de dias de validade
    const configuracoes = await configRepo.get();
    const diasValidade = configuracoes.diasValidadeOrcamento || 30;

    // Definir novas datas
    const dataEmissao = new Date();
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + diasValidade);

    const novoOrcamento: Omit<Orcamento, "id" | "createdAt"> = {
      numero,
      versao: 0,
      tipo: "completo",
      clienteId: orcamentoOriginal.clienteId,
      clienteNome: cliente.razaoSocial,
      clienteCnpj: cliente.cnpj || "",
      clienteTipoPessoa: detectarTipoPessoa(cliente.cnpj || ""),
      status: "aberto",
      dataEmissao,
      dataValidade,
      valorTotal: orcamentoOriginal.valorTotal,
    };

    // Adicionar dados do cliente (Firestore não aceita undefined)
    if (cliente.endereco) novoOrcamento.clienteEndereco = cliente.endereco;
    if (cliente.cidade) novoOrcamento.clienteCidade = cliente.cidade;
    if (cliente.estado) novoOrcamento.clienteEstado = cliente.estado;
    if (cliente.cep) novoOrcamento.clienteCep = cliente.cep;
    if (cliente.telefone) novoOrcamento.clienteTelefone = cliente.telefone;
    if (cliente.email) novoOrcamento.clienteEmail = cliente.email;

    // Manter consultor, contato, email, telefone, enderecoServico e observações do original
    if (orcamentoOriginal.consultor)
      novoOrcamento.consultor = orcamentoOriginal.consultor;
    if (orcamentoOriginal.contato)
      novoOrcamento.contato = orcamentoOriginal.contato;
    if (orcamentoOriginal.email) novoOrcamento.email = orcamentoOriginal.email;
    if (orcamentoOriginal.telefone)
      novoOrcamento.telefone = orcamentoOriginal.telefone;
    if (orcamentoOriginal.enderecoServico)
      novoOrcamento.enderecoServico = orcamentoOriginal.enderecoServico;
    if (orcamentoOriginal.observacoes)
      novoOrcamento.observacoes = orcamentoOriginal.observacoes;

    // Campos do orçamento
    if (orcamentoOriginal.servicoId)
      novoOrcamento.servicoId = orcamentoOriginal.servicoId;
    if (orcamentoOriginal.servicoDescricao)
      novoOrcamento.servicoDescricao = orcamentoOriginal.servicoDescricao;
    if (orcamentoOriginal.itensCompleto)
      novoOrcamento.itensCompleto = orcamentoOriginal.itensCompleto;
    if (orcamentoOriginal.limitacoesSelecionadas)
      novoOrcamento.limitacoesSelecionadas =
        orcamentoOriginal.limitacoesSelecionadas;
    if (orcamentoOriginal.prazoExecucaoServicos)
      novoOrcamento.prazoExecucaoServicos =
        orcamentoOriginal.prazoExecucaoServicos;
    if (orcamentoOriginal.prazoVistoriaBombeiros)
      novoOrcamento.prazoVistoriaBombeiros =
        orcamentoOriginal.prazoVistoriaBombeiros;
    if (orcamentoOriginal.condicaoPagamento)
      novoOrcamento.condicaoPagamento = orcamentoOriginal.condicaoPagamento;
    if (orcamentoOriginal.parcelamentoTexto)
      novoOrcamento.parcelamentoTexto = orcamentoOriginal.parcelamentoTexto;
    if (orcamentoOriginal.parcelamentoDados)
      novoOrcamento.parcelamentoDados = orcamentoOriginal.parcelamentoDados;
    if (orcamentoOriginal.descontoAVista)
      novoOrcamento.descontoAVista = orcamentoOriginal.descontoAVista;
    if (orcamentoOriginal.mostrarValoresDetalhados !== undefined)
      novoOrcamento.mostrarValoresDetalhados =
        orcamentoOriginal.mostrarValoresDetalhados;
    if (orcamentoOriginal.introducao)
      novoOrcamento.introducao = orcamentoOriginal.introducao;
    if (orcamentoOriginal.valorTotalMaoDeObra)
      novoOrcamento.valorTotalMaoDeObra = orcamentoOriginal.valorTotalMaoDeObra;
    if (orcamentoOriginal.valorTotalMaterial)
      novoOrcamento.valorTotalMaterial = orcamentoOriginal.valorTotalMaterial;

    return orcamentoRepo.create(novoOrcamento);
  };

  const getEstatisticas = async () => {
    return orcamentoRepo.getEstatisticas();
  };

  const verificarExpirados = async (): Promise<number> => {
    const orcamentosAbertos = await orcamentoRepo.findByStatus("aberto");
    const hoje = new Date();
    let expirados = 0;

    for (const orcamento of orcamentosAbertos) {
      if (orcamento.dataValidade < hoje) {
        await orcamentoRepo.updateStatus(orcamento.id!, "expirado");
        expirados++;
      }
    }

    return expirados;
  };

  const getDashboardStats = async (): Promise<DashboardStats> => {
    // Buscar todos os orçamentos e clientes em paralelo
    const [orcamentos, clientes] = await Promise.all([
      orcamentoRepo.findAll(),
      clienteRepo.findAll(),
    ]);

    return calcularDashboardStats(orcamentos, clientes.length);
  };

  return {
    listar,
    listarPaginado,
    buscarPorId,
    buscarPorCliente,
    getHistoricoCliente,
    buscarPorStatus,
    buscarPorPeriodo,
    criar,
    atualizar,
    atualizarStatus,
    excluir,
    duplicar,
    getEstatisticas,
    verificarExpirados,
    getDashboardStats,
  };
}
