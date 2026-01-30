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

- **Orçamento Completo**: Detalhamento por serviços, categorias, separação de mão de obra e materiais, limites de escopo selecionáveis e observações, formas de pagamento com parcelamentos, opções de entrada personalizada, **desconto para pagamento à vista** e prazos de execução
- **Versionamento**: Controle de versões dos orçamentos
- **Status**: Acompanhamento (aberto, aceito, recusado, expirado)
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

- **Parcelamento**: Configuração de número de parcelas com taxa de juros, valor mínimo de parcela e opção de entrada personalizada
- **À Vista com Desconto**: Aplicação de desconto percentual para pagamentos à vista, com cálculo automático do valor final e exibição no PDF

### Notificações

- Alertas de prazos de palavras-chave
- Vinculação com orçamentos específicos
- Controle de leitura/arquivamento
- **Paginação com cursor**: Carregamento infinito para melhor performance
- **Abas organizadas**: Todas, Não Lidas, Vencidas, Ativas, Próximas a Vencer
- **Dropdown de acesso rápido**: Visualização das últimas notificações não lidas

### Relatórios e Dashboard

- Estatísticas de orçamentos
- Gráficos de desempenho
- Filtros por período
- Estudo de lucro para propostas aceitas
- Histórico de valores de itens e configurações

## Tecnologias

### Backend

| Tecnologia         | Versão | Uso                      |
| ------------------ | ------ | ------------------------ |
| Node.js            | 20+    | Runtime                  |
| Express            | 4.18   | Framework HTTP           |
| TypeScript         | 5.3    | Tipagem estática         |
| Firebase Admin SDK | 12.0   | Autenticação e Firestore |
| Zod                | 3.22   | Validação de schemas     |
| Jest               | 29.7   | Testes unitários         |

### Frontend

| Tecnologia         | Versão | Uso                     |
| ------------------ | ------ | ----------------------- |
| React              | 18.2   | UI Library              |
| TypeScript         | 5.3    | Tipagem estática        |
| Vite               | 5.0    | Build tool              |
| React Router       | 6.21   | Roteamento              |
| Styled Components  | 6.1    | Estilização             |
| Axios              | 1.6    | HTTP Client             |
| React Query        | 3.39   | Cache e estado servidor |
| Firebase           | 10.7   | Autenticação cliente    |
| React PDF Renderer | 3.1    | Geração de PDFs         |
| Recharts           | 2.15   | Gráficos e relatórios   |
| Vitest             | 1.6    | Testes unitários        |

### Infraestrutura

- Firebase Firestore (Database)
- Firebase Authentication
- Firebase Hosting (com rewrites para Cloud Run)
- Firebase Cloud Functions (Gen 2)
- Cloud Run (backend API)

## Estrutura do Projeto

```
fluxaquote/
├── backend/
│   └── src/
│       ├── __tests__/          # Testes unitários (Jest)
│       │   ├── controllers/    # Testes de controllers
│       │   ├── services/       # Testes de services
│       │   ├── utils/          # Testes de utilitários
│       │   ├── validations/    # Testes de validações
│       │   └── mocks/          # Dados mock para testes
│       ├── config/             # Configuração do Firebase
│       ├── controllers/        # Controladores HTTP
│       ├── events/             # Sistema de eventos (EventBus)
│       ├── middlewares/        # CORS, auth, errors
│       ├── models/             # Interfaces TypeScript
│       ├── repositories/       # Acesso a dados (Firestore, factory por tenant)
│       ├── routes/             # Definição de rotas
│       ├── services/           # Lógica de negócio (factory por tenant)
│       ├── utils/              # Utilitários (logger, errors, tenantDb)
│       └── validations/        # Schemas Zod
│
├── frontend/
│   └── src/
│       ├── __tests__/          # Testes unitários (Vitest)
│       │   ├── components/     # Testes de componentes
│       │   ├── contexts/       # Testes de contextos
│       │   ├── pages/          # Testes de páginas
│       │   ├── services/       # Testes de serviços
│       │   ├── styles/         # Testes de tema
│       │   └── utils/          # Testes de utilitários
│       ├── components/         # Componentes React
│       │   ├── auth/           # Autenticação (PrivateRoute)
│       │   ├── clientes/       # Componentes de clientes
│       │   ├── layout/         # Layout administrativo (slug-aware)
│       │   ├── notificacoes/   # Notificações
│       │   ├── orcamentos/     # Orçamentos, Modal e PDF
│       │   └── ui/             # Componentes genéricos
│       ├── contexts/           # Contextos React (Auth, Tenant)
│       ├── hooks/              # Hooks customizados
│       ├── pages/              # Páginas da aplicação
│       │   ├── Configuracoes/  # Tabs: Empresa, Layout, Serviços, etc.
│       │   └── ...             # Home, Login, Register, Dashboard, etc.
│       ├── services/           # Comunicação com API
│       ├── styles/             # Estilos globais e tema
│       ├── types/              # Tipos TypeScript
│       └── utils/              # Utilitários (colorUtils, constants)
│
├── firebase.json               # Configuração Firebase
├── firestore.rules             # Regras de segurança (tenant-scoped)
└── .firebaserc                 # Projeto Firebase
```

## Instalação

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Firebase com projeto configurado
- Firebase CLI (`npm install -g firebase-tools`)

### Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` com as variáveis:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Configure as credenciais do Firebase Admin SDK.

### Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` com as variáveis:

```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Executando o Projeto

### Desenvolvimento

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3001`.

### Produção

**Build do Backend:**

```bash
cd backend
npm run build
npm start
```

**Build do Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

### Deploy no Firebase

```bash
# Build de ambos os projetos
cd backend && npm run build
cd ../frontend && npm run build

# Deploy completo
firebase deploy

# Deploy apenas hosting
firebase deploy --only hosting

# Deploy apenas functions
firebase deploy --only functions
```

### Configuração Firebase (Cloud Functions Gen 2)

O projeto utiliza Cloud Functions Gen 2, que roda no Cloud Run. A configuração do `firebase.json` usa `run` ao invés de `function` para o rewrite:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "api",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

## Testes

### Backend (Jest)

```bash
cd backend
npm test                    # Executar testes
npm run test:watch          # Modo watch
npm run test:coverage       # Com cobertura
```

### Frontend (Vitest)

```bash
cd frontend
npm test                    # Executar testes
npm run test:ui             # Interface visual
npm run test:coverage       # Com cobertura
```

## Cobertura de Testes

O projeto mantém uma cobertura de testes abrangente:

### Backend (600 testes, 31 suites)

| Métrica    | Cobertura |
| ---------- | --------- |
| Statements | 97.89%    |
| Branches   | 88.94%    |
| Functions  | 98.19%    |
| Lines      | 98.38%    |

- **Controllers**: 100% de cobertura (todos os endpoints, incluindo auth)
- **Services**: 96%+ de cobertura (lógica de negócio, factory pattern)
- **Middlewares**: 100% de cobertura (auth com tenant, error handling)
- **Utils**: 100% de cobertura (logger, errors, constants, tenantDb, requestContext)
- **Validations**: 100% de cobertura (Zod schemas)
- **Events**: 100% de cobertura (EventBus)

### Frontend (1163 testes, 65 suites)

| Métrica    | Cobertura |
| ---------- | --------- |
| Statements | 94.13%    |
| Branches   | 88.08%    |
| Functions  | 84.91%    |
| Lines      | 94.13%    |

- **Componentes**: OrcamentoModal, OrcamentoCompletoSections, ClienteModal, NotificacaoDropdown, OrcamentoPDF, AdminLayout
- **Páginas**: Home, Login, Register, Dashboard, Clientes, Orçamentos, Notificações, Relatórios, Configurações (todas as tabs)
- **Contextos**: AuthContext, TenantContext
- **Serviços**: Todos os serviços de API com 100% de cobertura (incluindo authService)
- **Utils**: colorUtils, constants com 95%+ de cobertura
- **Styles**: Theme com 100% de cobertura

## API Endpoints

### Autenticação (público)

| Método | Endpoint                    | Descrição                   |
| ------ | --------------------------- | --------------------------- |
| POST   | `/api/auth/register`        | Registrar empresa + usuário |
| GET    | `/api/auth/check-slug/:slug`| Verificar disponibilidade   |
| GET    | `/api/auth/me`              | Dados do tenant do usuário  |

### Endpoints Principais (autenticado, tenant-scoped)

| Método   | Endpoint                    | Descrição                |
| -------- | --------------------------- | ------------------------ |
| GET      | `/api/health`               | Health check             |
| GET/POST | `/api/clientes`             | Gestão de clientes       |
| GET/POST | `/api/orcamentos`           | Gestão de orçamentos     |
| GET/POST | `/api/servicos`             | Configuração de serviços |
| GET/POST | `/api/categorias-item`      | Categorias de itens      |
| GET/POST | `/api/itens-servico`        | Itens de serviço         |
| GET/POST | `/api/limitacoes`           | Observações padrão       |
| GET/POST | `/api/palavras-chave`       | Palavras-chave           |
| GET/PUT  | `/api/configuracoes-gerais` | Configurações gerais     |
| GET      | `/api/historico-valores`    | Histórico de valores     |

### Endpoints de Notificações (com Paginação)

| Método | Endpoint                               | Descrição                    |
| ------ | -------------------------------------- | ---------------------------- |
| GET    | `/api/notificacoes/resumo`             | Resumo (totais por status)   |
| GET    | `/api/notificacoes/nao-lidas/count`    | Contagem de não lidas        |
| GET    | `/api/notificacoes/paginado`           | Todas (paginado)             |
| GET    | `/api/notificacoes/nao-lidas/paginado` | Não lidas (paginado)         |
| GET    | `/api/notificacoes/vencidas/paginado`  | Vencidas (paginado)          |
| GET    | `/api/notificacoes/ativas/paginado`    | Ativas (paginado)            |
| GET    | `/api/notificacoes/proximas/paginado`  | Próximas a vencer (paginado) |
| GET    | `/api/notificacoes/:id`                | Buscar por ID                |
| PATCH  | `/api/notificacoes/:id/lida`           | Marcar como lida             |
| PATCH  | `/api/notificacoes/marcar-todas-lidas` | Marcar todas como lidas      |
| DELETE | `/api/notificacoes/:id`                | Excluir notificação          |

**Parâmetros de Paginação:**

- `pageSize`: Número de itens por página (padrão: 10)
- `cursor`: Cursor para próxima página
- `dias`: Dias para filtro (ativas: 60, próximas: 30)

## Arquitetura

### Backend

- **Multi-Tenant Factory Pattern**: Repositories e Services criados por tenant via factory functions
- **Subcollections**: Dados isolados em `tenants/{tenantId}/collection/{docId}`
- **Repository Pattern**: Abstração do acesso a dados (scoped por tenant)
- **Service Layer**: Separação da lógica de negócio
- **Controller Layer**: Tratamento de requisições HTTP com extração de tenantId
- **Cursor-based Pagination**: Paginação eficiente com Firestore
- **Event Bus**: Comunicação entre serviços (notificações com tenantId)
- **Zod Validation**: Validação de schemas de entrada
- **Error Handling**: Classes de erro customizadas
- **Custom Claims**: tenantId/slug/role no token Firebase Auth

### Frontend

- **Context API**: Estado global (AuthContext + TenantContext)
- **Slug-aware Routing**: Todas as rotas internas prefixadas com `/:slug`
- **CSS Variables Override**: Cores do tenant aplicadas via style no container
- **Custom Hooks**: Lógica reutilizável (useTenant, useConfiguracoesGerais, etc.)
- **React Query**: Cache e sincronização com servidor
- **useInfiniteQuery**: Paginação infinita para notificações
- **Styled Components**: Estilos encapsulados com theme system
- **Discriminated Unions**: Tipos seguros para orçamentos (simples/completo)

### Firestore - Estrutura de Dados

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
tenants/{tenantId}          # Dados do tenant (slug, nomeEmpresa, ownerId)
slugs/{slug}                # Lookup reverso slug → tenantId
userTenants/{uid}           # Mapeamento userId → tenantId + slug + role
```

## Scripts Disponíveis

### Backend

| Script                  | Descrição                   |
| ----------------------- | --------------------------- |
| `npm run dev`           | Servidor de desenvolvimento |
| `npm run build`         | Compilar TypeScript         |
| `npm start`             | Executar versão compilada   |
| `npm test`              | Executar testes             |
| `npm run test:watch`    | Testes em modo watch        |
| `npm run test:coverage` | Testes com cobertura        |

### Frontend

| Script                  | Descrição                  |
| ----------------------- | -------------------------- |
| `npm run dev`           | Servidor Vite              |
| `npm run build`         | Build de produção          |
| `npm run preview`       | Preview do build           |
| `npm run lint`          | Verificação ESLint         |
| `npm test`              | Executar testes            |
| `npm run test:ui`       | Interface visual de testes |
| `npm run test:coverage` | Testes com cobertura       |

## Troubleshooting

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro de CORS

Verificar se `FRONTEND_URL` no backend corresponde à URL do frontend.

### Firebase não conecta

1. Verificar se as variáveis de ambiente estão corretas
2. Verificar se o projeto Firebase existe
3. Verificar se o Firestore está habilitado

## Licença

Projeto privado - FluxaQuote.
