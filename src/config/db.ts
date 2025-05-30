import mongoose from "mongoose";
import colors from "colors";
import {exit} from 'node:process'
import { log } from "node:console";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`MongoDB Conectado en: ${url}`));
        
    } catch (error) {
        // console.log(error.message);
        console.log(colors.red.bold("Error al conectar a MongoDB"));
        exit(1)
    }
}