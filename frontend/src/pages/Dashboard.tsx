import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useOrcamentos, useDashboardStats } from "../hooks/useOrcamentos";
import { Loading } from "../components/ui";
import { formatCurrency, formatOrcamentoNumero, getValorEfetivo } from "../utils/constants";
import { Orcamento, OrcamentoStatus } from "../types";
import { OrcamentoViewModal } from "../components/orcamentos/OrcamentoViewModal";
import Footer from "@/components/layout/Footer";
import {
  Container,
  Title,
  StatsGrid,
  StatCard,
  ChartsGrid,
  ChartCard,
  FullWidthChartCard,
  RecentList,
  RecentItem,
  StatusBadge,
} from "./Dashboard.styles";

const COLORS = {
  aberto: "#2196f3",
  aceito: "#4caf50",
  recusado: "#f44336",
  expirado: "#9e9e9e",
};

const STATUS_LABELS: Record<OrcamentoStatus, string> = {
  aberto: "Abertos",
  aceito: "Aceitos",
  recusado: "Recusados",
  expirado: "Expirados",
};

export function Dashboard() {
  // Usa o endpoint otimizado que retorna dados agregados do backend
  const { data: dashboardStats, isPending: loadingStats } = useDashboardStats();
  // Ainda precisa dos orçamentos para a lista de recentes e o modal
  const { data: orcamentos, isPending: loadingOrcamentos } = useOrcamentos();
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(
    null
  );

  // Calcula taxa de conversão a partir dos dados do backend
  const taxaConversao = useMemo(() => {
    if (!dashboardStats || dashboardStats.total === 0) return "0";
    return ((dashboardStats.aceitos / dashboardStats.total) * 100).toFixed(1);
  }, [dashboardStats]);

  // Dados para o gráfico de pizza (status) - derivado dos dados do backend
  const statusData = useMemo(() => {
    if (!dashboardStats) return [];

    const counts: Record<OrcamentoStatus, number> = {
      aberto: dashboardStats.abertos,
      aceito: dashboardStats.aceitos,
      recusado: dashboardStats.recusados,
      expirado: dashboardStats.expirados,
    };

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: STATUS_LABELS[status as OrcamentoStatus],
        value,
        color: COLORS[status as OrcamentoStatus],
      }));
  }, [dashboardStats]);

  // Dados mensais já vêm calculados do backend
  const monthlyData = useMemo(() => {
    if (!dashboardStats) return [];

    return dashboardStats.porMes.map((mes) => ({
      name: mes.mes,
      total: mes.total,
      aceitos: mes.aceitos,
      valor: mes.valor / 1000, // Em milhares para visualização
    }));
  }, [dashboardStats]);

  // Lista de orçamentos recentes (ainda usa dados locais para o modal)
  const recentOrcamentos = useMemo(() => {
    if (!orcamentos) return [];

    return [...orcamentos]
      .sort(
        (a, b) =>
          new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()
      )
      .slice(0, 5);
  }, [orcamentos]);

  if (loadingStats || loadingOrcamentos) {
    return (
      <Container>
        <Title>Painel</Title>
        <Loading />
      </Container>
    );
  }

  if (!dashboardStats) {
    return (
      <Container>
        <Title>Painel</Title>
        <ChartCard>
          <p>Nenhum dado disponível</p>
        </ChartCard>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Painel</Title>

      <StatsGrid>
        <StatCard $color="var(--primary)">
          <div className="label">Total de Orçamentos</div>
          <div className="value">{dashboardStats.total}</div>
          <div className="subvalue">{formatCurrency(dashboardStats.valorTotal)}</div>
        </StatCard>

        <StatCard $color="#4caf50">
          <div className="label">Orçamentos Aceitos</div>
          <div className="value">{dashboardStats.aceitos}</div>
          <div className="subvalue">{formatCurrency(dashboardStats.valorAceitos)}</div>
        </StatCard>

        <StatCard $color="#2196f3">
          <div className="label">Taxa de Conversão</div>
          <div className="value">{taxaConversao}%</div>
          <div className="subvalue">{dashboardStats.abertos} em aberto</div>
        </StatCard>

        <StatCard $color="#ff9800">
          <div className="label">Clientes Cadastrados</div>
          <div className="value">{dashboardStats.totalClientes}</div>
          <div className="subvalue">ativos no sistema</div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <h3>Orçamentos por Mês (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "valor")
                    return [
                      `R$ ${(value * 1000).toLocaleString("pt-BR")}`,
                      "Valor",
                    ];
                  return [value, name === "total" ? "Total" : "Aceitos"];
                }}
              />
              <Legend />
              <Bar
                dataKey="total"
                name="Total"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="aceitos"
                name="Aceitos"
                fill="#4caf50"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>Status dos Orçamentos</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                padding: "40px",
              }}
            >
              Nenhum orçamento cadastrado
            </p>
          )}
        </ChartCard>
      </ChartsGrid>

      <ChartsGrid>
        <FullWidthChartCard>
          <h3>Evolução de Valores (em milhares R$)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `R$ ${(value * 1000).toLocaleString("pt-BR")}`,
                  "Valor",
                ]}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: "var(--primary)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </FullWidthChartCard>
      </ChartsGrid>

      <ChartCard>
        <h3>Orçamentos Recentes</h3>
        {recentOrcamentos.length > 0 ? (
          <RecentList>
            {recentOrcamentos.map((orcamento) => (
              <RecentItem
                key={orcamento.id}
                $clickable
                onClick={() => setSelectedOrcamento(orcamento)}
                title="Clique para ver detalhes"
              >
                <div className="info">
                  <span className="numero">
                    {formatOrcamentoNumero(orcamento.numero, orcamento.dataEmissao, orcamento.versao)}
                    <StatusBadge $status={orcamento.status}>
                      {STATUS_LABELS[orcamento.status]}
                    </StatusBadge>
                  </span>
                  <span className="cliente">{orcamento.clienteNome}</span>
                </div>
                <span className="valor">
                  {formatCurrency(getValorEfetivo(orcamento))}
                </span>
              </RecentItem>
            ))}
          </RecentList>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              padding: "20px",
            }}
          >
            Nenhum orçamento cadastrado
          </p>
        )}
      </ChartCard>

      <OrcamentoViewModal
        isOpen={!!selectedOrcamento}
        onClose={() => setSelectedOrcamento(null)}
        orcamento={selectedOrcamento}
      />
      {/* Footer */}
      <Footer />
    </Container>
  );
}
