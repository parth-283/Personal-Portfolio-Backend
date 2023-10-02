const mongoose = require('mongoose')

const LanguageSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
    },
    proficiency: {
        type: String,
        required: true,
        enum: ['Beginner', 'Competent', 'Proficient', 'Advanced', 'Expert']
    }
}, {
    timestamps: true
})

exports.Language = new mongoose.model('Languages', LanguageSchema)