import { conmyslq } from "../db.js"
export const getClientes=
    async (req,res)=>{
        try {
            const [result]= await conmyslq.query('select * from clientes')
            res.json(result)
    } catch (error) {
        return res.status(500).json({message:"Error al consultar clientes"})
    }
    }


export const getclientesxid={
    
}