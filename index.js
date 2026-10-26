require("dotenv").config()

const mongoose = require("mongoose")
const express = require("express")
const dns = require("dns")
dns.setServers(["8.8.8.8", "1.1.1.1"])
const { userRouter } = require("./routes/user")
const { redisclient } = require("./config")
const app = express()


app.use(express.json())

app.use("/user",userRouter)





async function main(){
    await mongoose.connect(process.env.MONGO_URl)
    await redisclient.connect()
    app.listen(3008)
}

main()