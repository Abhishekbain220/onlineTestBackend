let express=require("express")
const { authenticateUser } = require("../middleware/authMidllerware")
const { currentUser, signup, logout, login, updateUser } = require("../controller/userController")
let router=express.Router()

router.get("/currentUser",authenticateUser,currentUser)
router.post("/signup",signup)
router.post("/login",login)
router.get("/logout",authenticateUser,logout)
router.put("/updateUser",authenticateUser,updateUser)


module.exports=router