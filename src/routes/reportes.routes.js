import { Router } from 'express';
import { getReporteGastos } from '../controladores/reportesCtrl.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/reportes/gastos', verificarToken, getReporteGastos);

export default router;
