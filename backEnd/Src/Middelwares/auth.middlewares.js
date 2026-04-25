import { verifyTokin } from "../Utlis/token.utlis.js"
import * as dbService from "../DB/dbService.js"
import UserModel from "../DB/model/user.model.js"

export const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return next(new Error("No token provided", { cause: 401 }))
        }

        const decoded = verifyTokin({ token: authorization })
        if (!decoded?._id) {
            return next(new Error("Invalid token", { cause: 401 }))
        }

        const user = await dbService.findById({ model: UserModel, id: decoded._id })
        if (!user) {
            return next(new Error("User not found", { cause: 401 }))
        }

        req.user = user
        return next()
    } catch (err) {
        return next(new Error("Invalid or expired token", { cause: 401 }))
    }
}

export const authorization = ({ role = [] }) => {
    return async (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(new Error("Unauthorized", { cause: 403 }))
        }
        return next()
    }
}