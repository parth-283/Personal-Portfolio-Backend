const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: [true, "email already exists in database!"],
        lowercase: true,
        trim: true,
        required: [true, "email field is not provided. Cannot create user without email "],
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
        }
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}/.test(v);
            },
            message: '{VALUE} is not a valid 10 digit number!'
        }
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function (value) {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                return passwordRegex.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        },
    },
    objective: {
        type: String,
        required: true,
    },
    image: {
        URL: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        }
    },
    userType: {
        type: String,
        default: "user",
        enum: ["user", "visitor", "admin"]
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projects',
        required: true
    }],
    languages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Languages',
        required: true
    }],
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skills',
        required: true
    }],
    references: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'References',
        required: true
    }],
    certificate: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certifications',
        required: true
    }],
    educations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Educations',
        required: true
    }],
    workExperiences: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkExperience',
        required: true
    }],
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiry: {
        type: Date,
        default: null,
    },
    tokens: [
        {
            token: {
                type: String,
                require: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            valid: {
                type: Boolean,
                default: true,
            }
        },
    ]
}, {
    timestamps: true
})

UserSchema.methods.generateSigningToken = async function () {
    try {
        const validToken = this.tokens.find((token) => token.valid === true);

        if (validToken) {
            return validToken.token;
        } else {
            const token = jwt.sign({ _id: this._id, role: this.userType }, process.env.SECRET_KEY, {
                expiresIn: '24h',
            });
            this.tokens.push({ token: token, valid: true, });
            await this.save();
            return token;
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true });
    }
};

exports.User = new mongoose.model('User', UserSchema);