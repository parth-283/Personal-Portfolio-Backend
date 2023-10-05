const { Education } = require("../Models/EducationModel")
const { User } = require("../Models/UserModel")


const addEducation = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })
        const education = await Education.find({ qualification: req.body.qualification })

        if (user.length == 0) {
            console.log(user);
            res.status(204).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }

        if (education.length > 0) {
            res.status(409).send({ Data: education, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        req.body.present == true ? req.body.enddate = null : req.body.enddate, req.body.present = false

        const newEducation = new Education(req.body)

        const Response = await newEducation.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { educations: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const getEducation = async (req, res) => {
    console.log("Start getEducation.")
    try {
        const education = await Education.find()

        if (education.length > 0) {
            res.status(200).send({ Data: education, isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Education not found...!', isSuccess: false, isError: true })
        }

    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const updateEducation = async (req, res) => {
    try {
        req.body.present == true ? req.body.enddate = null : req.body.enddate, req.body.present = false

        const UpdatedData = await Education.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (UpdatedData) {
            res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Education not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteEducation = async (req, res) => {
    try {
        const Response = await Education.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { educations: req.params.id } }
        );

        if (Response.deletedCount > 0) {
            res.status(200).send({ Message: 'Education is deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Education not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

module.exports = {
    addEducation,
    getEducation,
    updateEducation,
    deleteEducation
}