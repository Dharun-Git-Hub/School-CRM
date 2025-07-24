const mongoose = require('mongoose')

const GradeSchema = new mongoose.Schema({
    grade: { type: String, required: true, unique: true },
    description: String,
})

module.exports = mongoose.model('Grade',GradeSchema)