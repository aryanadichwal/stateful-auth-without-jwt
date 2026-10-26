const express = require("express")
const { Router } = require("express")
const userRouter = Router()
const { z } = require("zod")
const bcrypt = require("bcrypt")
const { UserModel } = require("../db")
const { authmiddleware } = require("../middleware/user")

const crypto = require("crypto")
const { redisclient } = require("../config")

const app = express()
app.use(express.json())

const userSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(5).max(50)
})

userRouter.post("/signup", async (req,res)=>{
    const parsed = userSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(403).json({message:"Ivalid input"})
    }
    try{
        const username = parsed.data.username
        const hashed_password = await bcrypt.hash(parsed.data.password, 3)
        await UserModel.create({
            username:username,
            password:hashed_password
        })
        res.json({message:"Account created"})
    }catch(e){
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
})

userRouter.post("/signin", async (req,res)=>{
    const parsed = userSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(403).json({message:"Ivalid input"})
    }
    try{    
        const username = parsed.data.username
        const password = parsed.data.password
        const user = await UserModel.findOne({
            username
        })
        if(user){
            const password_match = await bcrypt.compare(password, user.password)
            if(password_match){
                const token = crypto.randomBytes(32).toString("hex")
                await redisclient.set(`session:${token}`, user._id.toString())
                res.json({token:token})
                

            }else{
                res.status(403).json({
                message:"Invalid credentials"
                })
            }
            
        }else {
            res.status(403).json({
                message:"User not found"
            })
        }

    } catch (e){
        res.status(500).json({
            message: "Something went wrong"
        })
        console.log(e)
    }
})

userRouter.get("/preview", authmiddleware,async(req,res)=>{
    try{
        const userID = req.userID
        res.json({userID})
    } catch (e){
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
})



module.exports = {
    userRouter:userRouter
}