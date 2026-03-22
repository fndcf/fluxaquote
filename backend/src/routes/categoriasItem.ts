import { Router } from 'express';
import { categoriaItemController } from '../controllers/categoriaItemController';
import { validate } from '../middlewares/validate';
import { createCategoriaItemSchema, updateCategoriaItemSchema } from '../validations/categoriaItemValidation';

const router = Router();

router.get('/', categoriaItemController.listar);
router.get('/ativas', categoriaItemController.listarAtivas);
router.get('/:id', categoriaItemController.buscarPorId);
router.post('/', validate(createCategoriaItemSchema), categoriaItemController.criar);
router.put('/:id', validate(updateCategoriaItemSchema), categoriaItemController.atualizar);
router.patch('/:id/toggle', categoriaItemController.toggleAtivo);
router.delete('/:id', categoriaItemController.excluir);

export default router;
