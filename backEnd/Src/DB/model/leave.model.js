import mongoose, { Schema } from "mongoose"

const leaveSchema = new Schema(
    {
        totalDays: {
            type: Number,
            required: true,
        },
        leaveType: {
            type: String,
            enum: ["annual", "sick", "unpaid", "other"],
            required: true,
        },
        employeeID: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const LeaveModel = mongoose.models.leaves || mongoose.model("leaves", leaveSchema)

export default LeaveModel