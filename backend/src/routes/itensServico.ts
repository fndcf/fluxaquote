import { Router } from 'express';
import { itemServicoController } from '../controllers/itemServicoController';
import { validate } from '../middlewares/validate';
import { createItemServicoSchema, updateItemServicoSchema } from '../validations/itemServicoValidation';

const router = Router();

router.get('/', itemServicoController.listar);
router.get('/categoria/:categoriaId', itemServicoController.listarPorCategoria);
router.get('/categoria/:categoriaId/ativos', itemServicoController.listarAtivosPorCategoria);
router.get('/categoria/:categoriaId/ativos/paginado', itemServicoController.listarAtivosPorCategoriaPaginado);
router.get('/categoria/:categoriaId/paginado', itemServicoController.listarPorCategoriaPaginado);
router.get('/:id', itemServicoController.buscarPorId);
router.post('/', validate(createItemServicoSchema), itemServicoController.criar);
router.put('/:id', validate(updateItemServicoSchema), itemServicoController.atualizar);
router.patch('/:id/toggle', itemServicoController.toggleAtivo);
router.delete('/:id', itemServicoController.excluir);

export default router;
