import mongoose, { Schema } from "mongoose"

const jobSchema = new Schema(
    {
        creatorId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        range_salary: {
            type: String,
            required: true,
        },
        experince: {
            type: String,
            required: true,
        },
        typeOfJobs: {
            type: String,
            enum: ["Part Time", "Full Time", "Remote"],
            default: "Full Time"
        },
        description: {
            type: String,
            required: true,
        },
        skills: {
            type: String,
            required: true,
        },
        qualification: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female"]
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

    },
    {
        timestamps: true
    }
)

const JobModel = mongoose.models.jobs || mongoose.model("jobs", jobSchema)
export default JobModel