import successResponse from "../../Utlis/successRespone.utlis.js"
import * as dbService from "../../DB/dbService.js"
import leaveRequestModel from "../../DB/model/leaveRequest.model.js"
import LeaveModel from "../../DB/model/leave.model.js"
import UserModel from "../../DB/model/user.model.js"

// ─── Helper: attach employee name to each request ─────────────────────────────

const attachEmployeeNames = async (requests) => {
    if (!requests.length) return requests

    // Collect unique IDs and fetch all matching users in one query
    const ids = [...new Set(requests.map((r) => r.employeeId))]
    const users = await UserModel.find({ _id: { $in: ids } }).select("_id user_name email")

    const userMap = {}
    users.forEach((u) => { userMap[u._id.toString()] = u })

    return requests.map((r) => {
        const plain = r.toObject ? r.toObject() : { ...r }
        const emp = userMap[plain.employeeId]
        return {
            ...plain,
            employeeName: emp?.user_name ?? "Unknown",
            employeeEmail: emp?.email ?? "",
        }
    })
}

// ─── Employee ─────────────────────────────────────────────────────────────────

export const LeaveRequest = async (req, res, next) => {
    const { employeeId, leaveType, totalDays, startDate, endDate, reason, status } = req.body

    const leaveRequest = await dbService.create({
        model: leaveRequestModel,
        data: [{ employeeId, leaveType, totalDays, startDate, endDate, reason, status }]
    })

    return successResponse({ res, statusCode: 201, message: "Leave request created successfully", data: leaveRequest })
}

// ─── HR ───────────────────────────────────────────────────────────────────────

export const getAllRequest = async (req, res, next) => {
    const requests = await leaveRequestModel.find().sort({ createdAt: -1 })
    if (requests.length === 0) {
        return next(new Error("No leave requests found", { cause: 404 }))
    }
    const enriched = await attachEmployeeNames(requests)
    return successResponse({ res, statusCode: 200, message: "Leave requests retrieved successfully", data: enriched })
}

export const getRequestById = async (req, res, next) => {
    const { id } = req.params
    const requests = await leaveRequestModel.find({ employeeId: id })
    if (requests.length === 0) {
        return next(new Error("No leave requests found for this employee", { cause: 404 }))
    }
    const enriched = await attachEmployeeNames(requests)
    return successResponse({ res, statusCode: 200, message: "Leave requests retrieved successfully", data: enriched })
}

export const updateRequest = async (req, res, next) => {
    const { id } = req.params
    const { status, totalDays } = req.body

    const request = await leaveRequestModel.findOneAndUpdate(
        { employeeId: id },
        { $set: { status } },
        { new: true }
    )
    if (!request) {
        return next(new Error("Leave request not found", { cause: 404 }))
    }

    const leave = await LeaveModel.findOneAndUpdate(
        { employeeID: id },
        { $set: { totalDays } },
        { new: true }
    )

    return successResponse({ res, statusCode: 200, message: "Leave request updated successfully", data: { request, leave } })
}
