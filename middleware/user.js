const { redisclient } = require("../config")



async function authmiddleware (req,res,next){
    const token = req.headers.token
    if(!token){
        return res.status(401).json({ message: "No token" })
    }
    try{
        const userID = await redisclient.get(`session:${token}`)
        if(!userID){
            return res.status(401).json({ message: "Session expired or invalid" })
        }else{
            req.userID = userID
            next()
        }
        
    } catch (e){
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
}



module.exports = {
    authmiddleware:authmiddleware
}