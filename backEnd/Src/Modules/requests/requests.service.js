import successResponse from "../../Utlis/successRespone.utlis.js"
import * as dbService from "../../DB/dbService.js"
import salaryRequestModel from "../../DB/model/salaryRequest.model.js"
import leaveRequestModel from "../../DB/model/leaveRequest.model.js"
import UserModel from "../../DB/model/user.model.js"

// ─── Employee: fetch their own leave + salary requests ───────────────────────

export const getMyRequests = async (req, res, next) => {
    const { id } = req.params

    const [leaveRequests, salaryRequests] = await Promise.all([
        leaveRequestModel.find({ employeeId: id }).sort({ createdAt: -1 }),
        salaryRequestModel.find({ employeeId: id }).sort({ createdAt: -1 }),
    ])

    // Tag each entry with its type so the frontend can render them uniformly
    const combined = [
        ...leaveRequests.map((r) => ({ ...r.toObject(), requestType: "leave" })),
        ...salaryRequests.map((r) => ({ ...r.toObject(), requestType: "salary" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return successResponse({
        res,
        statusCode: 200,
        message: "Requests retrieved successfully",
        data: combined,
    })
}

// ─── Employee ─────────────────────────────────────────────────────────────────

export const salaryRequest = async (req, res, next) => {
    const { employeeId, allowanceType, requestedAmount, status } = req.body

    const salaryReq = await dbService.create({
        model: salaryRequestModel,
        data: [{ employeeId, allowanceType, requestedAmount, status }]
    })

    return successResponse({ res, statusCode: 201, message: "Salary request created successfully", data: salaryReq })
}

// ─── HR ───────────────────────────────────────────────────────────────────────

export const updateSalaryRequest = async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body

    const salaryReq = await salaryRequestModel.findOneAndUpdate(
        { employeeId: id },
        { $set: { status } },
        { new: true }
    )
    if (!salaryReq) {
        return next(new Error("Salary request not found", { cause: 404 }))
    }

    if (status === "approved") {
        const user = await dbService.findOne({ model: UserModel, filter: { _id: id } })

        const allowanceUpdates = {
            housingAllowance: () => {
                const housingAllowance = user.housingAllowance + salaryReq.requestedAmount
                return { housingAllowance, totalSalary: user.totalSalary + housingAllowance }
            },
            transportationAllowance: () => {
                const transportationAllowance = user.transportationAllowance + salaryReq.requestedAmount
                return { transportationAllowance, totalSalary: user.totalSalary + transportationAllowance }
            },
            otherAllowance: () => {
                const otherAllowance = user.otherAllowance + salaryReq.requestedAmount
                return { otherAllowance, totalSalary: user.totalSalary + otherAllowance }
            }
        }

        const updateFn = allowanceUpdates[salaryReq.allowanceType]
        if (updateFn) {
            const updates = updateFn()
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id },
                { $set: updates },
                { new: true }
            )
            return successResponse({
                res,
                statusCode: 200,
                message: "Salary request approved and user updated successfully",
                data: { salaryReq, user: updatedUser }
            })
        }
    }

    return successResponse({ res, statusCode: 200, message: "Salary request updated successfully", data: salaryReq })
}
