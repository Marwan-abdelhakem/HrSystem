import mongoose, { Schema } from "mongoose"

const salaryRequestSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    allowanceType: {
        type: String,
        enum: ["basicSalary", "housingAllowance", "transportationAllowance", "otherAllowance"],
        required: true
    },
    requestedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
});


const salaryRequestModel = mongoose.models.salaryRequest || mongoose.model("salaryRequest", salaryRequestSchema)

export default salaryRequestModel
