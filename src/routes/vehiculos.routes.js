import { Router } from 'express';
import {
  getVehiculos, getVehiculoxid, postInsertarVehiculo, putVehiculo, deleteVehiculo
} from '../controladores/vehiculosCtrl.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/vehiculos', verificarToken, getVehiculos);
router.get('/vehiculos/:id', verificarToken, getVehiculoxid);
router.post('/vehiculos', verificarToken, postInsertarVehiculo);
router.put('/vehiculos/:id', verificarToken, putVehiculo);
router.delete('/vehiculos/:id', verificarToken, deleteVehiculo);

export default router;
