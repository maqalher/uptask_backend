import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

// export type ProjectType = Document & {
export interface IProject extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[] // Relacion con Task (sub documentos) varias tareas
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        require: true,
        trim: true
    },
    clientName: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, {timestamps: true}) // Registra cuando se creo y actualizo

// Middleware -> Eliminar las notas de las tareas que se estan eliminando
ProjectSchema.pre('deleteOne', {document: true}, async function() { // cada vez que se ejecute deleteOne en Project
    const projectId = this._id
    if(!projectId) return

    const tasks = await Task.find({project: projectId}) // Eliminar todas las notas relacionadas con las tareas
    for(const task of tasks) {
        await Note.deleteMany({task: task.id})
    }

    await Task.deleteMany({project: projectId}) // elimina todas las tareas con el id del proyecto eliminado
})

// const Project = mongoose.model<ProjectType>('Project', ProjectSchema)
const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project