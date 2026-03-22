# FluxaQuote - Sistema de Orçamentos

Sistema multi-tenant de gestão de orçamentos com personalização visual por empresa (white-label). Desenvolvido com React + TypeScript no frontend e Node.js + Express + Firebase no backend.

## Funcionalidades

### Multi-Tenancy

- **Registro de empresas**: Cada empresa cria sua conta com slug único (URL própria)
- **Isolamento de dados**: Subcollections no Firestore por tenant
- **URLs slug-based**: `/:slug/dashboard`, `/:slug/clientes`, etc.
- **Custom Claims**: tenantId no token Firebase para autenticação segura
- **Landing page pública**: Home page com CTA para registro e login

### White-Label (Personalização Visual)

- **Cores personalizáveis**: Cada empresa configura suas cores primária e secundária
- **Paletas predefinidas**: 12 combinações prontas para uso
- **Pré-visualização em tempo real**: Preview de header e botões antes de salvar
- **Logo da empresa**: Upload de logo (PNG/JPG/WEBP, max 500KB) armazenado como base64
- **PDFs personalizados**: Cores e logo da empresa aplicados nos PDFs gerados
- **CSS Variables override**: Cores aplicadas via CSS custom properties no container autenticado

### Gestão de Orçamentos

- **Orçamento Completo**: Detalhamento por serviços, categorias, separação de mão de obra e materiais, limites de escopo selecionáveis e observações, formas de pagamento com parcelamentos, opções de entrada personalizada, **desconto por percentual ou valor em R$** (à vista e parcelado) e prazos de execução
- **Valor efetivo com desconto**: Listagem, dashboard, relatórios e histórico exibem o valor final com desconto aplicado
- **Versionamento**: Controle de versões dos orçamentos
- **Status**: Acompanhamento (aberto, aceito, recusado, expirado) com máquina de estados
- **Duplicação**: Criação de novos orçamentos baseados em existentes
- **Geração de PDF**: Exportação profissional com cores e logo da empresa

### Gestão de Clientes

- Cadastro completo (PJ e PF)
- Busca automática de dados por CNPJ (API Brasil)
- Histórico de orçamentos por cliente

### Configurações do Sistema

- **Layout**: Cores primária/secundária, paletas predefinidas, pré-visualização
- **Empresa**: Dados gerais (CNPJ, endereço, validade), upload de logo
- **Serviços**: Tipos de serviços oferecidos (ordenáveis)
- **Categorias de Itens**: Agrupamento de itens por categoria
- **Itens de Serviço**: Descrições pré-definidas com unidades de medida, valor do material, valor da mão de obra, custo do material e custo da mão de obra
- **Observações**: Textos padrão de limitações/ressalvas (ordenáveis)
- **Palavras-chave**: Monitoramento de prazos com notificações
- **Parcelamento**: Valor mínimo, taxa de juros, parcela máxima

### Condições de Pagamento

- **À Vista com Desconto**: Desconto por percentual ou valor absoluto em R$, com cálculo automático bidirecional e exibição no PDF
- **Parcelamento com Desconto**: Mesmo sistema de desconto (% ou R$) disponível no parcelamento — o desconto é aplicado antes do cálculo de entrada e parcelas
- **Parcelamento**: Configuração de número de parcelas com taxa de juros, valor mínimo de parcela e opção de entrada personalizada

### Notificações

- Alertas de prazos de palavras-chave
- Vinculação com orçamentos específicos
- Controle de leitura/arquivamento
- **Paginação com cursor**: Carregamento infinito para melhor performance
- **Abas organizadas**: Todas, Não Lidas, Vencidas, Ativas, Próximas a Vencer
- **Dropdown de acesso rápido**: Visualização das últimas notificações não lidas

### Relatórios e Dashboard

- Estatísticas de orçamentos (com valores efetivos considerando descontos)
- Gráficos de desempenho
- Filtros por período
- Estudo de lucro para propostas aceitas (com card de descontos)
- Histórico de valores de itens e configurações

## Tecnologias

### Backend

| Tecnologia           | Versão | Uso                          |
| -------------------- | ------ | ---------------------------- |
| Node.js              | 20+    | Runtime                      |
| Express              | 4.18   | Framework HTTP               |
| TypeScript           | 5.3    | Tipagem estática             |
| Firebase Admin SDK   | 12.0   | Autenticação e Firestore     |
| Zod                  | 3.22   | Validação de schemas         |
| express-rate-limit   | 7.x    | Rate limiting                |
| Jest                 | 29.7   | Testes unitários             |
| Supertest            | 7.x    | Testes de integração de API  |

### Frontend

| Tecnologia              | Versão | Uso                     |
| ----------------------- | ------ | ----------------------- |
| React                   | 18.2   | UI Library              |
| TypeScript              | 5.3    | Tipagem estática        |
| Vite                    | 5.0    | Build tool              |
| React Router            | 6.21   | Roteamento              |
| Styled Components       | 6.1    | Estilização             |
| Axios                   | 1.6    | HTTP Client             |
| @tanstack/react-query   | 5.x    | Cache e estado servidor |
| Firebase                | 10.7   | Autenticação cliente    |
| React PDF Renderer      | 3.1    | Geração de PDFs         |
| Recharts                | 2.15   | Gráficos e relatórios   |
| Vitest                  | 1.6    | Testes unitários        |

### Infraestrutura

- Firebase Firestore (Database)
- Firebase Authentication
- Firebase Hosting (com rewrites para Cloud Run)
- Firebase Cloud Functions (Gen 2)
- Cloud Run (backend API)
- Firebase Emulator Suite (testes de integração)

## Estrutura do Projeto

```
fluxaquote/
├── backend/
│   └── src/
│       ├── __tests__/
│       │   ├── controllers/        # Testes unitários de controllers
│       │   ├── services/           # Testes unitários de services
│       │   ├── middlewares/        # Testes de middlewares
│       │   ├── events/             # Testes do EventBus
│       │   ├── utils/              # Testes de utilitários
│       │   ├── validations/        # Testes de validações
│       │   ├── integration/        # Testes de integração (Supertest + Emulator)
│       │   │   ├── api/            # Testes de endpoints (auth, clientes, orcamentos)
│       │   │   ├── rules/          # Testes de isolamento multi-tenant
│       │   │   └── setup.ts        # Helpers (criarUsuarioTeste, gerarTokenTeste, etc.)
│       │   ├── mocks/              # Dados mock para testes unitários
│       │   └── setup.ts            # Setup global de testes unitários
│       ├── config/                 # Configuração do Firebase (dev/test/prod)
│       ├── controllers/            # Controladores HTTP
│       ├── events/                 # Sistema de eventos (EventBus)
│       ├── middlewares/            # auth, validate, rateLimiter, requestLogger, errorHandler
│       ├── models/                 # Interfaces TypeScript + DTOs (1 arquivo por domínio)
│       ├── repositories/           # Acesso a dados (Firestore, factory por tenant)
│       ├── routes/                 # Definição de rotas (com validação Zod)
│       ├── services/               # Lógica de negócio (factory por tenant)
│       │   ├── orcamentoCalculator.ts      # Cálculos de valores
│       │   ├── orcamentoStatusMachine.ts   # Máquina de estados
│       │   └── orcamentoDashboardService.ts # Estatísticas
│       ├── utils/                  # logger, errors, constants, tenantDb, requestContext
│       └── validations/            # Schemas Zod (1 arquivo por domínio)
│
├── frontend/
│   └── src/
│       ├── __tests__/              # Testes unitários (Vitest + Testing Library)
│       ├── components/
│       │   ├── auth/               # PrivateRoute
│       │   ├── clientes/           # ClienteModal, HistoricoOrcamentosModal
│       │   ├── layout/             # AdminLayout (slug-aware, white-label)
│       │   ├── notificacoes/       # NotificacaoDropdown
│       │   ├── orcamentos/         # OrcamentoModal/, OrcamentoPDF, ViewModal
│       │   └── ui/                 # Button, Card, Input, Modal, Table, Pagination, Loading
│       ├── contexts/               # AuthContext, TenantContext
│       ├── hooks/                  # Hooks customizados (1 por domínio, React Query v5)
│       ├── pages/                  # Páginas (cada uma com .styles.ts separado)
│       │   ├── Home/               # Landing page (dividida em seções)
│       │   ├── Configuracoes/      # Tabs: Empresa, Layout, Serviços, etc.
│       │   └── *.tsx + *.styles.ts # Dashboard, Orcamentos, Clientes, etc.
│       ├── services/               # Comunicação com API (Axios)
│       ├── styles/                 # GlobalStyles, theme
│       ├── types/                  # Interfaces TypeScript
│       └── utils/                  # constants (getValorEfetivo), colorUtils, logger
│
├── docs/
│   ├── ARCHITECTURE.md             # Guia de padrões e templates para novas entidades
│   └── FluxaQuote.postman_collection.json  # Collection Postman (80+ requests)
│
├── firebase.json                   # Hosting, Functions, Firestore, Emulators
├── firestore.rules                 # Regras de segurança (12 collections explícitas)
├── firestore.indexes.json          # 14 índices compostos
└── .firebaserc                     # Projeto Firebase
```

## Instalação

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Firebase com projeto configurado
- Firebase CLI (`npm install -g firebase-tools`)
- Java Runtime (para Firebase Emulators)

### Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env.local` com as variáveis:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=seu_projeto
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu_projeto.iam.gserviceaccount.com
```

### Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` com as variáveis:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Executando o Projeto

### Desenvolvimento

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:5000`.

### Firebase Emulators (para testes)

```bash
# Iniciar emulators (Firestore, Auth, UI)
cd backend && npm run emulators

# UI do Emulator disponível em http://localhost:4040
```

### Deploy no Firebase

```bash
# Build de ambos os projetos
cd backend && npm run build
cd ../frontend && npm run build

# Deploy completo
firebase deploy

# Deploy parcial
firebase deploy --only hosting          # Frontend
firebase deploy --only functions        # Backend
firebase deploy --only firestore:rules  # Regras de segurança
firebase deploy --only firestore:indexes # Índices
```

## Testes

### Backend — Unitários (Jest)

```bash
cd backend
npm test                    # Executar testes
npm run test:watch          # Modo watch
npm run test:coverage       # Com cobertura
```

### Backend — Integração (Supertest + Firebase Emulator)

```bash
cd backend
npm run test:integration    # Inicia emulators, roda testes, encerra
```

Testa endpoints HTTP reais contra Express + Firestore emulado. Inclui:
- Testes de API (auth, clientes, orçamentos)
- Testes de isolamento multi-tenant
- Validação de autenticação e rate limiting

### Frontend (Vitest)

```bash
cd frontend
npm test                    # Executar testes
npm run test:ui             # Interface visual
npm run test:coverage       # Com cobertura
```

## Cobertura de Testes

### Backend

| Tipo        | Suites | Testes |
| ----------- | ------ | ------ |
| Unitários   | 31     | 600    |
| Integração  | 4      | 24     |
| **Total**   | **35** | **624**|

- **Controllers**: 100% de cobertura
- **Services**: 96%+ de cobertura
- **Middlewares**: 100% de cobertura (auth, validate, rateLimiter, requestLogger, errorHandler)
- **Validations**: Zod schemas para todos os endpoints
- **Events**: 100% de cobertura (EventBus)
- **Integração**: Auth, CRUD clientes/orçamentos, isolamento multi-tenant

### Frontend (1187 testes, 66 suites)

| Métrica    | Cobertura |
| ---------- | --------- |
| Statements | 94.13%    |
| Branches   | 88.08%    |
| Functions  | 84.91%    |
| Lines      | 94.13%    |

## API Endpoints

Base URL: `/api/v1` (versionada, com retrocompatibilidade em `/api`)

### Autenticação (público, rate limited: 10 req/min)

| Método | Endpoint                         | Descrição                   |
| ------ | -------------------------------- | --------------------------- |
| POST   | `/api/v1/auth/register`          | Registrar empresa + usuário |
| GET    | `/api/v1/auth/check-slug/:slug`  | Verificar disponibilidade   |
| GET    | `/api/v1/auth/me`                | Dados do tenant do usuário  |

### Endpoints Principais (autenticado, tenant-scoped, rate limited: 300 req/min)

| Método   | Endpoint                         | Descrição                |
| -------- | -------------------------------- | ------------------------ |
| GET      | `/api/v1/health`                 | Health check             |
| GET/POST | `/api/v1/clientes`               | Gestão de clientes       |
| GET/POST | `/api/v1/orcamentos`             | Gestão de orçamentos     |
| GET/POST | `/api/v1/servicos`               | Configuração de serviços |
| GET/POST | `/api/v1/categorias-item`        | Categorias de itens      |
| GET/POST | `/api/v1/itens-servico`          | Itens de serviço         |
| GET/POST | `/api/v1/limitacoes`             | Observações padrão       |
| GET/POST | `/api/v1/palavras-chave`         | Palavras-chave           |
| GET/PUT  | `/api/v1/configuracoes-gerais`   | Configurações gerais     |
| GET      | `/api/v1/historico-valores`      | Histórico de valores     |

### Endpoints de Notificações (com Paginação)

| Método | Endpoint                                    | Descrição                    |
| ------ | ------------------------------------------- | ---------------------------- |
| GET    | `/api/v1/notificacoes/resumo`               | Resumo (totais por status)   |
| GET    | `/api/v1/notificacoes/nao-lidas/count`      | Contagem de não lidas        |
| GET    | `/api/v1/notificacoes/paginado`             | Todas (paginado)             |
| GET    | `/api/v1/notificacoes/nao-lidas/paginado`   | Não lidas (paginado)         |
| GET    | `/api/v1/notificacoes/vencidas/paginado`    | Vencidas (paginado)          |
| GET    | `/api/v1/notificacoes/ativas/paginado`      | Ativas (paginado)            |
| GET    | `/api/v1/notificacoes/proximas/paginado`    | Próximas a vencer (paginado) |
| PATCH  | `/api/v1/notificacoes/:id/lida`             | Marcar como lida             |
| PATCH  | `/api/v1/notificacoes/marcar-todas-lidas`   | Marcar todas como lidas      |
| DELETE | `/api/v1/notificacoes/:id`                  | Excluir notificação          |

**Collection Postman completa disponível em `docs/FluxaQuote.postman_collection.json`**

## Arquitetura

### Backend

- **API Versionada**: `/api/v1/` com retrocompatibilidade em `/api/`
- **Multi-Tenant Factory Pattern**: Repositories e Services criados por tenant via factory functions
- **Subcollections**: Dados isolados em `tenants/{tenantId}/collection/{docId}`
- **Repository Pattern**: Abstração do acesso a dados (scoped por tenant)
- **Service Layer**: Separação da lógica de negócio (com modules: calculator, statusMachine, dashboardService)
- **Controller Layer**: Tratamento de requisições HTTP com extração de tenantId
- **Middlewares**: auth, validate (Zod), rateLimiter, requestLogger, errorHandler
- **Validação Zod**: Schemas em todos os endpoints POST/PUT/PATCH
- **Rate Limiting**: 10 req/min para rotas públicas, 300 req/min para autenticadas
- **Request Logging**: method, path, status, duration, tenantId
- **CORS configurável**: `ALLOWED_ORIGINS` env var (múltiplos domínios)
- **Event Bus**: Comunicação desacoplada entre serviços
- **Error Handling**: Hierarquia de erros customizados (AppError → ValidationError, NotFoundError, etc.)
- **Custom Claims**: tenantId/slug/role no token Firebase Auth
- **Models por domínio**: 14 arquivos com DTOs (CreateDTO, UpdateDTO)

### Frontend

- **@tanstack/react-query v5**: Cache, staleTime por tipo de dado, invalidação automática
- **Context API**: Estado global (AuthContext + TenantContext)
- **Slug-aware Routing**: Todas as rotas internas prefixadas com `/:slug`
- **CSS Variables Override**: Cores do tenant aplicadas via style no container
- **Custom Hooks**: 11 hooks por domínio com staleTime consistente
- **Styled Components**: Estilos extraídos em `.styles.ts` por página
- **React.memo**: Otimização em componentes de lista (Pagination, Loading)
- **Home modular**: Landing page dividida em 6 seções
- **Discriminated Unions**: Tipos seguros para orçamentos
- **getValorEfetivo()**: Exibe valor com desconto em todo o sistema

### Firestore

```
tenants/{tenantId}/clientes/{clienteId}
tenants/{tenantId}/orcamentos/{orcamentoId}
tenants/{tenantId}/servicos/{servicoId}
tenants/{tenantId}/categoriasItem/{categoriaId}
tenants/{tenantId}/itensServico/{itemId}
tenants/{tenantId}/limitacoes/{limitacaoId}
tenants/{tenantId}/palavrasChave/{palavraId}
tenants/{tenantId}/notificacoes/{notificacaoId}
tenants/{tenantId}/configuracoes/{docId}
tenants/{tenantId}/contadores/{contadorId}
tenants/{tenantId}/historicoValoresItens/{historicoId}
tenants/{tenantId}/historicoConfiguracoes/{historicoId}

# Collections globais
tenants/{tenantId}          # Dados do tenant
slugs/{slug}                # Lookup reverso slug → tenantId
userTenants/{uid}           # Mapeamento userId → tenantId
```

### Segurança (Firestore Rules)

- 12 collections explicitamente definidas (sem wildcards)
- Isolamento por `isTenantOwner(tenantId)` via custom claims
- Slugs: leitura pública, escrita bloqueada
- UserTenants: leitura apenas do próprio UID
- Regra padrão: deny all

## Scripts Disponíveis

### Backend

| Script                     | Descrição                                        |
| -------------------------- | ------------------------------------------------ |
| `npm run dev`              | Servidor de desenvolvimento (porta 5000)         |
| `npm run build`            | Compilar TypeScript                              |
| `npm start`                | Executar versão compilada                        |
| `npm test`                 | Executar testes unitários                        |
| `npm run test:watch`       | Testes em modo watch                             |
| `npm run test:coverage`    | Testes com cobertura                             |
| `npm run test:integration` | Testes de integração (com Firebase Emulator)     |
| `npm run emulators`        | Iniciar Firebase Emulators                       |

### Frontend

| Script                  | Descrição                  |
| ----------------------- | -------------------------- |
| `npm run dev`           | Servidor Vite (porta 5173) |
| `npm run build`         | Build de produção          |
| `npm run preview`       | Preview do build           |
| `npm run lint`          | Verificação ESLint         |
| `npm test`              | Executar testes            |
| `npm run test:ui`       | Interface visual de testes |
| `npm run test:coverage` | Testes com cobertura       |

## Documentação Adicional

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Guia de padrões e templates para adicionar novas entidades (passo a passo com exemplos de código)
- **[docs/FluxaQuote.postman_collection.json](docs/FluxaQuote.postman_collection.json)** — Collection Postman com 80+ requests organizadas

## Troubleshooting

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Erro de CORS

Verificar se `FRONTEND_URL` ou `ALLOWED_ORIGINS` no backend corresponde à URL do frontend.

### Firebase não conecta

1. Verificar se as variáveis de ambiente estão corretas
2. Verificar se o projeto Firebase existe
3. Verificar se o Firestore está habilitado

### Emulators não iniciam

```bash
# Verificar se Java está instalado
java -version

# Matar processos presos
taskkill /F /IM java.exe    # Windows
pkill -f java               # Linux/Mac
```

## Licença

Projeto privado - FluxaQuote.
