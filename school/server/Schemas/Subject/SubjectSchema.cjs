const mongoose = require('mongoose')

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    grade: [String],
})

module.exports = mongoose.model('Subject',SubjectSchema)