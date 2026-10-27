import mongoose from "mongoose"

const Schema = mongoose.Schema

const User = new Schema({
    username: {type: String, unique: true },
    password: String
})

const UserModel = mongoose.model("users",User)

export { UserModel }