import mongoose, { Schema } from "mongoose"

const leaveRequestSchema = new Schema(
    {
        employeeId: {
            type: String,
            required: true,
        },
        leaveType: {
            type: String,
            enum: ["annual", "sick", "unpaid", "other"],
            required: true,
        },
        totalDays: {
            type: Number,
            required: true
        },

        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true
    }
)

const leaveRequestModel = mongoose.models.leavesRequest || mongoose.model("leavesRequest", leaveRequestSchema)

export default leaveRequestModel