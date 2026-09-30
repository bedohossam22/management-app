import express from 'express';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    toggleSubtask,
    deleteTask,
    addNote,
    deleteNote,
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

// Notes routes
router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

export default router;