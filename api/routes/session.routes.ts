import express from 'express';
import { crearTokenSession } from '../controllers/session.controller';

const router = express.Router();
// Rutas
router.post('/', crearTokenSession);

export default router;
