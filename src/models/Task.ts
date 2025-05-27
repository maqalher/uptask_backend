import mongoose, { Document, Schema, Types } from "mongoose";
import Note from "./Note";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const // no se pueden modificar solo leer los valores

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

export const TaskSchema : Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project' // Referencia del Modelo(Project Model)
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING // 'pending'
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING // 'pending'
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, {timestamps: true}) // Registra cuando se creo y actualizo

// Middleware -> Eliminar las notas de las tareas que se estan eliminando
TaskSchema.pre('deleteOne', {document: true}, async function() { // cada vez que se ejecute deleteOne en Task
    const taskId = this._id
    if(!taskId) return
    await Note.deleteMany({task: taskId}) // elimina todas las notas con el id de tarea eliminada
})

const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task