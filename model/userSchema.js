let mongoose=require("mongoose")
let bcrypt=require("bcrypt")
let jwt=require("jsonwebtoken")

let userSchema=mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        select:false
    },
    payment:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

userSchema.methods.generateAuthToken=function(){
    let token=jwt.sign({id:this._id},process.env.KEY,{
        expiresIn:"5h"
    })
    return token
}

userSchema.statics.authenticate=async function(email,password){
    let user=await this.findOne({email}).select("+password")
    if(!user) {
        throw new Error("Invalid email or password")
    }
    let isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("invalid email or password ")
    }
    return user
}

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10)
    }
    next()
})

module.exports=mongoose.model("user",userSchema)