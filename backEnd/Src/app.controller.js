import connectDb from "./DB/connectDB.js"
import globalErrorHandler from "./Utlis/errorHandler.utlis.js"
import authRouter from "./Modules/auth/auth.controller.js"
import userRouter from "./Modules/user/user.controller.js"
import jobRouter from "./Modules/job/job.controller.js"
import leaveRouter from "./Modules/leave/leave.controller.js"
import meetingRouter from "./Modules/meeting/meeting.controller.js"
import taskRouter from "./Modules/task/task.controller.js"
import requestsRouter from "./Modules/requests/requests.controller.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"



const bootStrap = async (app, express) => {

    app.use(cors({
        origin: 'https://hr-system-aarc.vercel.app' || "http://localhost:5173",
        credentials: true,
    }))

    app.use(express.json())
    await connectDb()

    app.use("/uploads", express.static(path.resolve("./uploads")))

    app.use("/api/auth", authRouter)
    app.use("/api/users", userRouter)
    app.use("/api/job", jobRouter)
    app.use("/api/leave", leaveRouter)
    app.use("/api/meeting", meetingRouter)
    app.use("/api/task", taskRouter)
    app.use("/api/requests", requestsRouter)

    app.use(cookieParser())

    app.all("/*dummy", (req, res, next) => {
        return next(new Error("Route not found", { cause: 404 }))
    })

    app.use(globalErrorHandler)
}

export default bootStrap
