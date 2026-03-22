import { Router } from 'express';
import { servicoController } from '../controllers/servicoController';
import { validate } from '../middlewares/validate';
import { createServicoSchema, updateServicoSchema } from '../validations/servicoValidation';

const router = Router();

router.get('/', servicoController.listar);
router.get('/ativos', servicoController.listarAtivos);
router.get('/:id', servicoController.buscarPorId);
router.post('/', validate(createServicoSchema), servicoController.criar);
router.put('/:id', validate(updateServicoSchema), servicoController.atualizar);
router.patch('/:id/toggle', servicoController.toggleAtivo);
router.delete('/:id', servicoController.excluir);

export default router;
