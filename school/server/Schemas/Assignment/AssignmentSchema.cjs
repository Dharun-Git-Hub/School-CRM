const mongoose = require('mongoose')

const AssignmentSchema = new mongoose.Schema({
    title: String,
    description: String,
    teacher: String,
    grade: String,
    subject: String,
    section: String,
    attachments: Buffer,
    date: String,
    total: String,
    submissions: [{
        student: String,
        roll: String,
        attachment: Buffer,
        submitted: Boolean,
        marks: Number,
        feedback: String,
    }],
})

module.exports = mongoose.model('Assignment',AssignmentSchema)