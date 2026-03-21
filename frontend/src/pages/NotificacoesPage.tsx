import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../hooks/useTenant";
import { Button } from "../components/ui";
import {
  useNotificacoesPaginadas,
  useNotificacoesVencidasPaginadas,
  useNotificacoesProximasPaginadas,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
  useExcluirNotificacao,
  useNotificacaoResumo,
} from "../hooks/useNotificacoes";
import { Notificacao } from "../types";
import { formatOrcamentoNumeroSimples } from "../utils/constants";
import Footer from "@/components/layout/Footer";
import {
  Container,
  Header,
  Title,
  HeaderActions,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  TabsContainer,
  Tab,
  NotificacaoList,
  NotificacaoCard,
  NotificacaoHeader,
  NotificacaoInfo,
  NotificacaoCliente,
  NotificacaoOrcamento,
  NotificacaoMeta,
  NotificacaoData,
  NotificacaoDescricao,
  NotificacaoFooter,
  PalavraChaveTag,
  ActionButtons,
  SmallButton,
  EmptyState,
  EmptyIcon,
  LoadMoreContainer,
  LoadMoreButton,
  LoadingMore,
} from "./NotificacoesPage.styles";

type TabType = "todas" | "vencidas" | "proximas";

function formatarData(data: Date | string): string {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isVencida(data: Date | string): boolean {
  const d = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d < hoje;
}

function diasParaVencimento(data: Date | string): string {
  const d = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffMs = d.getTime() - hoje.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0)
    return `Vencido há ${Math.abs(diffDias)} dia${
      Math.abs(diffDias) !== 1 ? "s" : ""
    }`;
  if (diffDias === 0) return "Vence hoje";
  if (diffDias === 1) return "Vence amanhã";
  return `Vence em ${diffDias} dias`;
}

export function NotificacoesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const navigate = useNavigate();
  const { buildPath } = useTenant();
  const listRef = useRef<HTMLDivElement>(null);

  const { data: resumo } = useNotificacaoResumo();

  // Hook paginado para todas as notificações
  const {
    data: todasPaginado,
    isPending: loadingTodas,
    fetchNextPage: fetchNextTodas,
    hasNextPage: hasNextTodas,
    isFetchingNextPage: isFetchingTodas,
  } = useNotificacoesPaginadas(20);

  // Hook paginado para vencidas
  const {
    data: vencidasPaginado,
    isPending: loadingVencidas,
    fetchNextPage: fetchNextVencidas,
    hasNextPage: hasNextVencidas,
    isFetchingNextPage: isFetchingVencidas,
  } = useNotificacoesVencidasPaginadas(20);

  // Hook paginado para próximas
  const {
    data: proximasPaginado,
    isPending: loadingProximas,
    fetchNextPage: fetchNextProximas,
    hasNextPage: hasNextProximas,
    isFetchingNextPage: isFetchingProximas,
  } = useNotificacoesProximasPaginadas(30, 20);

  const marcarLida = useMarcarNotificacaoComoLida();
  const marcarTodasLidas = useMarcarTodasNotificacoesComoLidas();
  const excluir = useExcluirNotificacao();

  // Flatten das páginas
  const todas = todasPaginado?.pages.flatMap((page) => page.items) || [];
  const vencidas = vencidasPaginado?.pages.flatMap((page) => page.items) || [];
  const proximas = proximasPaginado?.pages.flatMap((page) => page.items) || [];

  const getNotificacoes = (): Notificacao[] => {
    switch (activeTab) {
      case "vencidas":
        return vencidas;
      case "proximas":
        return proximas;
      default:
        return todas;
    }
  };

  const getHasNextPage = (): boolean => {
    switch (activeTab) {
      case "vencidas":
        return hasNextVencidas || false;
      case "proximas":
        return hasNextProximas || false;
      default:
        return hasNextTodas || false;
    }
  };

  const getIsFetchingNext = (): boolean => {
    switch (activeTab) {
      case "vencidas":
        return isFetchingVencidas;
      case "proximas":
        return isFetchingProximas;
      default:
        return isFetchingTodas;
    }
  };

  const handleFetchNextPage = () => {
    switch (activeTab) {
      case "vencidas":
        fetchNextVencidas();
        break;
      case "proximas":
        fetchNextProximas();
        break;
      default:
        fetchNextTodas();
    }
  };

  // Infinite scroll - carregar mais quando chegar no final da lista
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const hasNext =
      activeTab === "vencidas" ? hasNextVencidas :
      activeTab === "proximas" ? hasNextProximas :
      hasNextTodas;

    const isFetching =
      activeTab === "vencidas" ? isFetchingVencidas :
      activeTab === "proximas" ? isFetchingProximas :
      isFetchingTodas;

    if (!hasNext || isFetching) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      if (activeTab === "vencidas") fetchNextVencidas();
      else if (activeTab === "proximas") fetchNextProximas();
      else fetchNextTodas();
    }
  }, [activeTab, hasNextTodas, hasNextVencidas, hasNextProximas, isFetchingTodas, isFetchingVencidas, isFetchingProximas, fetchNextTodas, fetchNextVencidas, fetchNextProximas]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll);
      return () => listElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const isPending = loadingTodas || loadingVencidas || loadingProximas;
  const notificacoes = getNotificacoes();
  const hasNextPage = getHasNextPage();
  const isFetchingNext = getIsFetchingNext();

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      marcarLida.mutate(notificacao.id!);
    }
    navigate(`${buildPath("/orcamentos")}?id=${notificacao.orcamentoId}`);
  };

  const handleMarcarLida = (e: React.MouseEvent, notificacao: Notificacao) => {
    e.stopPropagation();
    marcarLida.mutate(notificacao.id!);
  };

  const handleExcluir = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir esta notificacao?")) {
      excluir.mutate(id);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Notificações</Title>
        <HeaderActions>
          <Button
            $variant="ghost"
            onClick={() => marcarTodasLidas.mutate()}
            disabled={!resumo?.naoLidas || marcarTodasLidas.isPending}
          >
            Marcar todas como lidas
          </Button>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard $color="var(--text-secondary)">
          <StatValue $color="var(--text-primary)">
            {resumo?.total || 0}
          </StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>
        <StatCard $color="var(--primary)">
          <StatValue $color="var(--primary)">{resumo?.naoLidas || 0}</StatValue>
          <StatLabel>Não Lidas</StatLabel>
        </StatCard>
        <StatCard $color="var(--error)">
          <StatValue $color="var(--error)">{resumo?.vencidas || 0}</StatValue>
          <StatLabel>Vencidas</StatLabel>
        </StatCard>
        <StatCard $color="var(--warning)">
          <StatValue $color="var(--warning)">
            {resumo?.proximasVencer || 0}
          </StatValue>
          <StatLabel>Próximas a Vencer (30 dias)</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <Tab
          $active={activeTab === "todas"}
          onClick={() => setActiveTab("todas")}
        >
          Todas ({todasPaginado?.pages[0]?.total || todas.length})
        </Tab>
        <Tab
          $active={activeTab === "vencidas"}
          onClick={() => setActiveTab("vencidas")}
        >
          Vencidas ({vencidasPaginado?.pages[0]?.total || vencidas.length})
        </Tab>
        <Tab
          $active={activeTab === "proximas"}
          onClick={() => setActiveTab("proximas")}
        >
          Próximas a Vencer ({proximasPaginado?.pages[0]?.total || proximas.length})
        </Tab>
      </TabsContainer>

      {isPending ? (
        <EmptyState>Carregando...</EmptyState>
      ) : notificacoes.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔔</EmptyIcon>
          <p>Nenhuma notificação encontrada</p>
        </EmptyState>
      ) : (
        <>
          <NotificacaoList ref={listRef}>
            {notificacoes.map((notificacao) => {
              const vencida = isVencida(notificacao.dataVencimento);
              return (
                <NotificacaoCard
                  key={notificacao.id}
                  $lida={notificacao.lida}
                  $vencida={vencida}
                  onClick={() => handleNotificacaoClick(notificacao)}
                >
                  <NotificacaoHeader>
                    <NotificacaoInfo>
                      <NotificacaoCliente>
                        {notificacao.clienteNome}
                      </NotificacaoCliente>
                      <NotificacaoOrcamento>
                        Orçamento{" "}
                        {formatOrcamentoNumeroSimples(
                          notificacao.orcamentoNumero,
                          notificacao.orcamentoDataEmissao
                        )}
                      </NotificacaoOrcamento>
                    </NotificacaoInfo>
                    <NotificacaoMeta>
                      <NotificacaoData $vencida={vencida}>
                        {diasParaVencimento(notificacao.dataVencimento)}
                      </NotificacaoData>
                      <NotificacaoData>
                        {formatarData(notificacao.dataVencimento)}
                      </NotificacaoData>
                    </NotificacaoMeta>
                  </NotificacaoHeader>

                  <NotificacaoDescricao>
                    {notificacao.itemDescricao}
                  </NotificacaoDescricao>

                  <NotificacaoFooter>
                    <PalavraChaveTag>{notificacao.palavraChave}</PalavraChaveTag>
                    <ActionButtons>
                      {!notificacao.lida && (
                        <SmallButton
                          $variant="ghost"
                          onClick={(e) => handleMarcarLida(e, notificacao)}
                        >
                          Marcar como lida
                        </SmallButton>
                      )}
                      <SmallButton
                        $variant="danger"
                        onClick={(e) => handleExcluir(e, notificacao.id!)}
                      >
                        Excluir
                      </SmallButton>
                    </ActionButtons>
                  </NotificacaoFooter>
                </NotificacaoCard>
              );
            })}
          </NotificacaoList>

          {isFetchingNext && (
            <LoadingMore>Carregando mais notificações...</LoadingMore>
          )}

          {hasNextPage && !isFetchingNext && (
            <LoadMoreContainer>
              <LoadMoreButton onClick={handleFetchNextPage}>
                Carregar mais notificações
              </LoadMoreButton>
            </LoadMoreContainer>
          )}
        </>
      )}
      {/* Footer */}
      <Footer />
    </Container>
  );
}
