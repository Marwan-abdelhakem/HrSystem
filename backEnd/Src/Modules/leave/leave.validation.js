import joi from "joi"

// employeeId leaveType totalDays startDate endDate reason status
export const createLeaveRequestValidation = joi.object({
    employeeId: joi.string().required(),
    leaveType: joi.string().valid("annual", "sick", "unpaid", "other").required(),
    totalDays: joi.number().min(1).required(),
    startDate: joi.date().required(),
    endDate: joi.date()
        .greater(joi.ref("startDate"))
        .required()
        .messages({
            "date.greater": "End date must be after the start date",
        }),
    reason: joi.string().optional(),
    status: joi.string().valid("pending", "approved", "rejected").default("pending"),
})
