import express from 'express';
import { recargarBilletera, consultarBilletera } from '../controllers/billetera.controller';
import { Constantes } from '../utils/constantes';

const router = express.Router();

// Middleware específico para esta ruta para depurar
/*router.use((req, res, next) => {
  console.log('Request a ruta de billetera:', {
    method: req.method,
    url: req.url,
    body: req.body,
    contentType: req.headers['content-type']
  });
  next();
});*/

// Rutas
router.post(Constantes.BILLETERA.RECARGAR, recargarBilletera);
router.get(Constantes.BILLETERA.CONSULTAR_SALDO, consultarBilletera);

export default router;
