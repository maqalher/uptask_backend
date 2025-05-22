import { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

// Modificar request para agregar la task
declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExist(req: Request, res: Response, next: NextFunction) {
    try {
        const {taskId} = req.params
        const task = await Task.findById(taskId)
        if(!task) {
            const error = new Error('Tarea no encontrado')
            res.status(404).json({error: error.message})
            return
        }

        req.task = task // Agregar task al request
        
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction){
    if(req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Accion no valida')
        res.status(400).json({error: error.message})
        return
    }
    next()
}