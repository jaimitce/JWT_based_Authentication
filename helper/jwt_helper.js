const createHttpError = require("http-errors")
const jwt = require("jsonwebtoken")
const {redisClient} = require("../database/redisdb")

module.exports={
    signInAccessToken : async(userId)=>{
        try{
            const payload = {id : userId}
            const secret = process.env.ACCESS_TOKEN_KEY || "12345678"
            const options = {
                expiresIn : "1h",
                issuer : "yourdomain@domain.com"
            }
    
            const accessToken = await jwt.sign(payload, secret, options)
            return {accessToken};
        }catch(err){
            console.error(err);
            return {accessError : err}
        }
    },
    signInRefreshToken : async (userId)=>{
        try{
            const payload = {id : userId}
            const secret = process.env.REFRESH_TOKEN_KEY || "12345678"
            const options = {
                expiresIn : "1y",
                issuer : "yourdomain@domain.com"
            }

            const refreshToken = await jwt.sign(payload, secret, options)
            await redisClient.set(String(userId), refreshToken);
            await redisClient.expire(String(userId), 365 * 24 *60 * 60) 

            return {refreshToken};
        }catch(err){
            return {refreshError: err};
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
    },
    verifyRefreshToken: async ( refreshToken )=>{
        try{
            // It will throw error if token is not valid(i.e. miss match).
            const payload = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY)
            const foundUserId = payload.id     
            //Get the token from redis for this client. If token doesn't match then
            //throw error.
            const result = await redisClient.get(foundUserId)
            if(result===refreshToken)
                return {userId : foundUserId}
            
            throw createHttpError.Unauthorized();    
            
        }catch(err){
            return {error: err}
        }
    }
}