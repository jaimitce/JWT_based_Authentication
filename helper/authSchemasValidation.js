const Joi = require('joi');

//Joi helps us to validate the values.
const email = Joi.string().email().required()
const password = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()

const authSchema = Joi.object({
    email : email,
    password : password,
    confirmPassword : Joi.string().required().valid(Joi.ref('password'))
});

const loginSchema = Joi.object({
    email : email,
    password : password
});

module.exports.authSchema = authSchema;
module.exports.loginSchema = loginSchema;