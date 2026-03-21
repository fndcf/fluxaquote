export interface DashboardMesStats {
  mes: string;
  ano: number;
  mesIndex: number;
  total: number;
  aceitos: number;
  valor: number;
}

export interface DashboardStats {
  total: number;
  abertos: number;
  aceitos: number;
  recusados: number;
  expirados: number;
  valorTotal: number;
  valorAceitos: number;
  totalClientes: number;
  porMes: DashboardMesStats[];
}
