import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController"
import { handleInputErrors } from "../middleware/validation";
import { projectExist } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";


const router = Router()

router.use(authenticate) // Protege todas las rutas con el middleware authenticate

router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion del Proyecto es Obligatoria'),
    handleInputErrors,
    ProjectController.createProject)

router.get('/', ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById)

router.put('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    body('projectName')
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion del Proyecto es Obligatoria'),
    handleInputErrors,
    ProjectController.updateProject)

router.delete('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.deleteProject)

/** Routes for task */

router.param('projectId', projectExist) // con esto se valida en todos los que tenga :projectId en la url

router.post('/:projectId/tasks',  // /api/project/6825909a9291034f90cfa2f6/tasks
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion de la Tarea es Obligatoria'),
    handleInputErrors,
    TaskController.createTask) 

router.get('/:projectId/tasks',  
    TaskController.getProjectTask) 

router.param('taskId', taskExist) // con esto se valida que la tarea exista
router.param('taskId', taskBelongsToProject) // valida que una tarea exista en el proyecto

router.get('/:projectId/tasks/:taskId',  
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTaskById) 

router.put('/:projectId/tasks/:taskId',  
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name')
        .notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripcion de la Tarea es Obligatoria'),
    handleInputErrors,
    TaskController.updateTask) 

router.delete('/:projectId/tasks/:taskId',  
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask) 

router.post('/:projectId/tasks/:taskId/status',  
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus) 

/** Routes for teams */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no valido'),
    handleInputErrors,
    TeamMemberController.findMemeberByEmail
)

router.get('/:projectId/team', TeamMemberController.getProjectTeam)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.addMemberByID
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberByID
)

/** Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El Contenido de la nota es obligatorio'),
        handleInputErrors,
        NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
   NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID No Valido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router