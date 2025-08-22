let mongoose=require("mongoose")
mongoose.connect(process.env.URI)
.then(()=>{
    console.log("Database Connection Established")
})
.catch((error)=>{
    console.log(error.message)
})