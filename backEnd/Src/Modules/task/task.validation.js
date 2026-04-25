import joi from "joi"

// Shared fields used by both Admin and Employee task creation
export const createTaskValidation = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    assignBy: joi.string().optional().allow(""),
    assignTo: joi.string().required(),
    creatorId: joi.string().optional().allow(""),
    startDate: joi.date().required(),
    endDate: joi.date()
        .greater(joi.ref("startDate"))
        .required()
        .messages({
            "date.greater": "End date must be after the start date",
        }),
    files: joi.any().optional(),
    status: joi.string().valid("available", "unavailable").default("available"),
    notes: joi.string().optional().allow(""),
})
