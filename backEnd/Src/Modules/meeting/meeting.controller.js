import { Router } from "express"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"
import { validation } from "../../Middelwares/validation.middelwares.js"
import { fileUpload } from "../../Utlis/multer.utlis.js"
import { createMeetingValidation } from "./meeting.validation.js"
import * as meetingService from "./meeting.service.js"

const router = Router()

const allRoles = ["Employee", "HR", "Admin"]

//  Create 

router.post(
    "/creatMeeting",
    authentication,
    authorization({ role: allRoles }),
    fileUpload().single("files"),
    validation(createMeetingValidation),
    meetingService.creatMeeting
)

//Admin 

router.get(
    "/getAllMeeting",
    authentication,
    authorization({ role: ["Admin"] }),
    meetingService.getAllMeeting
)

//By Creator / Participant 

router.get(
    "/getAllMeetings/:id",
    authentication,
    authorization({ role: allRoles }),
    meetingService.getAllMeetings
)

router.get(
    "/getMeetingIn/:id",
    authentication,
    authorization({ role: allRoles }),
    meetingService.getMeetingIn
)

router.patch(
    "/updateMeeting/:id",
    authentication,
    authorization({ role: allRoles }),
    meetingService.updateMeeting
)

router.delete(
    "/deleteMeeting/:id",
    authentication,
    authorization({ role: allRoles }),
    meetingService.deleteMeeting
)

export default router
