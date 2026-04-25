import { Router } from "express"
import * as authService from "./auth.service.js"
import { validation } from "../../Middelwares/validation.middelwares.js"
import { signUpValidation } from "./auth.validation.js"
import { authentication, authorization } from "../../Middelwares/auth.middlewares.js"

const router = Router()

router.post("/signUp", validation(signUpValidation), authService.signUP)

router.post("/login", authService.login)

router.post("/logout", authentication, authService.logout)
//@

export default router