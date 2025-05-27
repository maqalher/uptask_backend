"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const Token_1 = __importDefault(require("../models/Token"));
const token_1 = require("../utils/token");
const AuthEmail_1 = require("../emails/AuthEmail");
const jwt_1 = require("../utils/jwt");
class AuthController {
    static createAccount = async (req, res) => {
        try {
            const { password, email } = req.body;
            // Prevenir duplicados
            const userExist = await User_1.default.findOne({ email });
            if (userExist) {
                const error = new Error('El Usuario ya esta registrado');
                res.status(409).json({ error: error.message });
                return;
            }
            // Crear usuario
            const user = new User_1.default(req.body);
            //Hash Password
            user.password = await (0, auth_1.hashPassword)(password);
            // Generar Token
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            // enviar el email
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            // await user.save()
            // await token.save()
            await Promise.allSettled([user.save(), token.save()]);
            res.send('Cuenta creada, revisa tu email para confimarla');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static confirmAccount = async (req, res) => {
        try {
            const { token } = req.body;
            const tokenExist = await Token_1.default.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(404).json({ error: error.message });
                return;
            }
            if (tokenExist) {
                const user = await User_1.default.findById(tokenExist.user);
                user.confirmed = true;
                await Promise.allSettled([
                    user.save(),
                    tokenExist.deleteOne()
                ]);
                res.send('Cuenta confirmada correctamante');
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('Usuario no encontrado');
                res.status(404).json({ error: error.message });
                return;
            }
            if (!user.confirmed) {
                // Generar token nuevamente
                const token = new Token_1.default();
                token.user = user.id;
                token.token = (0, token_1.generateToken)();
                await token.save();
                // enviar el email
                AuthEmail_1.AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmacion');
                res.status(401).json({ error: error.message });
                return;
            }
            // Revisar password
            const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error('Password Incorrecto');
                res.status(401).json({ error: error.message });
                return;
            }
            const token = (0, jwt_1.generateJWT)({ id: user._id });
            res.send(token);
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static requetConfirmationCode = async (req, res) => {
        try {
            const { email } = req.body;
            // Usuario Existe
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('El Usuario no esta registrado');
                res.status(404).json({ error: error.message });
                return;
            }
            if (user.confirmed) {
                const error = new Error('El Usuario ya esta confirmado');
                res.status(403).json({ error: error.message });
                return;
            }
            // Generar Token
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            // enviar el email
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await Promise.allSettled([user.save(), token.save()]);
            res.send('Se envio un nuevo token a tu e-mail');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            // Usuario Existe
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('El Usuario no esta registrado');
                res.status(404).json({ error: error.message });
                return;
            }
            // Generar Token
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            await token.save();
            // enviar el email
            AuthEmail_1.AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            });
            res.send('Revisa tu email para instrucciones');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static validateToken = async (req, res) => {
        try {
            const { token } = req.body;
            const tokenExist = await Token_1.default.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(404).json({ error: error.message });
                return;
            }
            res.send('Token valido, Define tu nuevo password');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static updatePasswordWithToken = async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
            const tokenExist = await Token_1.default.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(404).json({ error: error.message });
                return;
            }
            const user = await User_1.default.findById(tokenExist.user);
            user.password = await (0, auth_1.hashPassword)(password);
            await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
            res.send('El password se modifico correctamante');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static user = async (req, res) => {
        res.json(req.user);
    };
    static updateProfile = async (req, res) => {
        const { name, email } = req.body;
        req.user.name = name;
        req.user.email = email;
        const userExist = await User_1.default.findOne({ email });
        if (userExist && userExist.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta registrado');
            res.status(409).json({ error: error.message });
        }
        try {
            await req.user.save();
            res.send('Perfil actualizado correctamante');
        }
        catch (error) {
            res.status(500).send('Hubo un error');
        }
    };
    static updateCurrentUserPassword = async (req, res) => {
        const { current_password, password } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(current_password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('El Password actual es incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        try {
            user.password = await (0, auth_1.hashPassword)(password);
            await user.save();
            res.send('El Password se modificao correctamante');
        }
        catch (error) {
            res.status(500).send('Hubo un error');
        }
    };
    static checkPassword = async (req, res) => {
        const { password } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('El Password es incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        res.send('Password Correcto');
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map