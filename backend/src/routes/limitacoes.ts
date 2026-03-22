import { Router } from 'express';
import { limitacaoController } from '../controllers/limitacaoController';
import { validate } from '../middlewares/validate';
import { createLimitacaoSchema, updateLimitacaoSchema } from '../validations/limitacaoValidation';

const router = Router();

router.get('/', limitacaoController.listar);
router.get('/ativas', limitacaoController.listarAtivas);
router.get('/:id', limitacaoController.buscarPorId);
router.post('/', validate(createLimitacaoSchema), limitacaoController.criar);
router.put('/:id', validate(updateLimitacaoSchema), limitacaoController.atualizar);
router.patch('/:id/toggle', limitacaoController.toggleAtivo);
router.delete('/:id', limitacaoController.excluir);

export default router;
