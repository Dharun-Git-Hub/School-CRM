const mongoose = require('mongoose')

const TimeTableSchema = new mongoose.Schema({
    gradeID: {type: String, required: true},
    sectionID: {type: String, required: true},
    academicYear: {type: String, required: true},
    timeslots:
        {
            day: {type: String, required: true, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday"]},
            period: {type: String, required: true},
            startTime: {type: String, required: true, enum: ["9.30AM","10.30AM","11.30AM","12.30PM","2.15PM","3.15PM"] },
            endTime: {type: String, required: true, enum: ["10:30AM","11.30AM","12.30PM","1.30PM","3.15PM","4.15PM"] },
            subject: {type: String, required: true},
            teacher: {type: String, required: true}
        },
    createdAt: {type: Date, required: true},
})

module.exports = mongoose.model('Timetable',TimeTableSchema)