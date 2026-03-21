import { Orcamento, DashboardStats, DashboardMesStats } from "../models";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/**
 * Calcula as estatisticas do dashboard a partir dos orcamentos e total de clientes.
 */
export function calcularDashboardStats(
  orcamentos: Orcamento[],
  totalClientes: number
): DashboardStats {
  // Calcular estatisticas basicas
  let abertos = 0;
  let aceitos = 0;
  let recusados = 0;
  let expirados = 0;
  let valorTotal = 0;
  let valorAceitos = 0;

  for (const orc of orcamentos) {
    valorTotal += (orc.descontoAVista?.valorFinal ?? orc.valorTotal) || 0;

    switch (orc.status) {
      case "aberto":
        abertos++;
        break;
      case "aceito":
        aceitos++;
        valorAceitos += (orc.descontoAVista?.valorFinal ?? orc.valorTotal) || 0;
        break;
      case "recusado":
        recusados++;
        break;
      case "expirado":
        expirados++;
        break;
    }
  }

  // Calcular dados dos ultimos 6 meses
  const now = new Date();
  const last6Months: { mes: string; ano: number; mesIndex: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      mes: MONTH_NAMES[date.getMonth()],
      ano: date.getFullYear(),
      mesIndex: date.getMonth(),
    });
  }

  const porMes: DashboardMesStats[] = last6Months.map(
    ({ mes, ano, mesIndex }) => {
      const monthOrcamentos = orcamentos.filter((o) => {
        const date =
          o.dataEmissao instanceof Date
            ? o.dataEmissao
            : new Date(o.dataEmissao);
        return date.getMonth() === mesIndex && date.getFullYear() === ano;
      });

      const total = monthOrcamentos.length;
      const aceitosNoMes = monthOrcamentos.filter(
        (o) => o.status === "aceito"
      ).length;
      const valor = monthOrcamentos.reduce(
        (acc, o) => acc + ((o.descontoAVista?.valorFinal ?? o.valorTotal) || 0),
        0
      );

      return {
        mes: `${mes}/${ano.toString().slice(-2)}`,
        ano,
        mesIndex,
        total,
        aceitos: aceitosNoMes,
        valor,
      };
    }
  );

  return {
    total: orcamentos.length,
    abertos,
    aceitos,
    recusados,
    expirados,
    valorTotal,
    valorAceitos,
    totalClientes,
    porMes,
  };
}
