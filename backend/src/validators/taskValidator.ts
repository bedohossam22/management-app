import { body } from 'express-validator';

// Base validation rules (reusable)
const titleRule = body('title')
  .optional()
  .trim()
  .notEmpty()
  .withMessage('Title cannot be empty')
  .isLength({ max: 100 })
  .withMessage('Title cannot exceed 100 characters');

const descriptionRule = body('description')
  .optional()
  .trim()
  .isLength({ max: 500 })
  .withMessage('Description cannot exceed 500 characters');

const statusRule = body('status')
  .optional()
  .isIn(['To Do', 'In Progress', 'Done'])
  .withMessage('Status must be: To Do, In Progress, or Done');

const priorityRule = body('priority')
  .optional()
  .isIn(['Low', 'Medium', 'High'])
  .withMessage('Priority must be: Low, Medium, or High');

const dueDateRule = body('dueDate')
  .optional()
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
  });

// For CREATE – title and dueDate are required
export const createTaskValidation = [
  titleRule.notEmpty().withMessage('Title is required'),
  descriptionRule,
  statusRule,
  priorityRule,
  dueDateRule.notEmpty().withMessage('Due date is required'),
];

// For UPDATE – all fields optional
export const updateTaskValidation = [
  titleRule,
  descriptionRule,
  statusRule,
  priorityRule,
  dueDateRule,
];