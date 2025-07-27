const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    who: { type: String, required: true },
    to: {type: [String], required: true },
    time: { type: String, required: true }
})

module.exports = mongoose.model('LogSchema',LogSchema)