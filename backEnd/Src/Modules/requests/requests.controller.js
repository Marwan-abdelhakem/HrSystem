import { Router } from "express"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"
import * as requestsService from "./requests.service.js"

const router = Router()

// ─── Employee: view their own request history (leave + salary combined) ───────

router.get(
    "/myRequests/:id",
    authentication,
    authorization({ role: ["Employee"] }),
    requestsService.getMyRequests
)

// ─── Employee: submit a salary request ───────────────────────────────────────

router.post(
    "/salaryRequest",
    authentication,
    authorization({ role: ["Employee", "HR"] }),
    requestsService.salaryRequest
)

// ─── HR: approve / reject a salary request ───────────────────────────────────

router.patch(
    "/updateSalaryRequest/:id",
    authentication,
    authorization({ role: ["HR"] }),
    requestsService.updateSalaryRequest
)

export default router
