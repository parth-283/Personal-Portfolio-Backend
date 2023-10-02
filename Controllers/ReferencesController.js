const { Reference } = require("../Models/ReferenceModel")
const { User } = require("../Models/UserModel")

const addReference = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })
        const References = await Reference.find({ name: req.body.name })

        if (user.length == 0) {
            res.status(204 ).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }

        if (References.length > 0) {
            res.status(409).send({ Data: References, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        const newProject = new Reference(req.body)

        const Response = await newProject.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { references: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}
const getReference = async (req, res) => {
    try {
        const References = await Reference.find()

        if (References.length > 0) {
            res.status(200).send({ Data: References, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Reference not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}
const updateReference = async (req, res) => {
    try {
        const UpdatedData = await Reference.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (UpdatedData) {
            res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Reference not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}
const deleteReference = async (req, res) => {
    try {
        const Response = await Reference.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { references: req.params.id } }
        );

        if (Response.deletedCount > 0) {
            res.status(200).send({ Message: 'Reference is deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Reference not found...!', isSuccess: false, isError: true })
        }

    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

module.exports = {
    addReference,
    getReference,
    updateReference,
    deleteReference
}