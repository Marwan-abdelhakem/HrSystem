import mongoose, { Schema } from "mongoose"

const newEmployeeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            uniqe: true
        },
        phone: {
            type: String,
            required: true,
        },
        age: {
            type: String,
            required: true,
            trim: true,
        },
        gender: {
            type: String,
            enum: ["male", "female"]
        },
        qualification: {
            type: String,
            required: true,
        },
        experince: {
            type: String,
            required: true,
        },
        profileCloudDoc: { publicId: String, secure_url: String },
        cv: {
            type: [String],
            required: true,
            default: [],
        },
        status: {
            type: String,
            enum: [
                "new",
                "screened",
                "interview",
                "offered",
                "hired",
                "rejected"
            ],
            default: "new"
        },
        job_id: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const newEmployeeModel = mongoose.models.newEmployee || mongoose.model("newEmployee", newEmployeeSchema)
export default newEmployeeModel