import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema(
    {
        role: {
            type: String,
            enum: ["HR", "Admin", "Employee"]
        },

        user_name: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "Name must be at least 3 characters long"],
            maxlength: [50, "Name must be at most 20 characters long"],
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            uniqe: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
        },
        basicSalary: {
            type: Number,
            required: false,
            default: 0,
            min: 0
        },

        housingAllowance: {
            type: Number,
            default: 0,
            min: 0
        },

        transportationAllowance: {
            type: Number,
            default: 0,
            min: 0
        },

        otherAllowance: {
            type: Number,
            default: 0,
            min: 0
        },

        totalSalary: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

const UserModel = mongoose.models.users || mongoose.model("users", UserSchema)

export default UserModel