const jwt = require('jsonwebtoken');
const auth = async (req, res, next) => {
    try {
        console.log("Cookies : ", req.cookies)
        if (req.cookies.token) {
            const decoded = await jwt.verify(req.cookies.token, "my_login_secret");

            if (decoded) {
                req.body = decoded
                next()
            } else {
                res.send({ message: "Invalind Token" })
            }
        } else {
            res.send({ message: "Token not found!!" })
        }
    } catch (error) {
        res.send({ message: "Could not verify the Access token!!" })
    }
}

module.exports = auth;