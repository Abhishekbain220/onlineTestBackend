let jwt = require("jsonwebtoken")
let User = require("../model/userSchema")

exports.authenticateUser = async (req, res, next) => {
    try {
        let token = req.cookies.token
        if (!token) return res.status(401).json({ message: "Unauthorised token" })
        let decoded = jwt.verify(token, process.env.KEY)
        let user = await User.findById(decoded.id)
        if (!user) return res.status(401).json({ message: "Unauthorised" })
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}