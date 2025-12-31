import Joi from "joi";

// Schema for creating a todo
export const todoCreationSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title must not exceed 30 characters',
      'any.required': 'Title is required'
    }),
  completed: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Completed must be true or false'
    }),
});

// Schema for updating a todo
export const updateTodoSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .optional()
    .messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title must not exceed 30 characters',
    }),

  completed: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Completed must be true or false'
    }),

}).min(1); // ensures at least one field is provided for update
