"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberController = void 0;
const User_1 = __importDefault(require("../models/User"));
const Project_1 = __importDefault(require("../models/Project"));
class TeamMemberController {
    static findMemeberByEmail = async (req, res) => {
        const { email } = req.body;
        // Find user
        const user = await User_1.default.findOne({ email }).select('id email name');
        if (!user) {
            const error = new Error('Usuario No Encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        res.json(user);
    };
    static addMemberByID = async (req, res) => {
        const { id } = req.body;
        // Find user
        const user = await User_1.default.findById(id).select('id');
        if (!user) {
            const error = new Error('Usuario No Encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        // Validar si el usuario ya existe en el proyecto
        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('El usuario ya existe en el proyecto');
            res.status(409).json({ error: error.message });
            return;
        }
        req.project.team.push(user.id);
        await req.project.save();
        res.send('Usuario agregado correctamente');
    };
    static removeMemberByID = async (req, res) => {
        const { userId } = req.params;
        // Validar si el usuario ya existe en el proyecto
        if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no existe en el proyecto');
            res.status(409).json({ error: error.message });
            return;
        }
        req.project.team = req.project.team.filter(teamMemeber => teamMemeber.toString() !== userId);
        await req.project.save();
        res.send('Usuario eliminado correctamente');
    };
    static getProjectTeam = async (req, res) => {
        const project = await Project_1.default.findById(req.project.id).populate({
            path: 'team',
            select: 'id, email name'
        });
        res.json(project.team);
    };
}
exports.TeamMemberController = TeamMemberController;
//# sourceMappingURL=TeamController.js.map