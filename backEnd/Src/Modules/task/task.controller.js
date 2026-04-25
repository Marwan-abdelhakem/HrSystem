import { Router } from "express"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"
import { validation } from "../../Middelwares/validation.middelwares.js"
import { fileUpload } from "../../Utlis/multer.utlis.js"
import { createTaskValidation } from "./task.validation.js"
import * as taskService from "./task.service.js"

const router = Router()

// ─── Create Task — Admin, HR, or Employee ────────────────────────────────────
// creatorId is always injected from req.user in the service

router.post(
    "/createTasks",
    authentication,
    authorization({ role: ["Admin", "HR", "Employee"] }),
    fileUpload().single("files"),
    validation(createTaskValidation),
    taskService.createTasks
)

// ─── HR + Admin: fetch all tasks ─────────────────────────────────────────────

router.get(
    "/getAllTasks",
    authentication,
    authorization({ role: ["Admin", "HR"] }),
    taskService.getAllTasks
)

// ─── Admin only ───────────────────────────────────────────────────────────────

router.patch(
    "/updateTasksByAdmin/:id",
    authentication,
    authorization({ role: ["Admin"] }),
    taskService.updateTasksByAdmin
)

router.delete(
    "/deleteTasks/:id",
    authentication,
    authorization({ role: ["Admin"] }),
    taskService.deleteTasks
)

// ─── Employee: tasks assigned to them ────────────────────────────────────────

router.get(
    "/getTasks/:id",
    authentication,
    authorization({ role: ["Employee"] }),
    taskService.getTasks
)

// ─── Employee: tasks created by them ─────────────────────────────────────────

router.get(
    "/getCreatedTasks/:id",
    authentication,
    authorization({ role: ["Employee"] }),
    taskService.getCreatedTasks
)

// ─── Employee: update status of a task assigned to them ──────────────────────

router.patch(
    "/updateTasksByEmp/:id",
    authentication,
    authorization({ role: ["Employee"] }),
    taskService.updateTasksByEmp
)

// ─── Employee: delete a task they created ────────────────────────────────────

router.delete(
    "/deleteCreatedTask/:id",
    authentication,
    authorization({ role: ["Employee"] }),
    taskService.deleteCreatedTask
)

export default router
