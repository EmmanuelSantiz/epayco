import express from 'express';
import { crearPago, confirmarPago } from '../controllers/transacciones.controller';
import { Constantes } from '../utils/constantes';

const router = express.Router();
// Rutas
router.post(Constantes.TRANSACCIONES.PAGO, crearPago);
router.post(Constantes.TRANSACCIONES.CONFIRMAR, confirmarPago);

export default router;
