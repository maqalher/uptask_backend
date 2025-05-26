import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import { connectDB } from './config/db'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'
 
dotenv.config()  // habilitar variables de entorno

connectDB() // conexion a la BD

const app = express() // ejecutar express

app.use(cors(corsConfig)) // habilitar Cors

app.use(morgan('dev')) // logging

app.use(express.json()) // habilitar lectura 

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)


export default app