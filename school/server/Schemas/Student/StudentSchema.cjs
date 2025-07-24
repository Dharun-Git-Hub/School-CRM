const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: String,
    roll: String,
    admission_no: Number,
    dob: Date,
    gender: { type: String, enum: ["Male","Female"] },
    grade: String,
    section: String,
    academic_year: String,
    address: String,
    attendance: Number,
})

module.exports = mongoose.model('StudentModel',StudentSchema);