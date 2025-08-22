class CustomError extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode=statusCode
        if(Error.captureStackTrace){
            Error.captureStackTrace(this,CustomError)
        }
    }
}

module.exports=CustomError