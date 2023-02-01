const router = require("express").Router();
const User = require('../Models/User')
const createError = require('http-errors')
const {authSchema , loginSchema} = require("../helper/authSchemasValidation")
const bcrypt = require('bcrypt')
const { signInAccessToken, signInRefreshToken, 
         verifyRefreshToken} = require("../helper/jwt_helper");
const createHttpError = require("http-errors");
const { redisClient } = require("../database/redisdb");

router.post("/register", async (req, res, next)=>{
    try{
        //Validating data. It throws exception if it is not valid.
        const result = await authSchema.validateAsync(req.body)
        //console.log(result)

        //Extracting Email and password
        const {email, password} = req.body;

        //Check is user already exists.
        const userExist = await User.findOne({email : email})
        if(userExist)
            throw createError.Conflict(`${email} already exist!!`)
        
        const newUser = new User({      
                                    email : email,
                                    password : password
                                })
        
        newUser.save(async (err, user)=>{
            if(err){
                throw createError.InternalServerError()
            }else{
                //JWT signin
                const { accessError, accessToken} = await signInAccessToken(user._id)
                const { refreshError, refreshToken} = await signInRefreshToken(user._id)
                if(accessError || refreshError) throw createHttpError.InternalServerError();

                return res.status(201)
                        .send({ accessToken : accessToken, refreshToken: refreshToken});
            }
        })

    }
    catch(err)
    {
        if(err.isJoi === true)
            err.status = 422 // 422 Unprocessable Entity response
        next(err);
    }
})

router.post("/login", async (req, res, next)=>{
    try{
        //validation of body. It throws exception if it is not valid.
        await loginSchema.validateAsync(req.body);

        const {email, password} = req.body
        //Check user is exists of not
        const UserExists = await User.findOne({email : email});
        if(!UserExists)
            throw createError.NotFound("Email or password is wrong.");
        
        //Comparing password
        const isMatch = await UserExists.isValidPassword(password);
        if(!isMatch)   throw createError.Unauthorized("Email or password is wrong.")

        //JWT SIGN   
        const { accessError, accessToken} = await signInAccessToken(UserExists._id);
        const { refreshError, refreshToken} = await signInRefreshToken(UserExists._id);
        if(accessError || refreshError) throw createHttpError.InternalServerError();
        res.status = 200;
        return res.send({accessToken : accessToken, refreshToken: refreshToken});

    }catch(err)
    {
        if(err.isJoi === true)
            err.status = 422 // 422 Unprocessable Entity response
        next(err)
    }
})

router.post("/refresh", async (req, res, next)=>{
    try{
        const _refreshToken = req.body.refreshToken;
        if(!_refreshToken) throw createError.BadRequest("Refresh token not found")
        
        const {userId, error} = await verifyRefreshToken(_refreshToken)
        if(error) throw createError.BadRequest()

        //Signing in with userId
        const { accessError, accessToken} = await signInAccessToken(userId);
        const { refreshError, refreshToken} = await signInRefreshToken(userId);
        if(accessError || refreshError) throw createHttpError.InternalServerError();
        res.status = 200;
        return res.send({accessToken : accessToken, refreshToken: refreshToken});
    }catch(err){
        next(err);
    }
    
})

router.delete("/logout", async (req, res, next)=>{
    try{
        const {refreshToken} = req.body
        if(!refreshToken) throw createHttpError.BadRequest();
    
        const {userId, error} = await verifyRefreshToken(refreshToken)
        if(error) throw createHttpError.Unauthorized();
    
        await redisClient.del(userId)
    
        return res.status(204).end();
    }catch(err)
    {
        next(err)
    }
    
})

module.exports = router;