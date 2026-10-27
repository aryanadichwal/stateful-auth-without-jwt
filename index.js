import "dotenv/config"

import mongoose from "mongoose"
import express from "express"
import dns from "node:dns"
import { userRouter } from "./routes/user.js"
import { redisclient } from "./config.js"

dns.setServers(["8.8.8.8", "1.1.1.1"])
const app = express()


app.use(express.json())

app.use("/user", userRouter)


async function main(){
    await mongoose.connect(process.env.MONGO_URl)
    await redisclient.connect()
    app.listen(3008)
}

main()