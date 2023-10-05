const jwt = require("jsonwebtoken");

exports.Authentication = (roles) => {
    return (req, res, next) => {
        try {
            if (roles?.includes("visitor")) {
                return next()
            }
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            const verified = jwt.verify(token, process.env.SECRET_KEY);

            if (verified && roles?.includes(verified.role)) {
                return next()
            } else {
                res.status(401).send({ message: 'Unauthorized User, Please Login.', Loading: false })
            }

        } catch (error) {
            res.status(500).send({ message: "Server error!", Error: error, isSuccess: false, isError: true })
        }
    }
}
