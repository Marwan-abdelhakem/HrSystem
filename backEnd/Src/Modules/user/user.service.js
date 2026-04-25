import successResponse from "../../Utlis/successRespone.utlis.js"
import UserModel from "../../DB/model/user.model.js"
import * as dbService from "../../DB/dbService.js"
import { hashPassword } from "../../Utlis/hash.utlis.js"
import LeaveModel from "../../DB/model/leave.model.js"

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = async (req, res, next) => {
    return successResponse({ res, statusCode: 200, message: "Profile retrieved successfully", data: { user: req.user } })
}

// ─── Admin: User Management ───────────────────────────────────────────────────

export const getAllUsers = async (req, res, next) => {
    const users = await UserModel.find()
    if (users.length === 0) {
        return next(new Error("No users found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "Users retrieved successfully", data: { users } })
}

// Returns only Employee-role users — accessible to Admin and HR
export const getEmployees = async (req, res, next) => {
    const employees = await UserModel.find({ role: "Employee" }).select("_id user_name email phone role")
    return successResponse({ res, statusCode: 200, message: "Employees retrieved successfully", data: { employees } })
}

// Returns Employee + HR users — for Admin task assignment dropdown
export const getAssignableUsers = async (req, res, next) => {
    const users = await UserModel.find({ role: { $in: ["Employee", "HR"] } })
        .select("_id user_name email role")
        .sort({ role: 1, user_name: 1 })
    return successResponse({ res, statusCode: 200, message: "Assignable users retrieved successfully", data: { users } })
}

export const createUser = async (req, res, next) => {
    const { role, user_name, email, password, phone, basicSalary, housingAllowance, transportationAllowance, otherAllowance } = req.body

    const existingUser = await dbService.findOne({ model: UserModel, filter: { email } })
    if (existingUser) {
        return next(new Error("Email already exists", { cause: 409 }))
    }

    const hashedPassword = await hashPassword({ plainText: password })

    const totalSalary =
        (Number(basicSalary) || 0) +
        (Number(housingAllowance) || 0) +
        (Number(transportationAllowance) || 0) +
        (Number(otherAllowance) || 0)

    const [newUser] = await dbService.create({
        model: UserModel,
        data: [{ role, user_name, email, password: hashedPassword, phone, basicSalary, housingAllowance, transportationAllowance, otherAllowance, totalSalary }]
    })

    // Automatically provision an annual leave balance for the new employee
    const leaveBalance = await dbService.create({
        model: LeaveModel,
        data: [{ totalDays: 20, leaveType: "annual", employeeID: newUser._id }]
    })

    return successResponse({ res, statusCode: 201, message: "User created successfully", data: { user: newUser, leaveBalance } })
}

export const updateUser = async (req, res, next) => {
    const { id } = req.params
    const user = await UserModel.findOneAndUpdate({ _id: id }, { $set: { ...req.body } }, { new: true })
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "User updated successfully", data: user })
}

export const deleteUser = async (req, res, next) => {
    const { id } = req.params
    const user = await UserModel.findOneAndDelete({ _id: id })
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    return successResponse({ res, statusCode: 200, message: "User deleted successfully" })
}
