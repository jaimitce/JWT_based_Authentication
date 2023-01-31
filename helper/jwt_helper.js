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
    }
}