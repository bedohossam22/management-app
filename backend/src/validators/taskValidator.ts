import { body } from 'express-validator';

// Validation for creating/updating a task
export const taskValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('status')
        .optional()
        .isIn(['To Do', 'In Progress', 'Done'])
        .withMessage('Status must be: To Do, In Progress, or Done'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be: Low, Medium, or High'),

    body('dueDate')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),
];