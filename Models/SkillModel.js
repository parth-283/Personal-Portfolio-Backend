const mongoose = require('mongoose')

const SkillSchema = new mongoose.Schema({
    technicalSkills: {
        type: Array,
        required: true,
        unique: true
    },
    softSkills: {
        type: Array,
        required: true,
        unique: true
    }
}, {
    timestamps: true
})

exports.Skill = new mongoose.model('Skills', SkillSchema)