const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique : true,
        lowercase: true
    },
    password : {
        type: String,
        required: true
    }
});

//use function keyword when you want to use this keyword.

//Whenever we save the data before that this callback will be called.
//Basically it is a middleware. 
UserSchema.pre("save", async function (next, user)  {
    try{
        const salt = await bcrypt.genSalt(10);
        const hasedPassword = await bcrypt.hash(this.password, salt)
        this.password = hasedPassword
        next();
    }
    catch(err)
    {
        next(err);
    }
})

UserSchema.methods.isValidPassword = async function(password, next){
    try{
        return await bcrypt.compare(password, this.password)
    }catch(err){
        next(err);
    }
}

module.exports =  mongoose.model("User", UserSchema)