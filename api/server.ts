import express from 'express';
import cors from 'cors';
//import clienteRoutes from './routes/clienteRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Docker!');
});

// Rutas
//app.use('/api', clienteRoutes);

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor API REST corriendo en http://localhost:${PORT}`);
});