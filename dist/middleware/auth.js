"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    // console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if (!bearer) {
        const error = new Error('No Autorizado');
        res.status(401).json({ error: error.message });
        return;
    }
    // const token = bearer.split(' ')[1]
    const [, token] = bearer.split(' ');
    // Validar Token
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // valida que el usuario exista
        if (typeof decoded === 'object' && decoded.id) {
            const user = await User_1.default.findById(decoded.id).select('id name email');
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(500).json({ error: 'Token No Valido' });
            }
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Token No Valido' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map