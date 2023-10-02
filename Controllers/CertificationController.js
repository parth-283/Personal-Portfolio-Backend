const { Certification } = require("../Models/CertificationModel")
const { User } = require("../Models/UserModel");

const addCertificate = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })
        const Certificate = await Certification.find({ name: req.body.name })

        if (user.length == 0) {
            res.status(204).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }

        if (Certificate.length > 0) {
            res.status(409).send({ Data: Certificate, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        const newProject = new Certification(req.body)

        const Response = await newProject.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { certificate: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const getCertificate = async (req, res) => {
    try {
        const Certificate = await Certification.find()

        if (Certificate.length > 0) {
            res.status(200).send({ Data: Certificate, isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Certificate not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const updateCertificate = async (req, res) => {
    try {
        const UpdatedData = await Certification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (UpdatedData) {
            res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Certificate not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteCertificate = async (req, res) => {
    try {
        const Certificate = await Certification.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { certificate: req.params.id } }
        );

        if (Certificate.deletedCount > 0) {
            res.status(200).send({ Message: 'Certificate is deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Certificate not found...!', isSuccess: false, isError: true })
        }

    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

module.exports = {
    addCertificate,
    getCertificate,
    updateCertificate,
    deleteCertificate
}