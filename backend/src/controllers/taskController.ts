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
            const startoftoday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endofday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
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
        const { title, description, status, priority, dueDate, subtasks } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            subtasks: Array.isArray(subtasks) ? subtasks : [],
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

        const { title, description, status, priority, dueDate, subtasks } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (Array.isArray(subtasks)) {
            task.subtasks = subtasks;
        }

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

// Toggle Subtask Completion
export const toggleSubtask = async (req: Request, res: Response) => {
    try {
        const { id, subtaskId } = req.params;
        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const subtask = (task.subtasks as any).id(subtaskId) || task.subtasks.find((s: any) => s._id?.toString() === subtaskId);
        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found',
            });
        }

        subtask.isCompleted = !subtask.isCompleted;
        await task.save();

        res.json({
            success: true,
            message: 'Subtask toggled successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Toggle subtask error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling subtask',
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

// Add Note to Task
export const addNote = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Note content is required',
            });
        }

        if (content.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Note cannot exceed 1000 characters',
            });
        }

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

        task.notes.push({ content: content.trim() } as any);
        await task.save();

        res.status(201).json({
            success: true,
            message: 'Note added successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Add note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note',
        });
    }
};

// Delete Note from Task
export const deleteNote = async (req: Request, res: Response) => {
    try {
        const { id, noteId } = req.params;
        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const noteIndex = task.notes.findIndex(
            (n: any) => n._id?.toString() === noteId
        );

        if (noteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }

        task.notes.splice(noteIndex, 1);
        await task.save();

        res.json({
            success: true,
            message: 'Note deleted successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting note',
        });
    }
};

// Add Comment to Task
export const addComment = async (req: Request, res: Response) => {
    try {
        const { text, content } = req.body;
        const commentText = (typeof text === 'string' ? text : typeof content === 'string' ? content : '').trim();

        if (!commentText) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required',
            });
        }

        if (commentText.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot exceed 1000 characters',
            });
        }

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

        if (!task.comments) {
            task.comments = [] as any;
        }

        const newComment = {
            text: commentText,
            user: req.user._id,
            userName: req.user.name || req.user.email?.split('@')[0] || 'User',
        };

        task.comments.push(newComment as any);
        await task.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
        });
    }
};

// Delete Comment from Task
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id, commentId } = req.params;
        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const commentIndex = (task.comments || []).findIndex(
            (c: any) => c._id?.toString() === commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }

        task.comments.splice(commentIndex, 1);
        await task.save();

        res.json({
            success: true,
            message: 'Comment deleted successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
        });
    }
};

// Toggle Reaction on Comment
export const toggleCommentReaction = async (req: Request, res: Response) => {
    try {
        const { id, commentId } = req.params;
        const { emoji } = req.body;

        if (!emoji || typeof emoji !== 'string' || !emoji.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reaction emoji is required',
            });
        }

        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const comment = (task.comments || []).find(
            (c: any) => c._id?.toString() === commentId
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }

        if (!comment.reactions) {
            comment.reactions = [] as any;
        }

        const reactions: any[] = comment.reactions as any[];
        const targetEmoji = emoji.trim();
        const userIdStr = req.user._id.toString();
        const existingIndex = reactions.findIndex(
            (r: any) => r.emoji === targetEmoji && r.userId?.toString() === userIdStr
        );

        if (existingIndex > -1) {
            // Already reacted with this emoji -> toggle off
            reactions.splice(existingIndex, 1);
        } else {
            // Add reaction
            reactions.push({
                emoji: targetEmoji,
                userId: req.user._id,
                userName: req.user.name || req.user.email?.split('@')[0] || 'User',
            });
        }

        await task.save();

        res.json({
            success: true,
            message: 'Reaction updated successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task or comment not found',
            });
        }
        console.error('Toggle comment reaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating reaction',
        });
    }
};


// Toggle Reaction on Task / Post
export const toggleTaskReaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;

        if (!emoji || typeof emoji !== 'string' || !emoji.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reaction emoji is required',
            });
        }

        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        if (!task.reactions) {
            task.reactions = [];
        }

        const targetEmoji = emoji.trim();
        const userIdStr = req.user._id.toString();
        const existingIndex = task.reactions.findIndex(
            (r: any) => r.emoji === targetEmoji && r.userId?.toString() === userIdStr
        );

        if (existingIndex > -1) {
            // Already reacted with this emoji -> toggle off
            task.reactions.splice(existingIndex, 1);
        } else {
            // Add reaction
            task.reactions.push({
                emoji: targetEmoji,
                userId: req.user._id,
                userName: req.user.name || req.user.email?.split('@')[0] || 'User',
            });
        }

        task.markModified('reactions');
        await task.save();

        res.json({
            success: true,
            message: 'Task reaction updated successfully',
            data: task,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.error('Toggle task reaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task reaction',
        });
    }
};
