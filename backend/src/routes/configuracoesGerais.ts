import { Router } from 'express';
import { configuracoesGeraisController } from '../controllers/configuracoesGeraisController';
import { validate } from '../middlewares/validate';
import { updateConfiguracoesSchema } from '../validations/configuracoesValidation';

const router = Router();

router.get('/', configuracoesGeraisController.buscar);
router.put('/', validate(updateConfiguracoesSchema), configuracoesGeraisController.atualizar);

export default router;
