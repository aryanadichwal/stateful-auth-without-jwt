import express from "express"
import { z } from "zod"
import bcrypt from "bcrypt"
import { UserModel } from "../db.js"
import { authmiddleware } from "../middleware/user.js"
import { redisclient } from "../config.js"
import { createAccessToken, createRefreshToken } from "../tokens/token.js"

const userRouter = express.Router()

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
                const accessToken = createAccessToken(user._id)
                const refreshToken = await createRefreshToken(user._id)
                res.json({accessToken,refreshToken })
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

userRouter.post("/refresh", async (req,res)=>{
    try{
        const refreshToken = req.body.refreshToken
    if(!refreshToken) {
        return res.sendStatus(401)
    }

    const userId = await redisclient.getDel(`refresh:${refreshToken}`)
    if(!userId){
        return res.sendStatus(401)
    }

    const accessToken = createAccessToken(userId)
    const newrefreshToken = await createRefreshToken(userId)
    res.json({ accessToken, refreshToken: newrefreshToken })
    } catch (e){}
        res.status(500).json({
            message: "Something went wrong"
        })
        console.log(e)
})

userRouter.post('/logout', async (req, res) => {
  const  refreshToken  = req.body.refreshToken;
  if (refreshToken) await redisclient.del(`refresh:${refreshToken}`);
  res.sendStatus(204);
})


userRouter.get("/preview", authmiddleware,async(req,res)=>{
    try{
        const userID = req.userId
        res.json({userID})
    } catch (e){
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
})


export { userRouter }