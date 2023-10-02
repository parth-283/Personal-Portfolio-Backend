const bcrypt = require('bcrypt')


exports.bcryptPassword = async (req, res, next) => {
    try {

        const saltedRounds = 10

        const hasedPassword = await bcrypt.hash(req.body.password, saltedRounds)

        req.body.password = hasedPassword;
        next();

    } catch (error) {
        res.status(500).send({ message: "Server error!", Error: error, isSuccess: false, isError: true })
    }
}