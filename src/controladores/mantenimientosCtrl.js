import { conmysql } from '../db.js';

async function esVehiculoDelUsuario(veh_id, usr_id) {
    const [result] = await conmysql.query(
        'SELECT veh_id FROM vehiculos WHERE veh_id = ? AND usr_id = ?',
        [veh_id, usr_id]
    );
    return result.length > 0;
}

export const getMantenimientos = async (req, res) => {
    try {
        const { veh_id } = req.query;
        if (!veh_id) return res.status(400).json({ message: "veh_id es requerido" });

        const permitido = await esVehiculoDelUsuario(veh_id, req.usuario.id);
        if (!permitido) return res.status(403).json({ message: "No autorizado sobre este vehículo" });

        const [result] = await conmysql.query(
            `SELECT m.*, c.cat_nombre
             FROM mantenimientos m
             INNER JOIN categorias_repuesto c ON c.cat_id = m.cat_id
             WHERE m.veh_id = ?
             ORDER BY m.mnt_fecha DESC`,
            [veh_id]
        );
        res.json(result);
    } catch (error) {
        console.error("ERROR DETALLADO EN GET MANTENIMIENTOS:", error);
        return res.status(500).json({ message: "Error al consultar mantenimientos", error: error.message });
    }
};

export const postInsertarMantenimiento = async (req, res) => {
    try {
        const { veh_id, cat_id, mnt_tipo, mnt_descripcion, mnt_fecha, mnt_kilometraje, mnt_costo, mnt_taller, mnt_observaciones } = req.body;

        const permitido = await esVehiculoDelUsuario(veh_id, req.usuario.id);
        if (!permitido) return res.status(403).json({ message: "No autorizado sobre este vehículo" });

        const [result] = await conmysql.query(
            `INSERT INTO mantenimientos
               (veh_id, cat_id, mnt_tipo, mnt_descripcion, mnt_fecha, mnt_kilometraje, mnt_costo, mnt_taller, mnt_observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [veh_id, cat_id, mnt_tipo || 'preventivo', mnt_descripcion, mnt_fecha, mnt_kilometraje, mnt_costo || 0, mnt_taller || null, mnt_observaciones || null]
        );

        await conmysql.query(
            'UPDATE vehiculos SET veh_kilometraje = GREATEST(veh_kilometraje, ?) WHERE veh_id = ?',
            [mnt_kilometraje, veh_id]
        );

        res.json({ mnt_id: result.insertId, message: "Mantenimiento registrado correctamente" });
    } catch (error) {
        console.error("ERROR DETALLADO EN MANTENIMIENTO:", error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const putMantenimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { cat_id, mnt_tipo, mnt_descripcion, mnt_fecha, mnt_kilometraje, mnt_costo, mnt_taller, mnt_observaciones } = req.body;

        const [check] = await conmysql.query(
            `SELECT m.mnt_id FROM mantenimientos m
             INNER JOIN vehiculos v ON v.veh_id = m.veh_id
             WHERE m.mnt_id = ? AND v.usr_id = ?`,
            [id, req.usuario.id]
        );
        if (check.length <= 0) return res.status(404).json({ message: "Registro no encontrado" });

        await conmysql.query(
            `UPDATE mantenimientos
             SET cat_id=?, mnt_tipo=?, mnt_descripcion=?, mnt_fecha=?, mnt_kilometraje=?, mnt_costo=?, mnt_taller=?, mnt_observaciones=?
             WHERE mnt_id=?`,
            [cat_id, mnt_tipo, mnt_descripcion, mnt_fecha, mnt_kilometraje, mnt_costo, mnt_taller, mnt_observaciones, id]
        );

        res.json({ message: "Mantenimiento actualizado correctamente" });
    } catch (error) {
        console.error("ERROR DETALLADO EN PUT MANTENIMIENTO:", error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const deleteMantenimiento = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await conmysql.query(
            `SELECT m.mnt_id FROM mantenimientos m
             INNER JOIN vehiculos v ON v.veh_id = m.veh_id
             WHERE m.mnt_id = ? AND v.usr_id = ?`,
            [id, req.usuario.id]
        );
        if (check.length <= 0) return res.status(404).json({ message: "Registro no encontrado" });

        await conmysql.query('DELETE FROM mantenimientos WHERE mnt_id = ?', [id]);
        res.json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
        console.error("ERROR DETALLADO EN DELETE MANTENIMIENTO:", error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};