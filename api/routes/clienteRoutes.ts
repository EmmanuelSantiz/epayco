import { Router } from 'express';
import * as clienteController from '../controllers/clienteController';

const router = Router();

router.post('/clientes', clienteController.registrarCliente);
router.get('/clientes', clienteController.listarClientes);

export default router;