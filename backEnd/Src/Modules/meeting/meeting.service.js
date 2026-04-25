import successResponse from "../../Utlis/successRespone.utlis.js"
import * as dbService from "../../DB/dbService.js"
import MeetingModel from "../../DB/model/meeting.model.js"
import UserModel from "../../DB/model/user.model.js"
import streamifier from "streamifier"
import cloudinary from "../../config/cloudinary.js"

// ─── Cloudinary Helper ────────────────────────────────────────────────────────

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "meetings" },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }
        )
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

// ─── Create Meeting ───────────────────────────────────────────────────────────

export const creatMeeting = async (req, res, next) => {
    const { role, title, subTitle, describtion, day, startTime, endTime, typeOfMeeting, zoomLink, creatorId, addUsers } = req.body

    let file = null
    if (req.file) {
        file = await uploadToCloudinary(req.file.buffer)
    }

    const creator = await dbService.findById({ model: UserModel, id: creatorId })
    if (!creator) {
        return next(new Error("User not found", { cause: 404 }))
    }

    const user = await dbService.findById({ model: UserModel, id: addUsers })
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }

    // Admin can create meetings with anyone; others can only meet within their role
    if (creator.role !== "Admin" && creator.role !== user.role) {
        return next(new Error("Meeting not allowed between different roles", { cause: 403 }))
    }

    const meeting = await dbService.create({
        model: MeetingModel,
        data: [{ role, title, subTitle, describtion, day, startTime, endTime, typeOfMeeting, zoomLink, creatorId, addUsers, files: file }]
    })

    return successResponse({ res, statusCode: 201, message: "Meeting created successfully", data: meeting })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllMeeting = async (req, res, next) => {
    const meetings = await MeetingModel.find()
    if (meetings.length === 0) {
        return next(new Error("No meetings found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Meetings retrieved successfully", data: meetings })
}

// ─── By Creator ───────────────────────────────────────────────────────────────

export const getAllMeetings = async (req, res, next) => {
    const { id } = req.params
    const meetings = await MeetingModel.find({ creatorId: id })
    if (meetings.length === 0) {
        return next(new Error("No meetings found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Meetings retrieved successfully", data: meetings })
}

export const updateMeeting = async (req, res, next) => {
    const { id } = req.params
    const { creatorId } = req.body

    const meeting = await MeetingModel.findById(id)
    if (!meeting) {
        return next(new Error("Meeting not found", { cause: 404 }))
    }
    if (meeting.creatorId.toString() !== creatorId) {
        return next(new Error("You are not the owner of this meeting", { cause: 403 }))
    }

    const updated = await MeetingModel.findOneAndUpdate({ _id: id }, { $set: { ...req.body } }, { new: true })
    return successResponse({ res, statusCode: 200, message: "Meeting updated successfully", data: updated })
}

export const deleteMeeting = async (req, res, next) => {
    const { id } = req.params
    const { creatorId } = req.body

    const meeting = await MeetingModel.findById(id)
    if (!meeting) {
        return next(new Error("Meeting not found", { cause: 404 }))
    }
    if (meeting.creatorId.toString() !== creatorId) {
        return next(new Error("You are not the owner of this meeting", { cause: 403 }))
    }

    await MeetingModel.findOneAndDelete({ _id: id })
    return successResponse({ res, statusCode: 200, message: "Meeting deleted successfully" })
}

// ─── By Invited User ──────────────────────────────────────────────────────────

export const getMeetingIn = async (req, res, next) => {
    const { id } = req.params
    const meetings = await MeetingModel.find({ addUsers: id })
    if (meetings.length === 0) {
        return next(new Error("No meetings found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Meetings retrieved successfully", data: meetings })
}
