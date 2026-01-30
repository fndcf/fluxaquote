import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import authRoutes from './auth';
import healthRoutes from './health';
import clienteRoutes from './clientes';
import orcamentoRoutes from './orcamentos';
import palavrasChaveRoutes from './palavrasChave';
import servicoRoutes from './servicos';
import categoriaItemRoutes from './categoriasItem';
import limitacaoRoutes from './limitacoes';
import configuracoesGeraisRoutes from './configuracoesGerais';
import itensServicoRoutes from './itensServico';
import notificacaoRoutes from './notificacoes';
import historicoValoresRoutes from './historicoValores';

const router = Router();

// Rotas públicas (sem autenticação)
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// Rotas protegidas (com autenticação)
router.use('/clientes', authMiddleware, clienteRoutes);
router.use('/orcamentos', authMiddleware, orcamentoRoutes);
router.use('/palavras-chave', authMiddleware, palavrasChaveRoutes);
router.use('/servicos', authMiddleware, servicoRoutes);
router.use('/categorias-item', authMiddleware, categoriaItemRoutes);
router.use('/limitacoes', authMiddleware, limitacaoRoutes);
router.use('/configuracoes-gerais', authMiddleware, configuracoesGeraisRoutes);
router.use('/itens-servico', authMiddleware, itensServicoRoutes);
router.use('/notificacoes', authMiddleware, notificacaoRoutes);
router.use('/historico-valores', authMiddleware, historicoValoresRoutes);

export default router;
