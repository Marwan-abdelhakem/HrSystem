import { Router } from "express"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"
import * as userService from "./user.service.js"

const router = Router()

// ─── Profile ──────────────────────────────────────────────────────────────────

router.get(
    "/getProfile",
    authentication,
    authorization({ role: ["Admin"] }),
    userService.getProfile
)

// ─── Admin: User Management ───────────────────────────────────────────────────

router.get(
    "/getAllUsers",
    authentication,
    authorization({ role: ["Admin"] }),
    userService.getAllUsers
)

// ─── Admin + HR: Employee list for dropdowns ──────────────────────────────────

router.get(
    "/getEmployees",
    authentication,
    authorization({ role: ["Admin", "HR"] }),
    userService.getEmployees
)

// ─── Admin: Employee + HR list for task assignment ────────────────────────────

router.get(
    "/getAssignableUsers",
    authentication,
    authorization({ role: ["Admin"] }),
    userService.getAssignableUsers
)

router.post(
    "/createUser",
    authentication,
    authorization({ role: ["Admin"] }),
    userService.createUser
)

router.patch(
    "/updateUser/:id",
    authentication,
    authorization({ role: ["Admin"] }),
    userService.updateUser
)

router.delete(
    "/deleteUser/:id",
    authentication,
    authorization({ role: ["Admin"] }),
    userService.deleteUser
)

export default router
