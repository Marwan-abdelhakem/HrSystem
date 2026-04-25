import joi from "joi"

// role title subTitle describtion day startTime endTime typeOfMeeting zoomLink creatorId addUsers files
export const createMeetingValidation = joi.object({
    role: joi.string().valid("User", "Admin", "Employee"),
    title: joi.string().required().messages({
        "any.required": "Title is required"
    }),
    subTitle: joi.string().required(),
    describtion: joi.string().required(),
    day: joi.date().required(),
    startTime: joi.date().required(),
    endTime: joi.date().required(),
    typeOfMeeting: joi.string().valid("online", "offline"),
    zoomLink: joi.string().uri()
        .when("typeOfMeeting", {
            is: "online",
            then: joi.required(),
            otherwise: joi.forbidden()
        }),
    creatorId: joi.string().required(),
    addUsers: joi.array().items(joi.string()),
    files: joi.any().optional()
})
