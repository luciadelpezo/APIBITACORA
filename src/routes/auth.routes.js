import { Router } from 'express';
import { login, registro, solicitarRecuperacion, resetPassword } from '../controladores/authCtrl.js';

const router = Router();

router.post('/login', login);
router.post('/registro', registro);
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.post('/reset-password', resetPassword);

export default router;