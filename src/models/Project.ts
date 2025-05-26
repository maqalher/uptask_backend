import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { ITask } from "./Task";
import { IUser } from "./User";

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

// const Project = mongoose.model<ProjectType>('Project', ProjectSchema)
const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project