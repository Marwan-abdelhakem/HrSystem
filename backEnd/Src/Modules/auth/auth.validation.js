import joi from "joi"



export const signUpValidation = joi.object({
    role: joi.string().valid("HR", "Admin", "Employee").default("Employee"),
    user_name: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string()
        .min(6)
        .required()
        .messages({
            "string.min": "Password must be at least 6 characters",
            "string.empty": "Password is required"
        }),
    phone: joi.string().required(),
}).required()