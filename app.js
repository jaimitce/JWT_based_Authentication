const express = require("express")
const app = express()
const createError = require("http-errors")
const dotenv = require('dotenv');
//read all config from .env file.
dotenv.config();
const authRouter = require('./Routes/auth.routes')
const {verifyAccessToken} = require('./helper/jwt_helper')

const morgan = require('morgan')


// Morgan is used to log. Here we are adding in middleware.
// so all the incomming request will be logged.
app.use(morgan());

// parse requests of content-type - application/json
app.use(express.json());

const mongodb = require("./database/mongodb")
const {redisClient} = require("./database/redisdb")

app.use('/auth', authRouter);

app.post("/home", verifyAccessToken, (req, res)=>{
    // console.log("Auth Token : ")
    // console.log(req.headers["authorization"])
    res.send({msg: "home page"})
})

// Not found route
//This middleware will be used if no route match with our server.
app.use((req, res, next)=>{
    next(createError.NotFound());
})

//Error handler
//From last app.use() we are getting error code here.
app.use((err, req, res, next) =>{
    if(err)
    {
        res.status(err.status || 500)
        res.send( {error : {
                                "message": err.message,
                                "status" : err.status || 500
                            }
        })
    }
    
})

const PORT = process.env.PORT || 4004;
app.listen(PORT, (err)=>{
    if(err) console.error(err)
    else console.log(`SERVER LISTENING ON PORT ${PORT}`)
})