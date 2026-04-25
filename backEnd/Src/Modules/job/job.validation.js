import joi from "joi"

// creatorId name title range_salary experince typeOfJobs description skills qualification gender status
export const createJobValidation = joi.object({
    creatorId: joi.string().required(),
    name: joi.string().required(),
    title: joi.string().required(),
    range_salary: joi.string().required(),
    experince: joi.string().required(),
    typeOfJobs: joi.string().valid("Part Time", "Full Time", "Remote").required(),
    description: joi.string().required(),
    skills: joi.string().required(),
    qualification: joi.string().required(),
    gender: joi.string().valid("male", "female").required(),
    status: joi.string().valid("pending", "approved", "rejected").required()
})

// name email phone age gender qualification experince cv status job_id
export const applyForJobValidation = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    phone: joi.string().required(),
    age: joi.string().required(),
    gender: joi.string().valid("male", "female"),
    qualification: joi.string().required(),
    experince: joi.string().required(),
    cv: joi.any().required(),
    status: joi.string().valid("new", "screened", "interview", "offered", "hired", "rejected").required(),
    job_id: joi.string().required()
})
