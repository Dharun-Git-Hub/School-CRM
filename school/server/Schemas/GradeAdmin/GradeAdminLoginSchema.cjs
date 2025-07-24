const mongoose = require('mongoose')

const GradeAdminLoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    grade: { type: String, required: true },
})

module.exports = mongoose.model('GradeAdmin',GradeAdminLoginSchema)