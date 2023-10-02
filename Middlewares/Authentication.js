const jwt = require("jsonwebtoken");

exports.Authentication = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            next()
        } else {
            res.status(401).send({ message: 'Unauthorized User, Please Login.', Loading: false })
        }

    } catch (error) {
        res.status(500).send({ message: "Server error!", Error: error, isSuccess: false, isError: true })
    }
}