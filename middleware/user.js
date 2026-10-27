import jwt from "jsonwebtoken"

async function authmiddleware (req,res,next){
    const token = req.headers.authorization
    if(!token){
        return res.status(401).json({ message: "No token" })
    }
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.sub
        next()
    } catch (e){
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
}



export { authmiddleware }