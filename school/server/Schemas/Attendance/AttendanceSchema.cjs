const mongoose = require('mongoose')

const AttendanceSchema = new mongoose.Schema({
    section: { type: String, required: true },
    grade: { type: String, required: true },
    year: { type: String, required: true },
    month: { type: String, required: true },
    day: { type: String, required: true },
    students: [String],
})

module.exports = mongoose.model('Attendance',AttendanceSchema)