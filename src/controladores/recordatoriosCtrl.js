import { conmysql } from '../db.js';

async function esVehiculoDelUsuario(veh_id, usr_id) {
    const [result] = await conmysql.query(
        'SELECT veh_id FROM vehiculos WHERE veh_id = ? AND usr_id = ?',
        [veh_id, usr_id]
    );
    return result.length > 0;
}

export const getRecordatorios = async (req, res) => {
    try {
        const { veh_id } = req.query;
        if (!veh_id) return res.status(400).json({ message: "veh_id es requerido" });

        const permitido = await esVehiculoDelUsuario(veh_id, req.usuario.id);
        if (!permitido) return res.status(403).json({ message: "No autorizado sobre este vehículo" });

        const [result] = await conmysql.query(
            'SELECT * FROM recordatorios WHERE veh_id = ? ORDER BY rec_completado ASC, rec_fecha_limite ASC',
            [veh_id]
        );
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar recordatorios" });
    }
};

export const postInsertarRecordatorio = async (req, res) => {
    try {
        const { veh_id, cat_id, rec_titulo, rec_fecha_limite, rec_kilometraje_limite, rec_notas } = req.body;

        const permitido = await esVehiculoDelUsuario(veh_id, req.usuario.id);
        if (!permitido) return res.status(403).json({ message: "No autorizado sobre este vehículo" });

        const [result] = await conmysql.query(
            `INSERT INTO recordatorios (veh_id, cat_id, rec_titulo, rec_fecha_limite, rec_kilometraje_limite, rec_notas)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [veh_id, cat_id || null, rec_titulo, rec_fecha_limite || null, rec_kilometraje_limite || null, rec_notas || null]
        );

        res.json({ rec_id: result.insertId, message: "Recordatorio creado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const patchCompletarRecordatorio = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await conmysql.query(
            `UPDATE recordatorios r
             INNER JOIN vehiculos v ON v.veh_id = r.veh_id
             SET r.rec_completado = 1
             WHERE r.rec_id = ? AND v.usr_id = ?`,
            [id, req.usuario.id]
        );

        if (result.affectedRows <= 0) return res.status(404).json({ message: "Recordatorio no encontrado" });
        res.json({ message: "Recordatorio marcado como completado" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteRecordatorio = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await conmysql.query(
            `SELECT r.rec_id FROM recordatorios r
             INNER JOIN vehiculos v ON v.veh_id = r.veh_id
             WHERE r.rec_id = ? AND v.usr_id = ?`,
            [id, req.usuario.id]
        );
        if (check.length <= 0) return res.status(404).json({ message: "Recordatorio no encontrado" });

        await conmysql.query('DELETE FROM recordatorios WHERE rec_id = ?', [id]);
        res.json({ message: "Recordatorio eliminado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
