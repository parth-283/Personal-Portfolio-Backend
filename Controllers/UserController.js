const { User } = require("../Models/UserModel")
const bcrypt = require('bcrypt')
const Randomstring = require('randomstring')
const sendEmail = require("../Util/EmailService")
const cloudinary = require("../Config/CloudinaryConfig")
const hbs = require('handlebars');
const fs = require('fs');

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
    // try {
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
        const renderedHTML = await new Promise((resolve, reject) => {
            res.render('resume', { layout: 'index', user: userDataPlain }, (err, html) => {
                console.log(err, html, "err, html");
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
        console.log(renderedHTML);
        // res.status(200).render('resume', { layout: 'index', user: userDataPlain });
    } else {
        res.status(204).send({ Message: 'User not found...!', isSuccess: false, isError: true })
    }


    // // const user = await User.findOne({ email: req.body.email });
    // await sendEmail(
    //     req.body.email,
    //     "Resume",
    //     `<html lang="en">

    //     <head>
    //         <meta charset="utf-8" />
    //         <meta name="viewport" content="width=device-width, initial-scale=1" />
    //         <title>Parth Kathiriya</title>
    //         <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
    //             integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" />
    //         <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
    //             integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous">
    //         </script>
    //         <link href="/css/globle.css" rel="stylesheet" />
    //     </head>

    //     <body>
    //         <nav class="navbar navbar-expand-lg bg-body-tertiary">
    //             <div class="container-fluid">
    //                 <a class="navbar-brand" href="/">Handlebars</a>
    //                 <button
    //               class="navbar-toggler"
    //               type="button"
    //               data-bs-toggle="collapse"
    //               data-bs-target="#navbarSupportedContent"
    //               aria-controls="navbarSupportedContent"
    //               aria-expanded="false"
    //               aria-label="Toggle navigation"
    //             >
    //               <span class="navbar-toggler-icon"></span>
    //             </button>
    //                 <div class="collapse navbar-collapse" id="navbarSupportedContent">
    //                     <ul class="navbar-nav me-auto mb-2 mb-lg-0">
    //                         <li class="nav-item">
    //                             <a class="nav-link active" aria-current="page" href="/">Home</a>
    //                         </li>
    //                         <li class="nav-item">
    //                             <a class="nav-link" href="/resume">Resume</a>
    //                         </li>
    //                     </ul>
    //                     <form class="d-flex" role="search">
    //                         <input
    //                   class="form-control me-2"
    //                   type="search"
    //                   placeholder="Search"
    //                   aria-label="Search"
    //                 />
    //                         <button
    //                   class="btn btn-outline-success"
    //                   type="submit"
    //                 >Search</button>
    //                     </form>
    //                 </div>
    //             </div>
    //         </nav>
    //         <div class="resume-background container my-5">

    //             <div class="text-center">
    //                 <div class="row row-cols-2">
    //                     <div class="col-4 col-left">
    //                         <section class="">
    //                             <div class="profile">
    //                                 <img src="https://res.cloudinary.com/personalportfolio/image/upload/v1687164770/klb8tooryqks3wsfm01n.png" alt="Profile Image" />
    //               </div>
    //                                 <header>
    //                                     <div class="contact">
    //                                         <h2>Contact</h2>
    //                                         <div>
    //                                             <p>parth@sourcenettechnology.in</p>
    //                                             <p>9157764985</p>
    //                                             <p>surat</p>
    //                                         </div>
    //                                     </div>
    //                                 </header>
    //                                 <div class="languages">
    //                                     <h2>Languages</h2>
    //                                     <ul>
    //                                         <li>English (Competent)</li>
    //                                     </ul>
    //                                 </div>
    //                                 <div class="references">
    //                                     <h2>References</h2>
    //                                     <ul>
    //                                         <li>Mayur Sorathiya - CEO</li>
    //                                     </ul>
    //                                 </div>
    //                                 <div class="certificates">
    //                                     <h2>Certificates</h2>
    //                                     <ul>
    //                                         <li>Git - Provide a brief description or overview of the certification, highlighting
    //                                             its significance or relevance.</li>
    //                                     </ul>
    //                                 </div>

    //                         </section>
    //                     </div>

    //                     <div class="col-8">
    //                         <div class="row row-cols-1">
    //                             <div class="col col-top py-5">
    //                                 <div class="profile-name">
    //                                     <h1>Parth Kathiriya</h1>
    //                                 </div>
    //                                 <div class="position">
    //                                     <h3>React.JS Developer</h3>
    //                                 </div>
    //                             </div>

    //                             <div class="col col-bottom">
    //                                 <section class="">
    //                                     <div class="objective">
    //                                         <h2>Objective</h2>
    //                                         <label>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&#x27;s standard dummy text ever since the 1500s, when an unknown printer took ssentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently m Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&#x27;s standard dummy.</label>
    //                                     </div>
    //                                 </section>

    //                                 <section class="skills">
    //                                     <div class="technical-skills">
    //                                         <h2>Technical Skills</h2>
    //                                         <ul>
    //                                             <li>⇨ <b>ProgrammingLanguages</b>: JAVA,JavaScript</li>
    //                                             <li>⇨ <b>DatabaseManagement</b>: SQL,MongoDB</li>
    //                                             <li>⇨ <b>WebDevelopment</b>: HTML,CSS,React</li>
    //                                         </ul>
    //                                     </div>
    //                                     <div class="soft-skills">
    //                                         <h2>Soft Skills</h2>
    //                                         <ul>
    //                                             <li>⇨ <b>CommunicationSkills</b>: Verbal communication</li>
    //                                             <li>⇨ <b>CollaborationAndTeamwork</b>: Team building,Cooperation,Relationship
    //                                                 building,Conflict management</li>
    //                                             <li>⇨ <b>TimeManagementAndOrganization</b>: Prioritization,Planning,Meeting
    //                                                 deadlines,Multitasking,Organization skills</li>
    //                                         </ul>
    //                                     </div>
    //                                 </section>

    //                                 <section class="education">
    //                                     <h2>Education</h2>
    //                                     <ul>
    //                                         <li>
    //                                             <h3>BCA</h3>
    //                                             <p>Dollyben Desai institute of computer alied and sciences</p>
    //                                             <p>03/2020 - 09/2020</p>
    //                                         </li>
    //                                         <li>
    //                                             <h3>MCA</h3>
    //                                             <p>Bhagvan mahavire</p>
    //                                             <p>03/2021 - 09/2021</p>
    //                                         </li>
    //                                     </ul>
    //                                 </section>

    //                                 <section class="work-experience">
    //                                     <h2>Work Experience</h2>
    //                                     <ul>
    //                                         <li>
    //                                             <h3>React.js Developer</h3>
    //                                             <p>Source.net Technology</p>
    //                                             <p>03/2021 - 06/2023</p>
    //                                             <p>React front end developer with 10 years of experience building websites and
    //                                                 web application using react.js and modern JavaScript tools/fremeworks. Key
    //                                                 achivement, collaborated with 350+ product teams and backend developers to
    //                                                 execute new features and create API endpoint&#x27;s request/response
    //                                                 payloads.</p>
    //                                             <ul>
    //                                                 <li>Built responsive websites for 40+ customers using semantic HTML5,
    //                                                     Javascript, ReactJS, and CSS compiled using maven and webpack build
    //                                                     tools.</li>
    //                                                 <li>Created JAVA OSGI bundles for cache invalidation, REST APIs, and web
    //                                                     form response handling in the first 30 days of employment.</li>
    //                                             </ul>
    //                                         </li>
    //                                     </ul>
    //                                 </section>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>

    //         </div>
    //         <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
    //             integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous">
    //         </script>
    //     </body>

    //     </html>`
    // )

    res.status(200).send({ message: "Please check your inbox, We sent your CV.", isSuccess: true, isError: false });

    // const template = hbs.compile(fs.readFileSync('../views/resume.hbs', 'utf-8'));

    // const html = template(user.User[0]);

    // console.log(html, "HTML");

    // res.status(200).send({ message: "Please check your inbox, We sent a reset password link.", isSuccess: true, isError: false });

    // } catch (error) {
    //     res.status(500).send({ message: "Server Error", Error: error, isSuccess: false, isError: true  });
    // }
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
    shareResume
}