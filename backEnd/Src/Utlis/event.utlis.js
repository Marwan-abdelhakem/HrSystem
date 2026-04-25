import { EventEmitter } from "node:events"
import { emailSubject, sendEmail } from "./sendEmail.utlis.js"


export const emailEvent = new EventEmitter()

emailEvent.on("confirmEmail", async (data) => {
    await sendEmail({
        to: data.to,
        html: "<h1>Hello<h1>",
        subject: emailSubject.welcome
    })
})