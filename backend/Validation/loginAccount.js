import Joi from 'joi';

export const loginAccountSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(250).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
})