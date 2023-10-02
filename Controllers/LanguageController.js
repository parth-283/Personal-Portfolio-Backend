const { Language } = require("../Models/LanguageModel")
const { User } = require("../Models/UserModel")

const addLanguage = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })
        const Languages = await Language.find({ language: req.body.language })

        if (user.length == 0) {
            res.status(204 ).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }

        if (Languages.length > 0) {
            res.status(409).send({ Data: Languages, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        const newProject = new Language(req.body)

        const Response = await newProject.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { languages: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const getLanguage = async (req, res) => {
    try {
        const Languages = await Language.find()

        if (Languages.length > 0) {
            res.status(200).send({ Data: Languages, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Language not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const updateLanguage = async (req, res) => {
    try {
        const UpdatedData = await Language.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (UpdatedData) {
            res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Language not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteLanguage = async (req, res) => {
    try {
        const Response = await Language.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { languages: req.params.id } }
        );

        if (Response.deletedCount > 0) {
            res.status(200).send({ Message: 'Language is deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Language not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

module.exports = {
    addLanguage,
    getLanguage,
    updateLanguage,
    deleteLanguage
}