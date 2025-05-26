import type { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Prevenir duplicados
            const userExist = await User.findOne({email})
            if(userExist) {
                const error = new Error('El Usuario ya esta registrado')
                res.status(409).json({error: error.message})
                return
            }

            // Crear usuario
            const user = new User(req.body)

            //Hash Password
            user.password = await hashPassword(password)

            // Generar Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            // await user.save()
            // await token.save()
            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, revisa tu email para confimarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const {token} = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist) {
                const error = new Error('Token no valido')
                res.status(404).json({error: error.message})
                return
            }
            
            if(tokenExist){
                const user = await User.findById(tokenExist.user)
                user.confirmed = true
    
                await Promise.allSettled([
                    user.save(),
                    tokenExist.deleteOne()
                ])
    
                res.send('Cuenta confirmada correctamante')
            }

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {

            const { email, password } = req.body
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }

            if(!user.confirmed) {
                // Generar token nuevamente
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // enviar el email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmacion')
                res.status(401).json({error: error.message})
                return
            }

            // Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('Password Incorrecto')
                res.status(401).json({error: error.message})
                return
            }

            const token = generateJWT({id: user._id})

            res.send(token)

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requetConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario Existe
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El Usuario no esta registrado')
                res.status(404).json({error: error.message})
                return
            }

            if(user.confirmed) {
                const error = new Error('El Usuario ya esta confirmado')
                res.status(403).json({error: error.message})
                return
            }

            // Generar Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Se envio un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario Existe
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El Usuario no esta registrado')
                res.status(404).json({error: error.message})
                return
            }

            // Generar Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // enviar el email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })


            res.send('Revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const {token} = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist) {
                const error = new Error('Token no valido')
                res.status(404).json({error: error.message})
                return
            }
    
            res.send('Token valido, Define tu nuevo password')
            
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const {token} = req.params
            const {password} = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist) {
                const error = new Error('Token no valido')
                res.status(404).json({error: error.message})
                return
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([ user.save(), tokenExist.deleteOne()])
    
            res.send('El password se modifico correctamante')
            
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        req.user.name = name
        req.user.email = email

        const userExist = await User.findOne({email})
        if(userExist && userExist.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta registrado')
            res.status(409).json({error: error.message})
        }

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamante')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body      

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('El Password actual es incorrecto')
            res.status(401).json({error: error.message})
            return
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('El Password se modificao correctamante')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body      

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('El Password es incorrecto')
            res.status(401).json({error: error.message})
            return
        }

        res.send('Password Correcto')
    }
}