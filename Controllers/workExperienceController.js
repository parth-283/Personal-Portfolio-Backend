const { WorkExperience } = require("../Models/workExperienceModel")
const { User } = require("../Models/UserModel")


const addworkExperience = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })
        const workExperience = await WorkExperience.find({ companyname: req.body.companyname })

        if (user.length == 0) {
            res.status(204 ).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }

        if (workExperience.length > 0) {
            res.status(409).send({ Data: workExperience, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        req.body.present == true ? req.body.enddate = null : req.body.enddate, req.body.present = false

        const newWorkExperience = new WorkExperience(req.body)

        const Response = await newWorkExperience.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { workExperiences: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const getworkExperience = async (req, res) => {
    try {
        const workExperience = await WorkExperience.find()

        if (workExperience.length > 0) {
            res.status(200).send({ Data: workExperience, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Work Experience not found...!', isSuccess: false, isError: true })
        }

    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true  })
    }
}

const updateWorkExperience = async (req, res) => {
    try {
    req.body.present == true ? req.body.enddate = null : req.body.enddate, req.body.present = false
    const { responsibilitie, ...otherData } = req.body;

    let updateData = otherData;
    if (responsibilitie) {
        updateData = {
            ...otherData,
            $addToSet: { responsibilitie: responsibilitie }
        };
    }

    const UpdatedData = await WorkExperience.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    );
    if (UpdatedData) {
        res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
    } else {
        res.status(204 ).send({ Message: 'Work Experience not found...!', isSuccess: false, isError: true })
    }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteworkExperience = async (req, res) => {
    try {
        const Response = await WorkExperience.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { workExperiences: req.params.id } }
        );

        if (Response.deletedCount > 0) {
            res.status(200).send({ Message: 'Work Experience is Deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Work Experience not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true  })
    }
}

module.exports = {
    addworkExperience,
    getworkExperience,
    updateWorkExperience,
    deleteworkExperience
}