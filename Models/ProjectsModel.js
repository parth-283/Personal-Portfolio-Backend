const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    technologies: {
        type: Array,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    githubRepo: {
        type: String,
        required: true
    },
    demoLink: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

exports.Projects = new mongoose.model('Projects', ProjectSchema)