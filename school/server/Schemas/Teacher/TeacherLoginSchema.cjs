const mongoose = require('mongoose')

const TeacherLoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
})

module.exports = mongoose.model('Teacher',TeacherLoginSchema)