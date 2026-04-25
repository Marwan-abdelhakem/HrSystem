// User module validation schemas.
// Task, Meeting, Job, and Leave validations have been moved to their respective modules:
//   - Src/Modules/task/task.validation.js
//   - Src/Modules/meeting/meeting.validation.js
//   - Src/Modules/job/job.validation.js
//   - Src/Modules/leave/leave.validation.js (if needed)

import joi from "joi"

export const createUserValidation = joi.object({
    role: joi.string().valid("Admin", "HR", "Employee").required(),
    user_name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    phone: joi.string().required(),
    basicSalary: joi.number().min(0).required(),
    housingAllowance: joi.number().min(0).default(0),
    transportationAllowance: joi.number().min(0).default(0),
    otherAllowance: joi.number().min(0).default(0),
})
