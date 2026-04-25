import mongoose, { Schema } from "mongoose"

const MeetingSchema = new Schema(
    {
        role: {
            type: String,
            enum: ["HR", "Admin", "Employee"]
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },
        subTitle: {
            type: String,
            trim: true,
        },
        describtion: {
            type: String,
            required: true
        },
        day: {
            type: Date,
            required: true,
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        typeOfMeeting: {
            type: String,
            enum: ["online", "offline"],
            required: true
        },
        zoomLink: {
            type: String,
            required: function () {
                return this.typeOfMeeting === "online";
            }
        },
        creatorId: {
            type: String,
            required: true
        },
        addUsers: [
            {
                type: String,
                required: true
            }
        ],
        files: {
            type: [String],
            default: [],
        }
    },
    {
        timestamps: true
    }
)

const MeetingModel = mongoose.models.meetings || mongoose.model("meetings", MeetingSchema)
export default MeetingModel