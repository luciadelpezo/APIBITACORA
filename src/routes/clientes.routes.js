import { Router } from "express";
import {getClientes,getclientesxid} from '../controladores/clientesCtrl.js'
const router =Router()
//armar nuestra rutas

router.get('/clientes' ,getClientes)
//router.get('clientes/:id' ,getclientesxid)

export default router