import { conmysql } from '../db.js';

export const getVehiculos = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'SELECT * FROM vehiculos WHERE usr_id = ? AND veh_activo = 1',
            [req.usuario.id]
        );
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar vehículos" });
    }
};

export const getVehiculoxid = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'SELECT * FROM vehiculos WHERE veh_id = ? AND usr_id = ?',
            [req.params.id, req.usuario.id]
        );
        if (result.length <= 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }
        res.json(result[0]);
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const postInsertarVehiculo = async (req, res) => {
    try {
        const { veh_placa, veh_marca, veh_modelo, veh_anio, veh_color, veh_kilometraje } = req.body;

        const [result] = await conmysql.query(
            `INSERT INTO vehiculos(usr_id, veh_placa, veh_marca, veh_modelo, veh_anio, veh_color, veh_kilometraje)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.usuario.id, veh_placa, veh_marca, veh_modelo, veh_anio || null, veh_color || null, veh_kilometraje || 0]
        );

        res.json({ veh_id: result.insertId, message: "Vehículo registrado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const putVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const { veh_placa, veh_marca, veh_modelo, veh_anio, veh_color, veh_kilometraje } = req.body;

        const [result] = await conmysql.query(
            `UPDATE vehiculos
             SET veh_placa=?, veh_marca=?, veh_modelo=?, veh_anio=?, veh_color=?, veh_kilometraje=?
             WHERE veh_id=? AND usr_id=?`,
            [veh_placa, veh_marca, veh_modelo, veh_anio, veh_color, veh_kilometraje, id, req.usuario.id]
        );

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }
        res.json({ message: "Vehículo actualizado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const deleteVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conmysql.query(
            'UPDATE vehiculos SET veh_activo = 0 WHERE veh_id = ? AND usr_id = ?',
            [id, req.usuario.id]
        );
        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }
        res.json({ message: "Vehículo eliminado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
