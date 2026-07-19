import { Router } from 'express';
import {
  getRecordatorios, postInsertarRecordatorio, patchCompletarRecordatorio, deleteRecordatorio
} from '../controladores/recordatoriosCtrl.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/recordatorios', verificarToken, getRecordatorios);
router.post('/recordatorios', verificarToken, postInsertarRecordatorio);
router.patch('/recordatorios/:id/completar', verificarToken, patchCompletarRecordatorio);
router.delete('/recordatorios/:id', verificarToken, deleteRecordatorio);

export default router;
