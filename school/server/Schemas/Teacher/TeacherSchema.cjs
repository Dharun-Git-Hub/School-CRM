const mongoose = require('mongoose')

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    role: String,
    grade: String,
    section: String,
    subject: String,
    code: String,
    password: String,
})

module.exports = mongoose.model('TeacherModel',TeacherSchema)