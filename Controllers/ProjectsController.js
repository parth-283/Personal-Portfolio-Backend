const { Projects } = require("../Models/ProjectsModel")
const { User } = require("../Models/UserModel")

const getProjects = async (req, res) => {
    try {
        const Project = await Projects.find()

        if (Project.length > 0) {
            res.status(200).send({ Data: Project, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Project not found...!', isSuccess: false, isError: true })
        }

    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const specificProjects = async (req, res) => {
    try {
        const Project = await Projects.find({ _id: req.params.id })

        if (Project.length > 0) {
            res.status(200).send({ Data: Project, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Project not found...!', isSuccess: false, isError: true })
        }

    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const addProjects = async (req, res) => {
    try {
        const user = await User.find({ _id: req.body.userID })
        const Project = await Projects.find({ title: req.body.title })

        if (user.length == 0) {
            console.log(user);
            res.status(204 ).send({ isSuccess: false, isError: true, Message: 'User not found...!' })
            return
        }

        if (Project.length > 0) {
            res.status(409).send({ Data: Project, isSuccess: false, isError: true, Message: 'Data is already exist.' })
            return
        }

        const newProject = new Projects(req.body)

        const Response = await newProject.save()

        await User.findByIdAndUpdate(
            req.body.userID,
            { $addToSet: { projects: Response._id } },
            { new: true }
        );

        res.status(201).send({ Data: Response, isSuccess: true, isError: false })
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const updateProjects = async (req, res) => {
    try {
        const { technologies, ...otherData } = req.body;

        let updateData = otherData;
        if (technologies) {
            updateData = {
                ...otherData,
                $addToSet: { technologies: technologies }
            };
        }

        const UpdatedData = await Projects.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (UpdatedData) {
            res.status(200).send({ Data: UpdatedData, isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Project not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteProjects = async (req, res) => {
    try {
        const Response = await Projects.deleteOne({ _id: req.params.id })

        await User.updateOne(
            { _id: req.body.userID },
            { $pull: { educations: req.params.id } }
        );

        if (Response.deletedCount > 0) {
            res.status(200).send({ Message: 'Project is Deleted.', isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Project not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

const deleteTechnologies = async (req, res) => {
    try {
        const Response = await Projects.findByIdAndUpdate(
            req.params.id,
            { $pull: { technologies: { $eq: req.params.value } } }
        );

        if (Response) {
            res.status(200).send({ Message: 'Technologie is remove.', isSuccess: true, isError: false })
        } else {
            res.status(204 ).send({ Message: 'Technologie not found...!', isSuccess: false, isError: true })
        }
    } catch (error) {
        res.status(500).send({ Message: 'Internal server error...!', Error: error, isSuccess: false, isError: true })
    }
}

module.exports = {
    getProjects,
    addProjects,
    specificProjects,
    updateProjects,
    deleteProjects,
    deleteTechnologies
}