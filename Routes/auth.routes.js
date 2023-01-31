const router = require("express").Router();
const User = require('../Models/User')
const createError = require('http-errors')
const {authSchema , loginSchema} = require("../helper/authSchemasValidation")
const bcrypt = require('bcrypt')
const {signInAccessToken} = require("../helper/jwt_helper");
const createHttpError = require("http-errors");
const { create } = require("../Models/User");

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
                const { error, token} = await signInAccessToken(user._id)
                if(error) throw createHttpError.InternalServerError();

                return res.status(201).send({ token : token});
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
        const {error, token} = await signInAccessToken(UserExists._id);
        if(error) throw createHttpError.InternalServerError();

        return res.send({token});

    }catch(err)
    {
        if(err.isJoi === true)
            err.status = 422 // 422 Unprocessable Entity response
        next(err)
    }
})

router.put("/refresh", (req, res)=>{
    return res.send("Refresh token route");
})

router.get("/logout", (req, res)=>{
    return res.send("Logout route");
})

module.exports = router;