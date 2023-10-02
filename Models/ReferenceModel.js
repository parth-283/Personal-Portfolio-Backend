const mongoose = require('mongoose')

const ReferenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

exports.Reference = new mongoose.model('References', ReferenceSchema)