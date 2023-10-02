const mongoose = require('mongoose')

const EducationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: true,
    },
    startdate: {
        type: Date,
        validate: {
            validator: function (value) {
                const startdate = new Date(value);
                const now = new Date();
                return startdate <= now;
            },
            message: 'Start date must be in the past',
        },
        required: [true, 'Start date is required'],
    },
    enddate: {
        type: Date,
        validate: [
            {
                validator: function (value) {
                    const enddate = new Date(value);
                    const startdate = new Date(this.startdate);
                    return enddate > startdate;
                },
                message: 'End date must be greater than start date',
                when: function () {
                    return !this.isPresent;
                },
            },
            {
                validator: function (value) {
                    const enddate = new Date(value);
                    const now = new Date();
                    return enddate <= now;
                },
                message: 'End date must be in the past',
                when: function () {
                    return !this.isPresent;
                },
            },
        ],
        required: [
            function () {
                return !this.isPresent;
            },
            'End date is required',
        ],
    },
    present: {
        type: Boolean,
    },
    qualification: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

exports.Education = new mongoose.model('Educations', EducationSchema)