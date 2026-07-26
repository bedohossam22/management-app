import express from 'express';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController';
import { taskValidation } from '../validators/taskValidator';
import { auth } from '../middleware/auth';

const router = express.Router();


router.use(auth);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', taskValidation, createTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

export default router;