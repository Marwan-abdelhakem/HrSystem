import successResponse from "../../Utlis/successRespone.utlis.js"
import * as dbService from "../../DB/dbService.js"
import TaskModel from "../../DB/model/tasks.model.js"
import streamifier from "streamifier"
import cloudinary from "../../config/cloudinary.js"

// ─── Cloudinary Helper ────────────────────────────────────────────────────────

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "tasks" },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }
        )
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

// ─── Create Task (Admin + Employee) ──────────────────────────────────────────
// creatorId is injected from req.user._id so the client cannot spoof it.

export const createTasks = async (req, res, next) => {
    const { title, description, assignBy, assignTo, startDate, endDate, status, notes } = req.body

    let fileUrl = null
    if (req.file) {
        fileUrl = await uploadToCloudinary(req.file.buffer)
    }

    const task = await dbService.create({
        model: TaskModel,
        data: [{
            title,
            description,
            creatorId: req.user._id,          // always from authenticated user
            assignBy: assignBy || req.user.user_name || "",
            assignTo,
            startDate,
            endDate,
            files: fileUrl,
            status: status || "available",
            notes: notes || "",
        }]
    })

    return successResponse({ res, statusCode: 201, message: "Task created successfully", data: task })
}

// ─── Admin only ───────────────────────────────────────────────────────────────

export const updateTasksByAdmin = async (req, res, next) => {
    const { id } = req.params
    const task = await TaskModel.findOneAndUpdate({ _id: id }, { $set: { ...req.body } }, { new: true })
    if (!task) {
        return next(new Error("Task not found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Task updated successfully", data: task })
}

export const deleteTasks = async (req, res, next) => {
    const { id } = req.params
    const task = await TaskModel.findOneAndDelete({ _id: id })
    if (!task) {
        return next(new Error("Task not found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Task deleted successfully" })
}

// ─── HR / Admin: get ALL tasks with employee name enrichment ─────────────────

export const getAllTasks = async (req, res, next) => {
    const tasks = await TaskModel.find().sort({ createdAt: -1 })
    return successResponse({ res, statusCode: 200, message: "All tasks retrieved successfully", data: tasks })
}

// ─── Employee: tasks assigned TO them ────────────────────────────────────────

export const getTasks = async (req, res, next) => {
    const { id } = req.params
    const tasks = await TaskModel.find({ assignTo: id }).sort({ createdAt: -1 })
    // Return empty array instead of 404 — frontend handles the empty state
    return successResponse({ res, statusCode: 200, message: "Tasks retrieved successfully", data: tasks })
}

// ─── Employee: tasks CREATED BY them ─────────────────────────────────────────

export const getCreatedTasks = async (req, res, next) => {
    const { id } = req.params
    const tasks = await TaskModel.find({ creatorId: id }).sort({ createdAt: -1 })
    return successResponse({ res, statusCode: 200, message: "Created tasks retrieved successfully", data: tasks })
}

// ─── Employee: update their own task status + notes ──────────────────────────

export const updateTasksByEmp = async (req, res, next) => {
    const { id } = req.params
    const { status, notes } = req.body

    // Ensure the employee can only update tasks assigned to them
    const task = await TaskModel.findOne({ _id: id, assignTo: req.user._id.toString() })
    if (!task) {
        return next(new Error("Task not found or not assigned to you", { cause: 404 }))
    }

    const updated = await TaskModel.findOneAndUpdate(
        { _id: id },
        { $set: { status, notes } },
        { new: true }
    )
    return successResponse({ res, statusCode: 200, message: "Task updated successfully", data: updated })
}

// ─── Employee: delete a task they created ────────────────────────────────────

export const deleteCreatedTask = async (req, res, next) => {
    const { id } = req.params

    const task = await TaskModel.findOne({ _id: id, creatorId: req.user._id })
    if (!task) {
        return next(new Error("Task not found or you are not the creator", { cause: 404 }))
    }

    await TaskModel.findOneAndDelete({ _id: id })
    return successResponse({ res, statusCode: 200, message: "Task deleted successfully" })
}
