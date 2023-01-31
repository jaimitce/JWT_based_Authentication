const mongoose = require("mongoose");

const connection_url = process.env.MONGODB_CONNECTION_STRING;
const db_name = process.env.DBNAME || "JWT";

mongoose.set('strictQuery', false);

mongoose.connect(connection_url, {
                dbName : db_name
    }).then(()=>{
        console.log("MONGODB all connection done")
    }).catch(err =>{
        if(err)
            console.error(err);
})

mongoose.connection.on("open", function(ref) {
    console.log("OnOpen - MongoDB");
});

mongoose.connection.on("connected", function(ref) {
    console.log("OnConnected - MongoDB");
});

mongoose.connection.on("error", function(err) {
    console.error("Could not connect to mongo server!");
});

mongoose.connection.on("disconnected", function(err) {
    console.error("Mongodb server disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      process.exit(0);
    });
});