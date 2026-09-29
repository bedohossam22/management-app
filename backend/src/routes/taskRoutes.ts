import express from 'express';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    toggleSubtask,
    deleteTask,
} from '../controllers/taskController';
import { createTaskValidation, updateTaskValidation } from '../validators/taskValidator';
import { auth } from '../middleware/auth';

const router = express.Router();


router.use(auth);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTaskValidation, createTask);
router.put('/:id', updateTaskValidation, updateTask);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);
router.delete('/:id', deleteTask);

export default router;