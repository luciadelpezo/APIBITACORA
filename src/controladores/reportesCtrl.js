import { conmysql } from '../db.js';

export const getReporteGastos = async (req, res) => {
    try {
        const { veh_id } = req.query;
        if (!veh_id) return res.status(400).json({ message: "veh_id es requerido" });

        const [permiso] = await conmysql.query(
            'SELECT veh_id FROM vehiculos WHERE veh_id = ? AND usr_id = ?',
            [veh_id, req.usuario.id]
        );
        if (permiso.length <= 0) {
            return res.status(403).json({ message: "No autorizado sobre este vehículo" });
        }

        const [total] = await conmysql.query(
            'SELECT COALESCE(SUM(mnt_costo),0) AS gasto_total, COUNT(*) AS cantidad FROM mantenimientos WHERE veh_id = ?',
            [veh_id]
        );

        const [porCategoria] = await conmysql.query(
            `SELECT c.cat_nombre, COALESCE(SUM(m.mnt_costo),0) AS gasto, COUNT(*) AS cantidad
             FROM mantenimientos m
             INNER JOIN categorias_repuesto c ON c.cat_id = m.cat_id
             WHERE m.veh_id = ?
             GROUP BY c.cat_nombre
             ORDER BY gasto DESC`,
            [veh_id]
        );

        const [porMes] = await conmysql.query(
            `SELECT DATE_FORMAT(mnt_fecha, '%Y-%m') AS mes, COALESCE(SUM(mnt_costo),0) AS gasto
             FROM mantenimientos
             WHERE veh_id = ?
             GROUP BY mes
             ORDER BY mes DESC
             LIMIT 12`,
            [veh_id]
        );

        res.json({
            gasto_total: total[0].gasto_total,
            cantidad: total[0].cantidad,
            por_categoria: porCategoria,
            por_mes: porMes
        });

    } catch (error) {
        return res.status(500).json({ message: "Error al generar el reporte" });
    }
};
