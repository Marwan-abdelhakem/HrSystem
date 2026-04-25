import successResponse from "../../Utlis/successRespone.utlis.js"
import * as dbService from "../../DB/dbService.js"
import JobModel from "../../DB/model/job.model.js"
import newEmployeeModel from "../../DB/model/newEmployee.model.js"
import UserModel from "../../DB/model/user.model.js"
import { emailEvent } from "../../Utlis/event.utlis.js"
import streamifier from "streamifier"
import cloudinary from "../../config/cloudinary.js"

// ─── Cloudinary Helper ────────────────────────────────────────────────────────

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "jobs" },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }
        )
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

// ─── Admin / HR ───────────────────────────────────────────────────────────────

export const createJob = async (req, res, next) => {
    const { creatorId, name, title, range_salary, experince, typeOfJobs, description, skills, qualification, gender, status } = req.body

    const creator = await dbService.findById({ model: UserModel, id: creatorId })
    if (!creator) {
        return next(new Error("User not found", { cause: 404 }))
    }

    const job = await dbService.create({
        model: JobModel,
        data: [{ creatorId, name, title, range_salary, experince, typeOfJobs, description, skills, qualification, gender, status }]
    })

    return successResponse({ res, statusCode: 201, message: "Job created successfully", data: job })
}

export const deleteJobs = async (req, res, next) => {
    const { id } = req.params
    const { creatorId } = req.body

    const job = await JobModel.findById(id)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }
    if (job.creatorId.toString() !== creatorId) {
        return next(new Error("You are not the owner of this job", { cause: 403 }))
    }

    await JobModel.findOneAndDelete({ _id: id })
    return successResponse({ res, statusCode: 200, message: "Job deleted successfully" })
}

export const updateJobs = async (req, res, next) => {
    const { id } = req.params
    const { creatorId } = req.body

    const job = await JobModel.findById(id)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }
    if (job.creatorId.toString() !== creatorId) {
        return next(new Error("You are not the owner of this job", { cause: 403 }))
    }

    const updated = await JobModel.findOneAndUpdate({ _id: id }, { $set: { ...req.body } }, { new: true })
    return successResponse({ res, statusCode: 200, message: "Job updated successfully", data: updated })
}

// ─── Public ───────────────────────────────────────────────────────────────────

export const getAlljobs = async (req, res, next) => {
    const jobs = await JobModel.find()
    if (jobs.length === 0) {
        return next(new Error("No jobs found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Jobs retrieved successfully", data: jobs })
}

export const getJobById = async (req, res, next) => {
    const { id } = req.params
    const job = await JobModel.findById(id)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Job retrieved successfully", data: job })
}

export const applayForJob = async (req, res, next) => {
    const { name, email, phone, age, gender, qualification, experince, status, job_id } = req.body

    const job = await dbService.findById({ model: JobModel, id: job_id })
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }

    let cvUrl = null
    if (req.file) {
        cvUrl = await uploadToCloudinary(req.file.buffer)
    }

    emailEvent.emit("confirmEmail", { to: email })

    const application = await dbService.create({
        model: newEmployeeModel,
        data: [{ name, email, phone, age, gender, qualification, experince, cv: cvUrl, status, job_id }]
    })

    return successResponse({ res, statusCode: 201, message: "Application submitted successfully", data: application })
}
