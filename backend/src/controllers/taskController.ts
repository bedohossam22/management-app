import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Task } from '../models/Task';



export const getTasks = async (req: Request, res: Response) => {
    try {
        const { status, priority, search, dueDate } = req.query;
        const query: any = { user: req.user._id };

        // Filter by status
        if (status && ['To Do', 'In Progress', 'Done'].includes(status as string)) {
            query.status = status;
        }

        // Filter by priority
        if (priority && ['Low', 'Medium', 'High'].includes(priority as string)) {
            query.priority = priority;
        }

        // Search by title
        if (search && typeof search === 'string' && search.trim()) {
            query.title = { $regex: search.trim(), $options: 'i' };
        }

        // filter by due date
        if (dueDate && typeof dueDate === 'string' && dueDate !== "All") {
            const now = new Date();
            const startoftoday = new Date(now.getFullYear(), now.getMonth(), now.getSeconds(), 0, 0, 0, 0);
            const endofday = new Date(now.getFullYear(), now.getMonth(), now.getSeconds(), 23, 59, 59, 999);
            const filterVal = dueDate.toLowerCase();
            if (filterVal === 'overdue') {
                query.dueDate = { $lt: startoftoday };
                if (!query.status) {
                    query.status = { $ne: 'Done' }
                }
            } else if (filterVal === 'today') {
                query.dueDate = { $gte: startoftoday, $lt: endofday }
            } else if (filterVal === 'upcoming') {
                query.dueDate = { $gt: endofday }
            } else {
                const dateVal = new Date(dueDate);
                if (!isNaN(dateVal.getTime())) {
                    const dayStart = new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate(), 0, 0, 0, 0);
                    const dayEnd = new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate(), 23, 59, 59, 999);
                    query.dueDate = { $gte: dayStart, $lte: dayEnd };
                }
            }
        }


        const tasks = await Task.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
        });
    }
};



export const getTaskById = async (req: Request, res: Response) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.json({
            success: true,
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
        });
    }
};


export const createTask = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        //Create Task
        const { title, description, status, priority, dueDate } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            user: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task',
        });
    }
};


// Update Task
export const updateTask = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        let task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const { title, description, status, priority, dueDate } = req.body;

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;

        await task.save();

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task',
        });
    }
};
// Delete Task

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
        });
    }
};