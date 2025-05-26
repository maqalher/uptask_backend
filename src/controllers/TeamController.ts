import { Request, Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    static findMemeberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body

        // Find user
        const user = await User.findOne({email}).select('id email name')
        if(!user) {
            const error = new Error('Usuario No Encontrado')
            res.status(404).json({error: error.message})
            return
        }

        res.json(user)
    }

    static addMemberByID = async (req: Request, res: Response) => {
        const { id } = req.body

        // Find user
        const user = await User.findById(id).select('id')
        if(!user) {
            const error = new Error('Usuario No Encontrado')
            res.status(404).json({error: error.message})
            return
        }

        // Validar si el usuario ya existe en el proyecto
        if(req.project.team.some( team => team.toString() === user.id.toString())) {
            const error = new Error('El usuario ya existe en el proyecto')
            res.status(409).json({error: error.message})
            return
        }

        req.project.team.push(user.id)
        await req.project.save()

        res.send('Usuario agregado correctamente')
    }

    static removeMemberByID = async (req: Request, res: Response) => {
        const { userId } = req.params

        // Validar si el usuario ya existe en el proyecto
        if(!req.project.team.some( team => team.toString() === userId)) {
            const error = new Error('El usuario no existe en el proyecto')
            res.status(409).json({error: error.message})
            return
        }

        req.project.team = req.project.team.filter( teamMemeber => teamMemeber.toString() !== userId )
        await req.project.save()

        res.send('Usuario eliminado correctamente')
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id, email name'
        })

        res.json(project.team)
    }
}