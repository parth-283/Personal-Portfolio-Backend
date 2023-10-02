const { Skill } = require("../Models/SkillModel")
const { User } = require("../Models/UserModel")


const addSkill = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })

        if (user.length == 0) {
            res.status(204).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }
        const skill = await Skill.find()


        if (skill.length > 0) {
            res.status(409).send({ Data: skill, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        const newSkill = new Skill(req.body)

        const Response = await newSkill.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { skills: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const getSkill = async (req, res) => {
    try {
        const skill = await Skill.find()

        if (skill.length > 0) {
            res.status(200).send({ Data: skill, isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Skill not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const updateSkill = async (req, res) => {
    try {
        const UpdatedData = await Skill.findByIdAndUpdate(req.params.id,
            {
                $addToSet: {
                    technicalSkills: { $each: req.body.technicalSkills },
                    softSkills: { $each: req.body.softSkills }
                }
            },
            { upsert: true, new: true });

        if (UpdatedData) {
            res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Skill not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteSkill = async (req, res) => {
    try {
        const Response = await Skill.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { skills: req.params.id } }
        );

        if (Response.deletedCount > 0) {
            res.status(200).send({ Message: 'Skill has Deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Skill not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteOneSkill = async (req, res) => {
    try {
        const deleteOneSkill = await Skill.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    technicalSkills: req.params.skill,
                    softSkills: req.params.skill
                }
            },
            { new: true }
        );

        if (deleteOneSkill) {
            res.status(200).send({ Message: 'Skill has Deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204).send({ Message: 'Skill not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

module.exports = {
    addSkill,
    getSkill,
    updateSkill,
    deleteSkill,
    deleteOneSkill
}