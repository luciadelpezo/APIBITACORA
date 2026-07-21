import express from 'express';
import cors from 'cors';
import path from 'path';

// Importa tus rutas específicas de Bitácora
import authRoutes from './routes/auth.routes.js';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import mantenimientosRoutes from './routes/mantenimientos.routes.js';
import recordatoriosRoutes from './routes/recordatorios.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

const app = express();

const corsOptions = { 
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// RUTA ESTÁTICA para imágenes (facturas)
app.use('/uploads', express.static(path.join(process.cwd(), 'src/uploads'))); 
//rutas
app.use('/api', authRoutes);
app.use('/api', vehiculosRoutes);
app.use('/api', mantenimientosRoutes);
app.use('/api', recordatoriosRoutes);
app.use('/api', reportesRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint not found'
    });
});

export default app;