import { Router } from "express"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"
import { validation } from "../../Middelwares/validation.middelwares.js"
import { fileUpload } from "../../Utlis/multer.utlis.js"
import { createJobValidation, applyForJobValidation } from "./job.validation.js"
import * as jobService from "./job.service.js"

const router = Router()

const adminHR = ["Admin", "HR"]

// ─── Admin / HR ───────────────────────────────────────────────────────────────

router.post(
    "/createJob",
    authentication,
    authorization({ role: adminHR }),
    validation(createJobValidation),
    jobService.createJob
)

router.delete(
    "/deleteJobs/:id",
    authentication,
    authorization({ role: adminHR }),
    jobService.deleteJobs
)

router.patch(
    "/updateJob/:id",
    authentication,
    authorization({ role: adminHR }),
    jobService.updateJobs
)

// ─── Public ───────────────────────────────────────────────────────────────────

router.get("/getAlljobs", jobService.getAlljobs)

router.get("/getJobById/:id", jobService.getJobById)

router.post(
    "/applayForJob",
    fileUpload().single("cv"),
    validation(applyForJobValidation),
    jobService.applayForJob
)

export default router
