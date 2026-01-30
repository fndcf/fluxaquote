// Coleções do Firestore (scoped por tenant)
export const COLLECTIONS = {
  USUARIOS: "usuarios",
  CLIENTES: "clientes",
  ORCAMENTOS: "orcamentos",
  NOTIFICACOES: "notificacoes",
  CONFIGURACOES: "configuracoes",
  PALAVRAS_CHAVE: "palavrasChave",
  CONTADORES: "contadores",
  SERVICOS: "servicos",
  CATEGORIAS_ITEM: "categoriasItem",
  ITENS_SERVICO: "itensServico",
  LIMITACOES: "limitacoes",
  HISTORICO_VALORES: "historicoValoresItens",
  HISTORICO_CONFIGURACOES: "historicoConfiguracoes",
};

// Coleções globais (não scoped por tenant)
export const GLOBAL_COLLECTIONS = {
  TENANTS: "tenants",
  SLUGS: "slugs",
  USER_TENANTS: "userTenants",
};

// Documentos de contadores
export const CONTADORES = {
  ORCAMENTOS: "orcamentos",
};
