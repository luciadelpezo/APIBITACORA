import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import mantenimientosRoutes from './routes/mantenimientos.routes.js';
import recordatoriosRoutes from './routes/recordatorios.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import path from 'path';

const app = express();

const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], 
    credentials: true
};

app.use(cors(corsOptions)); // Habilitar los cors

app.options(/^\/api\/.*/, cors(corsOptions));
app.use(express.json()); 

// Rutas
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