import express from 'express';
import { crearCliente } from '../controllers/cliente.controller';

const router = express.Router();
// Rutas
router.post('/', crearCliente);

export default router;
