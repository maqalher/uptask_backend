"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const Project_1 = __importDefault(require("../models/Project"));
class ProjectController {
    static createProject = async (req, res) => {
        // console.log(req.user); // esxiste por el middleware de auth
        const project = new Project_1.default(req.body);
        // Asigna un manager
        project.manager = req.user.id;
        try {
            await project.save();
            // await Project.create(req.body)
            res.send('Proyecto Creado Correctamante');
        }
        catch (error) {
            console.log(error);
        }
    };
    static getAllProjects = async (req, res) => {
        try {
            const projects = await Project_1.default.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            });
            res.json(projects);
        }
        catch (error) {
            console.log(error);
        }
    };
    static getProjectById = async (req, res) => {
        const { id } = req.params;
        try {
            const project = await Project_1.default.findById(id).populate('tasks');
            if (!project) {
                const error = new Error('Proyecto no encontrado');
                res.status(404).json({ error: error.message });
                return;
            }
            // valida que sea manager del proyecto y formes parte del equipo
            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Accion no valida');
                res.status(404).json({ error: error.message });
                return;
            }
            res.json(project);
        }
        catch (error) {
            console.log(error);
        }
    };
    static updateProject = async (req, res) => {
        try {
            // valida que sea manager del proyecto
            // if(project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error('Solo el Manager puede actualziar un Proyecto')
            //     res.status(404).json({error: error.message})
            //     return
            // }
            req.project.clientName = req.body.clientName;
            req.project.projectName = req.body.projectName;
            req.project.description = req.body.description;
            await req.project.save();
            res.send('Proyecto Actualizado');
        }
        catch (error) {
            console.log(error);
        }
    };
    static deleteProject = async (req, res) => {
        try {
            await req.project.deleteOne();
            res.send('Proyecto Eliminado');
        }
        catch (error) {
            console.log(error);
        }
    };
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=ProjectController.js.map