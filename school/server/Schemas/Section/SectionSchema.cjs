const mongoose = require('mongoose')
const { StudentSchema } = require('../Student/StudentSchema.cjs')

const SectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    grade: String,
    students: [
        {name: { type: String, required: true },
        roll: String,
        admission_no: Number,
        dob: Date,
        gender: { type: String, enum: ["Male","Female"] },
        grade: String,
        section: String,
        academic_year: String,
        address: String,
        attendance: Number,}
    ],
})

module.exports = mongoose.model('Section',SectionSchema)