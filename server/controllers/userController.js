import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import UserModel from "../models/userModel.js"
import bcrypt from "bcryptjs"

// Signup a new user
export const signup = async(req,res)=>{
    const {fullName, email, password, bio} = req.body

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success:false,message:"Missing Details"})
        }
        const user = await UserModel.findOne({email})

        if(user){
            return res.json({success:false, message:"Account already exists"})
        }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password,salt)
      const newUser = await UserModel.create({
        fullName, email, password:hashedPassword,bio
      })

      const token = generateToken(newUser._id)

      res.json({success:true, userData: newUser, token, message: "Account created successfully" })
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message })
    }
}

// Login user
export const login = async (req,res)=>{
    try {
        const {email,password} = req.body
        const userData = await UserModel.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password)

        if(!isPasswordCorrect){
            return res.json({success:false, message:"Invalid Credentials"})
        }
        const token = generateToken(userData._id)

        res.json({success:true, userData,token,message:"Login Successful"})
    } catch (error) {
         console.log(error.message)
        res.json({success:false, message:error.message })
    }
}

// Controller to check if user is authenticated
export const checkAuth = (req, res)=>{
    res.json({success:true,user:req.user})
}

// Controller to update user profile details
export const updateProfile = async (req, res)=>{
   try {
    const {profilePic, bio, fullName} = req.body

    const userId = req.user._id
    let updatedUser;

    if(!profilePic){
      updatedUser = await UserModel.findByIdAndUpdate(userId, {bio,fullName},{new: true})
    } else{
        const upload = await cloudinary.uploader.upload(profilePic)

        updatedUser = await UserModel.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new: true})
    }
    res.json({success:true, user:updatedUser})
    
   } catch (error) {
    console.log(error.message);
    
    res.json({success:false, message:error.message})
   }
}