const mongoose = require('mongoose')

const CertificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timeseries: true,
})

exports.Certification = new mongoose.model('Certifications', CertificationSchema)