import jwt from "jsonwebtoken"
import { randomBytes } from "node:crypto"
import { redisclient } from "../config.js"

const REFRESH_TTL = 7 * 24 * 60 * 60
export function createAccessToken(userId){
    return jwt.sign({sub: String(userId)}, process.env.JWT_SECRET, {expiresIn: "15m"})
}

export async function createRefreshToken(userId){
    const token = randomBytes(32).toString("hex")
    await redisclient.set(`refresh:${token}`, userId.toString(), {EX:REFRESH_TTL})
    return token
}
