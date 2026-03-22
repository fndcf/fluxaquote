# FluxaQuote — Guia de Arquitetura e Padrões

> Documento de referência para manter consistência em novas implementações.
> Última atualização: 21/03/2026

---

## Visão Geral

```
Frontend (React + TypeScript)          Backend (Express + TypeScript)
========================              ========================
Page → Hook → Service → API  ───►    Route → Controller → Service → Repository → Firestore
                                                   ▲
                                            Validation (Zod)
                                            Auth Middleware
                                            Rate Limiter
                                            Request Logger
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Vite, Styled Components, @tanstack/react-query v5 |
| Backend | Node.js 20, Express, TypeScript, Firebase Admin SDK, Zod |
| Database | Cloud Firestore (multi-tenant via subcollections) |
| Auth | Firebase Authentication + Custom Claims |
| Hosting | Firebase Hosting (frontend) + Cloud Run (backend) |

---

## Como adicionar uma nova entidade

Exemplo: criar a entidade **"Fornecedor"**. Siga cada passo na ordem.

### Passo 1 — Model (`backend/src/models/fornecedor.ts`)

```typescript
export interface Fornecedor {
  id?: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// DTOs
export type CreateFornecedorDTO = Omit<Fornecedor, 'id' | 'createdAt'>;
export type UpdateFornecedorDTO = Partial<CreateFornecedorDTO>;
```

Adicionar no barrel export `backend/src/models/index.ts`:
```typescript
export * from './fornecedor';
```

---

### Passo 2 — Validation (`backend/src/validations/fornecedorValidation.ts`)

```typescript
import { z } from 'zod';

export const createFornecedorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  ativo: z.boolean().optional().default(true),
});

export const updateFornecedorSchema = createFornecedorSchema.partial();
```

Adicionar no barrel export `backend/src/validations/index.ts`:
```typescript
export * from './fornecedorValidation';
```

---

### Passo 3 — Repository (`backend/src/repositories/fornecedorRepository.ts`)

```typescript
import { getTenantDb } from '../utils/tenantDb';
import { Fornecedor } from '../models';
import { NotFoundError } from '../utils/errors';

function mapDocToFornecedor(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
): Fornecedor {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Fornecedor;
}

export function createFornecedorRepository(tenantId: string) {
  const collection = getTenantDb(tenantId).collection('fornecedores');

  async function findAll(): Promise<Fornecedor[]> {
    const snapshot = await collection.orderBy('nome').get();
    return snapshot.docs.map(mapDocToFornecedor);
  }

  async function findById(id: string): Promise<Fornecedor> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError('Fornecedor não encontrado');
    }
    return mapDocToFornecedor(doc);
  }

  async function create(data: Omit<Fornecedor, 'id' | 'createdAt'>): Promise<Fornecedor> {
    const docRef = await collection.add({
      ...data,
      createdAt: new Date(),
    });
    return findById(docRef.id);
  }

  async function update(id: string, data: Partial<Fornecedor>): Promise<Fornecedor> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError('Fornecedor não encontrado');
    }
    await collection.doc(id).update({ ...data, updatedAt: new Date() });
    return findById(id);
  }

  async function deleteFornecedor(id: string): Promise<void> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError('Fornecedor não encontrado');
    }
    await collection.doc(id).delete();
  }

  return {
    findAll,
    findById,
    create,
    update,
    delete: deleteFornecedor,
  };
}
```

**Regras do Repository:**
- Sempre usar `getTenantDb(tenantId)` para scoping
- Converter datas com `.toDate()` no mapeamento
- Lançar `NotFoundError` quando doc não existe
- Retornar a entidade atualizada após `create` e `update`

---

### Passo 4 — Service (`backend/src/services/fornecedorService.ts`)

```typescript
import { Fornecedor } from '../models';
import { createFornecedorRepository } from '../repositories/fornecedorRepository';
import { ValidationError } from '../utils/errors';

export function createFornecedorService(tenantId: string) {
  const repo = createFornecedorRepository(tenantId);

  const listar = async (): Promise<Fornecedor[]> => {
    return repo.findAll();
  };

  const buscarPorId = async (id: string): Promise<Fornecedor> => {
    return repo.findById(id);
  };

  const criar = async (data: Omit<Fornecedor, 'id' | 'createdAt'>): Promise<Fornecedor> => {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }
    return repo.create(data);
  };

  const atualizar = async (id: string, data: Partial<Fornecedor>): Promise<Fornecedor> => {
    if (data.nome && data.nome.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }
    return repo.update(id, data);
  };

  const excluir = async (id: string): Promise<void> => {
    return repo.delete(id);
  };

  return { listar, buscarPorId, criar, atualizar, excluir };
}
```

**Regras do Service:**
- Factory function recebe `tenantId`, cria repository internamente
- Validação de negócio aqui (unicidade, regras de domínio)
- Lançar `ValidationError` para dados inválidos
- Retornar objeto com métodos nomeados em português

---

### Passo 5 — Controller (`backend/src/controllers/fornecedorController.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { createFornecedorService } from '../services/fornecedorService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getTenantId } from '../utils/requestContext';

export const fornecedorController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createFornecedorService(tenantId);
      const fornecedores = await service.listar();
      res.json({ success: true, data: fornecedores });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createFornecedorService(tenantId);
      const fornecedor = await service.buscarPorId(req.params.id);
      res.json({ success: true, data: fornecedor });
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createFornecedorService(tenantId);
      const fornecedor = await service.criar(req.body);
      res.status(201).json({ success: true, data: fornecedor });
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createFornecedorService(tenantId);
      const fornecedor = await service.atualizar(req.params.id, req.body);
      res.json({ success: true, data: fornecedor });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req as AuthRequest);
      const service = createFornecedorService(tenantId);
      await service.excluir(req.params.id);
      res.json({ success: true, message: 'Fornecedor excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  },
};
```

**Regras do Controller:**
- Object literal com métodos async
- Sempre extrair `tenantId` via `getTenantId()`
- Criar service por request
- Respostas: `{ success: true, data }` ou `{ success: true, message }`
- POST retorna `201`, demais retornam `200`
- Erros passados via `next(error)` (tratados pelo errorHandler)

---

### Passo 6 — Route (`backend/src/routes/fornecedores.ts`)

```typescript
import { Router } from 'express';
import { fornecedorController } from '../controllers/fornecedorController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { createFornecedorSchema, updateFornecedorSchema } from '../validations/fornecedorValidation';

const router = Router();

router.use(authMiddleware);

router.get('/', fornecedorController.listar);
router.get('/:id', fornecedorController.buscarPorId);
router.post('/', validate(createFornecedorSchema), fornecedorController.criar);
router.put('/:id', validate(updateFornecedorSchema), fornecedorController.atualizar);
router.delete('/:id', fornecedorController.excluir);

export default router;
```

Registrar em `backend/src/routes/index.ts`:
```typescript
import fornecedorRoutes from './fornecedores';
// ...
router.use('/fornecedores', authMiddleware, fornecedorRoutes);
```

**Regras de Rotas:**
- `validate()` apenas em POST e PUT (não em GET/DELETE)
- Rotas específicas antes de rotas genéricas (`/pesquisar` antes de `/:id`)
- Sempre com `authMiddleware` para rotas protegidas

---

### Passo 7 — Firestore Rules (`firestore.rules`)

Adicionar dentro de `match /tenants/{tenantId}`:
```
match /fornecedores/{docId} {
  allow read, write: if isTenantOwner(tenantId);
}
```

---

### Passo 8 — Tipo no Frontend (`frontend/src/types/index.ts`)

```typescript
export interface Fornecedor {
  id?: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}
```

> No frontend, `createdAt` aceita `Date | string` porque o JSON da API retorna string.

---

### Passo 9 — Service Frontend (`frontend/src/services/fornecedorService.ts`)

```typescript
import api from './api';
import { Fornecedor } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const fornecedorService = {
  async listar(): Promise<Fornecedor[]> {
    const response = await api.get<ApiResponse<Fornecedor[]>>('/fornecedores');
    return response.data.data;
  },

  async buscarPorId(id: string): Promise<Fornecedor> {
    const response = await api.get<ApiResponse<Fornecedor>>(`/fornecedores/${id}`);
    return response.data.data;
  },

  async criar(data: Omit<Fornecedor, 'id' | 'createdAt'>): Promise<Fornecedor> {
    const response = await api.post<ApiResponse<Fornecedor>>('/fornecedores', data);
    return response.data.data;
  },

  async atualizar(id: string, data: Partial<Fornecedor>): Promise<Fornecedor> {
    const response = await api.put<ApiResponse<Fornecedor>>(`/fornecedores/${id}`, data);
    return response.data.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/fornecedores/${id}`);
  },
};
```

**Regras do Service Frontend:**
- Usar a instância `api` (axios com interceptor de auth)
- Tipar resposta como `ApiResponse<T>`
- Retornar `response.data.data` (desembrulhar a resposta padronizada)

---

### Passo 10 — Hook (`frontend/src/hooks/useFornecedores.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fornecedorService } from '../services/fornecedorService';
import { Fornecedor } from '../types';

// staleTime por tipo de dado:
// - Catálogo (serviços, categorias, configs): 5 * 60 * 1000 (5 min)
// - Negócio (clientes, orçamentos): 1 * 60 * 1000 (1 min)

export function useFornecedores() {
  return useQuery({
    queryKey: ['fornecedores'],
    queryFn: fornecedorService.listar,
    staleTime: 5 * 60 * 1000, // catálogo
  });
}

export function useFornecedor(id: string) {
  return useQuery({
    queryKey: ['fornecedor', id],
    queryFn: () => fornecedorService.buscarPorId(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCriarFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Fornecedor, 'id' | 'createdAt'>) =>
      fornecedorService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
    },
  });
}

export function useAtualizarFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Fornecedor> }) =>
      fornecedorService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
    },
  });
}

export function useExcluirFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fornecedorService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
    },
  });
}
```

**Regras dos Hooks:**
- `useQuery` com `queryKey` array e `staleTime` definido
- `useMutation` com `onSuccess` que invalida queries relacionadas
- `enabled: !!id` para queries condicionais
- Hooks nomeados com `use` + verbo em português

---

### Passo 11 — Testes Backend (`backend/src/__tests__/services/fornecedorService.test.ts`)

```typescript
import { createFornecedorService } from '../../services/fornecedorService';
import { createFornecedorRepository } from '../../repositories/fornecedorRepository';
import { ValidationError } from '../../utils/errors';
import { Fornecedor } from '../../models';

jest.mock('../../repositories/fornecedorRepository');

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
(createFornecedorRepository as jest.Mock).mockReturnValue(mockRepo);

describe('FornecedorService', () => {
  let service: ReturnType<typeof createFornecedorService>;

  const mockFornecedor: Fornecedor = {
    id: '1',
    nome: 'Fornecedor Teste',
    ativo: true,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = createFornecedorService('test-tenant');
  });

  describe('listar', () => {
    it('deve retornar lista de fornecedores', async () => {
      mockRepo.findAll.mockResolvedValue([mockFornecedor]);
      const result = await service.listar();
      expect(result).toHaveLength(1);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('criar', () => {
    it('deve criar fornecedor com dados válidos', async () => {
      mockRepo.create.mockResolvedValue(mockFornecedor);
      const result = await service.criar({ nome: 'Fornecedor Teste', ativo: true });
      expect(result).toEqual(mockFornecedor);
    });

    it('deve lançar ValidationError para nome curto', async () => {
      await expect(service.criar({ nome: 'AB', ativo: true }))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

**Regras de Testes Backend:**
- Mock do repository com `jest.mock()`
- `beforeEach` limpa mocks e recria service
- Testar casos de sucesso e validação
- Usar `mockResolvedValue` e `rejects.toThrow`

---

### Passo 12 — Testes Frontend (`frontend/src/__tests__/hooks/useFornecedores.test.tsx`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useFornecedores, useCriarFornecedor } from '../../hooks/useFornecedores';
import { fornecedorService } from '../../services/fornecedorService';

vi.mock('../../services/fornecedorService', () => ({
  fornecedorService: {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    excluir: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFornecedores', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar lista de fornecedores', async () => {
    const mock = [{ id: '1', nome: 'Fornecedor 1' }];
    vi.mocked(fornecedorService.listar).mockResolvedValue(mock as any);

    const { result } = renderHook(() => useFornecedores(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mock);
  });
});
```

**Regras de Testes Frontend:**
- `vi.mock()` para mock do service
- `createWrapper()` com `QueryClientProvider`
- `renderHook()` com wrapper
- `waitFor()` para assertions assíncronas

---

## Referência Rápida de Convenções

### Nomenclatura

| Camada | Arquivo | Export |
|--------|---------|--------|
| Model | `fornecedor.ts` | `interface Fornecedor`, `type CreateFornecedorDTO` |
| Validation | `fornecedorValidation.ts` | `createFornecedorSchema`, `updateFornecedorSchema` |
| Repository | `fornecedorRepository.ts` | `createFornecedorRepository(tenantId)` |
| Service | `fornecedorService.ts` | `createFornecedorService(tenantId)` |
| Controller | `fornecedorController.ts` | `fornecedorController` (object literal) |
| Route | `fornecedores.ts` | `Router` default export |
| Frontend Service | `fornecedorService.ts` | `fornecedorService` (object literal) |
| Frontend Hook | `useFornecedores.ts` | `useFornecedores()`, `useCriarFornecedor()`, etc. |
| Styles | `Page.styles.ts` | Named exports de styled-components |

### Respostas da API

```typescript
// Sucesso
{ success: true, data: T }

// Sucesso com mensagem
{ success: true, message: 'Recurso excluído com sucesso' }

// Erro
{ success: false, error: 'Mensagem de erro' }
```

### Status HTTP

| Operação | Status |
|----------|--------|
| GET (sucesso) | 200 |
| POST (criação) | 201 |
| PUT/PATCH (atualização) | 200 |
| DELETE (exclusão) | 200 |
| Validação inválida | 400 |
| Não autenticado | 401 |
| Sem permissão | 403 |
| Não encontrado | 404 |
| Erro interno | 500 |

### staleTime por tipo de dado

| Tipo | staleTime | Exemplos |
|------|-----------|----------|
| Catálogo | 5 min | serviços, categorias, limitações, palavras-chave, configs |
| Negócio | 1 min | clientes, orçamentos, histórico |
| Real-time | refetchInterval 1 min | notificações |

### Estrutura de diretórios

```
backend/src/
├── config/          # Firebase init
├── controllers/     # Request handlers
├── events/          # EventBus
├── middlewares/      # auth, validate, rateLimiter, requestLogger, errorHandler
├── models/          # Interfaces + DTOs (1 arquivo por domínio + index.ts barrel)
├── repositories/    # Firestore CRUD
├── routes/          # Express routers
├── services/        # Lógica de negócio
├── utils/           # errors, logger, constants, tenantDb, requestContext
├── validations/     # Zod schemas (1 arquivo por domínio + index.ts barrel)
└── __tests__/       # Testes (espelha estrutura src/)

frontend/src/
├── components/
│   ├── auth/        # PrivateRoute
│   ├── clientes/    # Modais de cliente
│   ├── layout/      # AdminLayout, Footer
│   ├── notificacoes/# Dropdown
│   ├── orcamentos/  # OrcamentoModal/, OrcamentoPDF, ViewModal
│   └── ui/          # Button, Card, Input, Modal, Table, Pagination, Loading
├── contexts/        # AuthContext, TenantContext
├── hooks/           # 1 arquivo por domínio
├── pages/           # 1 arquivo ou pasta por página + .styles.ts
├── services/        # 1 arquivo por domínio + api.ts (axios instance)
├── styles/          # GlobalStyles, theme
├── types/           # Interfaces do frontend
└── utils/           # constants, colorUtils, logger
```
