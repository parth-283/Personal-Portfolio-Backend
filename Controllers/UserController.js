const { User } = require("../Models/UserModel")
const bcrypt = require('bcrypt')
const Randomstring = require('randomstring')
const sendEmail = require("../Util/EmailService")
const cloudinary = require("../Config/CloudinaryConfig")
const hbs = require('handlebars');
const fs = require('fs');
const puppeteer = require('puppeteer');

const formater = (item) => {
    const { resetToken, resetTokenExpiry, tokens, password, __v, ...data } = item._doc
    return data
}

const Register = async (req, res) => {
    try {
        const user = await User.find({ name: req.body.name });
        if (user.length > 0) {
            res.status(409).send({ Data: user, isSuccess: false, isError: true, Message: 'User is already registered.' });
            return;
        }

        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath);

        const newUser = new User({ ...req.body, image: { URL: result.secure_url, public_id: result.public_id } });

        const Response = await newUser.save()

        res.status(201).send({ Data: formater(Response), isSuccess: true, isError: false });
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true });
    }
};

const Login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            res.status(204).send({ message: "User not found!", Loading: false });
            return;
        }

        const comparePassword = await bcrypt.compare(req.body.password, user.password);
        if (comparePassword) {

            const token = await user.generateSigningToken();

            if (token) {

                res.setHeader('Authorization', `Bearer ${token}`);

                res.status(200).send({ message: "User Login.", Loading: false, token });
            } else {
                res.status(500).send({ message: "Token generation failed.", Loading: false });
            }
        } else {
            res.status(401).json({ error: 'Unauthorized access, Please check your credentials.', Loading: false });
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true });
    }
}

const LogOut = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const validTokenIndex = user.tokens.length - 1;
        await User.findByIdAndUpdate(
            { _id: user._id },
            { $set: { [`tokens.${validTokenIndex}.valid`]: false } },
            { new: true }
        );

        res.removeHeader('Authorization');

        res.status(200).send({ message: "User Loged Out.", Loading: false });

    } catch (error) {
        res.status(500).send({ message: "Server error", Error: error, isSuccess: false, isError: true });
    }
}

const GetUserWithAllData = async (req, res) => {
    try {
        let user = await User.find().populate('projects').populate('educations').populate('workExperiences').populate('skills').populate('languages').populate('references').populate('certificate');

        let response = user.map((item) => {
            return formater(item)
        })

        if (user.length > 0) {
            res.status(200).send({ message: "User get successfully", Loading: false, total: user.length, User: response });
        } else {
            res.status(204).send({ Message: 'User not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error!", Error: error, isSuccess: false, isError: true });
    }
}

const specificUser = async (req, res) => {
    try {
        let user = await User.find({ _id: req.params.id }).populate('projects').populate('educations').populate('workExperiences').populate('skills').populate('languages').populate('references').populate('certificate');

        let response = user.map((item) => {
            return formater(item)
        })

        if (user.length > 0) {
            res.status(200).send({ message: "User get successfully", Loading: false, tasks: response });
        } else {
            res.status(204).send({ Message: 'User not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error!", Error: error, isSuccess: false, isError: true });
    }
}

const updateUser = async (req, res) => {
    try {

        if (req.body.public_id) {
            await cloudinary.uploader.destroy(req.body.public_id)

            const file = req.files.image;
            const result = await cloudinary.uploader.upload(file.tempFilePath);

            req.body = {
                ...req.body, image: { URL: result.secure_url, public_id: result.public_id }
            }
        }

        const UpdatedData = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('projects').populate('educations').populate('workExperiences').populate('skills').populate('languages').populate('references').populate('certificate');

        if (UpdatedData) {
            res.status(200).send({ Data: formater(UpdatedData), isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'User not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const ForgetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            res.status(204).send({ message: "User not found!, Please send valid email.", Loading: false });
            return;
        }

        let resetToken = Randomstring.generate();
        const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.resetToken = resetToken
        user.resetTokenExpiry = resetTokenExpiry;

        await user.save();

        await sendEmail(
            req.body.email,
            "Forget-Password",
            `<html>
            <body>
                <h1>Dear ${user.name},</h1>
                <p>We have received a request to reset your password. To proceed with the password reset, please click on the following link:<a href="http://localhost:5000/user/resetPassword?token=${resetToken}">Reset Password Link</a></p>
                <p>If clicking the link does not work, you can copy and paste the URL below into your web browser:</p>
                <p>http://localhost:5000/user/resetPassword?token=${resetToken}</p>
                <p>Please note that this link is valid for a limited time and will expire after 10 minute. If you did not request a password reset, you can safely ignore this message.</p>
                <p>If you have any further questions or need assistance, please contact our support team.</p>
                <p>Best regards,</p>
                <p>Admin</p>
            </body>
        </html>`
        )

        res.status(200).send({ message: "Please check your inbox, We sent a reset password link.", isSuccess: true, isError: false });


    } catch (error) {
        res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true });
    }
}

const ResetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ resetToken: req.query.token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            res.status(204).send({ message: "Token not found!, Please retry.", Loading: false });
            return;
        }

        const UpdatedData = await User.updateOne(
            { _id: user._id },
            { ...req.body, resetToken: null, resetTokenExpiry: null }
        );

        if (UpdatedData.modifiedCount > 0) {
            res.status(200).send({ message: "Your password has been successfully reset.", isSuccess: true, isError: false });
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true });
    }
}

const shareResume = async (req, res) => {
    try {
        let user = await User.find({ email: req.params.email })
            .populate('projects')
            .populate('educations')
            .populate('workExperiences')
            .populate('skills')
            .populate('languages')
            .populate('references')
            .populate('certificate');
        let userData = user[0]

        const userDataPlain = userData.toObject();
        if (user.length > 0) {
            const renderedHTML = await new Promise((resolve, reject) => {
                res.render('resume', { layout: 'index', user: userDataPlain }, (err, html) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(html);
                    }
                });
            });

            // For converting HTML to PDF.
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(renderedHTML);
            const pdfBuffer = await page.pdf({ format: 'A4' });
            await browser.close();

            // For sending email.
            await sendEmail(req.params.email, "Resume-preview", '', pdfBuffer)

            res.status(200).send({ message: "Please check your inbox, We sent your CV.", isSuccess: true, isError: false });
        } else {
            res.status(204).send({ Message: 'User not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true });
    }
}

const previewResume = async (req, res) => {
    try {
        let user = await User.find({ email: req.params.email })
            .populate('projects')
            .populate('educations')
            .populate('workExperiences')
            .populate('skills')
            .populate('languages')
            .populate('references')
            .populate('certificate');
        let userData = user[0]

        if (user.length > 0) {
            const userDataPlain = userData.toObject();
            res.status(200).render('resume', { layout: 'index', user: userDataPlain });
        } else {
            res.status(204).send({ Message: 'User not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true });
    }
}

module.exports = {
    Register,
    Login,
    LogOut,
    updateUser,
    specificUser,
    GetUserWithAllData,
    ForgetPassword,
    ResetPassword,
    shareResume,
    previewResume
}