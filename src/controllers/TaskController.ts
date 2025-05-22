import { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        
        try {

            const task = new Task(req.body)

            // Agregar proyecto a la tarea
            task.project = req.project.id
            
            // Agregar tarea al proyecto
            req.project.tasks.push(task.id)
            
            // await task.save()
            // await req.project.save()
            // Mejorar awaits
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamante')    
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTask = async (req: Request, res: Response) => {
        try {
            const task = await Task.find({project: req.project.id}).populate('project')
            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            res.json(req.task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.send("Tarea Actualziada Correctamante")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString()) // Eliminar de Project
            await Promise.allSettled([ req.task.deleteOne(), req.project.save() ])
            res.send("Tarea Eliminada Correctamante")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            await req.task.save()

            res.send("Tarea Actualizada")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}