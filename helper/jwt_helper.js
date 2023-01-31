const createHttpError = require("http-errors")
const jwt = require("jsonwebtoken")

module.exports={
    signInAccessToken : async(userId)=>{
        try{
            const payload = {id : userId}
            const secret = process.env.ACCESS_TOKEN_KEY || "12345678"
            const options = {
                expiresIn : "1h",
                issuer : "yourdomain@domain.com"
            }
    
            const token = await jwt.sign(payload, secret, options)
            return {token};
        }catch(err){
            console.error(err);
            return {err}
        }
    },
    verifyAccessToken: async (req,res, next)=>{
        try{
            if(!req.headers.authorization)
                return next(createHttpError.Unauthorized())

            const authHeader = req.headers.authorization
            const bearerToken = authHeader.split(" ")
            const token = bearerToken[1]

            if(token == null) return next(createHttpError.Unauthorized())

            // It will throw error if token is not valid(i.e. miss match).
            await jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

            next()
        }
        catch(err){
            if(err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError)
                next(createHttpError.Unauthorized(err.message))
            else
                next(err)
        }
    }
}