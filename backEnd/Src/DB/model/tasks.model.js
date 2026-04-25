import mongoose, { Schema } from "mongoose"

const TaskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        // creatorId — the user who created this task (Employee or Admin)
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
        },
        // assignBy — display label of who assigned it (kept for compatibility)
        assignBy: {
            type: String,
            default: "",
        },
        // assignTo — the employee this task is assigned to (stored as string ID)
        assignTo: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
        },
        files: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ["available", "unavailable"],
            default: "available",
            required: true,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
)

const TaskModel = mongoose.models.tasks || mongoose.model("tasks", TaskSchema)
export default TaskModel
