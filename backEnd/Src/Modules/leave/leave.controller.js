import { Router } from "express"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"
import * as leaveService from "./leave.service.js"

const router = Router()

// ─── Employee ─────────────────────────────────────────────────────────────────

router.post(
    "/LeaveRequest",
    authentication,
    authorization({ role: ["Employee"] }),
    leaveService.LeaveRequest
)

// ─── HR ───────────────────────────────────────────────────────────────────────

router.get(
    "/getAllRequest",
    authentication,
    authorization({ role: ["HR"] }),
    leaveService.getAllRequest
)

router.get(
    "/getRequestById/:id",
    authentication,
    authorization({ role: ["HR"] }),
    leaveService.getRequestById
)

router.patch(
    "/updateRequest/:id",
    authentication,
    authorization({ role: ["HR"] }),
    leaveService.updateRequest
)

export default router
