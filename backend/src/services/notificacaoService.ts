import { createNotificacaoRepository } from "../repositories/notificacaoRepository";
import { createOrcamentoRepository } from "../repositories/orcamentoRepository";
import { createPalavraChaveRepository } from "../repositories/palavraChaveRepository";
import { Notificacao, Orcamento, PaginatedResponse } from "../models";
import { NotFoundError } from "../utils/errors";
import {
  eventBus,
  OrcamentoEvents,
  OrcamentoStatusChangedEvent,
} from "../events";
import { logger } from "../utils/logger";

export function createNotificacaoService(tenantId: string) {
  const notificacaoRepo = createNotificacaoRepository(tenantId);
  const orcamentoRepo = createOrcamentoRepository(tenantId);
  const palavraChaveRepo = createPalavraChaveRepository(tenantId);

  // ========== MÉTODOS PAGINADOS ==========

  const listarTodasPaginado = async (pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> => {
    return notificacaoRepo.findAllPaginated(pageSize, cursor);
  };

  const listarNaoLidasPaginado = async (pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> => {
    return notificacaoRepo.findNaoLidasPaginated(pageSize, cursor);
  };

  const listarVencidasPaginado = async (pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> => {
    return notificacaoRepo.findVencidasPaginated(pageSize, cursor);
  };

  const listarAtivasPaginado = async (diasAntecedencia: number = 60, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> => {
    return notificacaoRepo.findAtivasPaginated(diasAntecedencia, pageSize, cursor);
  };

  const listarProximasPaginado = async (dias: number = 30, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> => {
    return notificacaoRepo.findProximasPaginated(dias, pageSize, cursor);
  };

  const buscarPorId = async (id: string): Promise<Notificacao> => {
    const notificacao = await notificacaoRepo.findById(id);
    if (!notificacao) {
      throw new NotFoundError("Notificação não encontrada");
    }
    return notificacao;
  };

  const marcarComoLida = async (id: string): Promise<Notificacao> => {
    const notificacao = await notificacaoRepo.marcarComoLida(id);
    if (!notificacao) {
      throw new NotFoundError("Notificação não encontrada");
    }
    return notificacao;
  };

  const marcarTodasComoLidas = async (): Promise<number> => {
    return notificacaoRepo.marcarTodasComoLidas();
  };

  const excluir = async (id: string): Promise<void> => {
    const deleted = await notificacaoRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError("Notificação não encontrada");
    }
  };

  /**
   * Gera notificações para um orçamento específico baseado nas palavras-chave
   * Só processa orçamentos com status "aceito"
   */
  const gerarNotificacoesParaOrcamento = async (
    orcamentoId: string
  ): Promise<Notificacao[]> => {
    const orcamento = await orcamentoRepo.findById(orcamentoId);

    // Só gera notificações para orçamentos aceitos
    if (orcamento.status !== "aceito") {
      return [];
    }

    return processarOrcamento(orcamento);
  };

  /**
   * Processa um orçamento e cria notificações baseadas nas palavras-chave encontradas
   */
  const processarOrcamento = async (orcamento: Orcamento): Promise<Notificacao[]> => {
    const palavrasChaveAtivas = await palavraChaveRepo.findAtivas();

    if (palavrasChaveAtivas.length === 0) {
      return [];
    }

    const notificacoesParaCriar: Omit<Notificacao, "id" | "createdAt">[] = [];
    const dataBase =
      orcamento.dataAceite || orcamento.dataEmissao || new Date();

    // Buscar itens do orçamento completo
    const itensDescricoes: string[] = [];

    if (orcamento.itensCompleto && orcamento.itensCompleto.length > 0) {
      orcamento.itensCompleto.forEach((item) => {
        if (item.descricao) {
          itensDescricoes.push(item.descricao);
        }
      });
    }

    // Para cada item, verificar se contém alguma palavra-chave
    for (const descricao of itensDescricoes) {
      const descricaoLower = descricao.toLowerCase();

      for (const palavraChave of palavrasChaveAtivas) {
        // Verifica se a descrição contém a palavra-chave
        if (descricaoLower.includes(palavraChave.palavra.toLowerCase())) {
          // Verifica se já existe notificação para este orçamento/item/palavra
          const existe = await notificacaoRepo.exists(
            orcamento.id!,
            descricao,
            palavraChave.palavra
          );

          if (!existe) {
            // Calcular data de vencimento baseado no prazo da palavra-chave
            const dataVencimento = new Date(dataBase);
            dataVencimento.setDate(
              dataVencimento.getDate() + palavraChave.prazoDias
            );

            notificacoesParaCriar.push({
              orcamentoId: orcamento.id!,
              orcamentoNumero: orcamento.numero,
              orcamentoDataEmissao: orcamento.dataEmissao,
              clienteId: orcamento.clienteId,
              clienteNome: orcamento.clienteNome,
              itemDescricao: descricao,
              palavraChave: palavraChave.palavra,
              dataVencimento,
              lida: false,
            });
          }
        }
      }
    }

    if (notificacoesParaCriar.length === 0) {
      return [];
    }

    // Criar todas as notificações em batch
    return notificacaoRepo.createMany(notificacoesParaCriar);
  };

  /**
   * Processa todos os orçamentos aceitos e gera notificações
   * Útil para rodar em batch ou na inicialização
   */
  const processarTodosOrcamentosAceitos = async (): Promise<{
    processados: number;
    notificacoesCriadas: number;
  }> => {
    const orcamentosAceitos = await orcamentoRepo.findByStatus("aceito");

    let notificacoesCriadas = 0;

    for (const orcamento of orcamentosAceitos) {
      const notificacoes = await processarOrcamento(orcamento);
      notificacoesCriadas += notificacoes.length;
    }

    return {
      processados: orcamentosAceitos.length,
      notificacoesCriadas,
    };
  };

  /**
   * Remove todas as notificações de um orçamento específico
   * Útil quando um orçamento deixa de ser "aceito"
   */
  const removerNotificacoesDoOrcamento = async (orcamentoId: string): Promise<number> => {
    return notificacaoRepo.deleteByOrcamentoId(orcamentoId);
  };

  /**
   * Conta notificações não lidas
   */
  const contarNaoLidas = async (): Promise<number> => {
    const naoLidas = await notificacaoRepo.findNaoLidas();
    return naoLidas.length;
  };

  /**
   * Retorna resumo das notificações (para dashboard/header)
   */
  const obterResumo = async (): Promise<{
    total: number;
    naoLidas: number;
    vencidas: number;
    proximasVencer: number;
    ativas: number;
  }> => {
    const [todas, naoLidas, vencidas, proximas, ativas] = await Promise.all([
      notificacaoRepo.findAll(),
      notificacaoRepo.findNaoLidas(),
      notificacaoRepo.findVencidas(),
      notificacaoRepo.findProximas(30),
      notificacaoRepo.findAtivas(10),
    ]);

    return {
      total: todas.length,
      naoLidas: naoLidas.length,
      vencidas: vencidas.length,
      proximasVencer: proximas.length,
      ativas: ativas.length,
    };
  };

  return {
    listarTodasPaginado,
    listarNaoLidasPaginado,
    listarVencidasPaginado,
    listarAtivasPaginado,
    listarProximasPaginado,
    buscarPorId,
    marcarComoLida,
    marcarTodasComoLidas,
    excluir,
    gerarNotificacoesParaOrcamento,
    processarOrcamento,
    processarTodosOrcamentosAceitos,
    removerNotificacoesDoOrcamento,
    contarNaoLidas,
    obterResumo,
  };
}

/**
 * Registra handlers de eventos para o notificacaoService
 * Isso permite que o serviço reaja a eventos do orcamentoService
 * sem criar dependência circular
 */
export function inicializarEventHandlers(): void {
  eventBus.on(
    OrcamentoEvents.STATUS_CHANGED,
    async (event: OrcamentoStatusChangedEvent) => {
      try {
        const { orcamentoId, statusAnterior, statusNovo, tenantId } = event;

        if (!tenantId) {
          logger.error('[NotificacaoService] tenantId ausente no evento');
          return;
        }

        const service = createNotificacaoService(tenantId);

        if (statusNovo === "aceito" && statusAnterior !== "aceito") {
          await service.gerarNotificacoesParaOrcamento(orcamentoId);
        } else if (statusAnterior === "aceito" && statusNovo !== "aceito") {
          await service.removerNotificacoesDoOrcamento(orcamentoId);
        }
      } catch (error) {
        logger.error(
          "[NotificacaoService] Erro ao processar evento de mudança de status:",
          { error }
        );
      }
    }
  );
}
