const globalErrorHandler = (err, req, res, next) => {
    // Mongoose validation error → 400 with field-level messages
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({ message: "Validation failed", errors: messages })
    }

    // Mongoose duplicate key (e.g. unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0] ?? "field"
        return res.status(409).json({ message: `${field} already exists` })
    }

    const statusCode = err.cause || 500
    return res.status(statusCode).json({ message: err.message || "Something went wrong" })
}

export default globalErrorHandler
