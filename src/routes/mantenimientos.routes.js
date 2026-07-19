import { Router } from 'express';
import {
  getMantenimientos, postInsertarMantenimiento, putMantenimiento, deleteMantenimiento
} from '../controladores/mantenimientosCtrl.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/mantenimientos', verificarToken, getMantenimientos);
router.post('/mantenimientos', verificarToken, postInsertarMantenimiento);
router.put('/mantenimientos/:id', verificarToken, putMantenimiento);
router.delete('/mantenimientos/:id', verificarToken, deleteMantenimiento);

export default router;
