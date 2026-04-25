import joi from "joi"

// employeeId allowanceType requestedAmount status
export const createSalaryRequestValidation = joi.object({
    employeeId: joi.string().required(),
    allowanceType: joi.string()
        .valid("basicSalary", "housingAllowance", "transportationAllowance", "otherAllowance")
        .required(),
    requestedAmount: joi.number().min(0).required(),
    status: joi.string().valid("pending", "approved", "rejected").default("pending"),
})
