const redis = require("redis")

console.log("Redis PORT = ", process.env.REDIS_PORT)
console.log("Redis HOST = ", process.env.REDIS_HOST)

const client = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
});

(async () => {
    // Connect to redis server
    await client.connect();
})();

client.on("connect",function (){
    console.log("REDIS is connected to DB")
})

client.on("ready",()=>{
    console.log("REDIS is ready for use")
})

client.on("error",(err)=>{
    console.error("Error in Redis : ",err)
})

client.on("end",()=>{
    console.log("REDIS connection ended!!!")
})

process.on("SIGNINT", async ()=>{
    await client.quit()
})

module.exports.redisClient = client