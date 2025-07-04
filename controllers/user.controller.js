import  { User } from "../models/user.model.js" 
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import config from "../config.js"
import { z } from "zod"
import { Purchase } from "../models/purchase.model.js"
import { Course } from "../models/course.model.js"
export const signup = async (req,resp)=>{
     const {firstName, lastName, email, password}=req.body;

     const userSchema=z.object({
        firstName: z.string().min(3,{message:"firstName must be atleast 3 character long"}),
        lastName: z.string().min(3,{message:"lastName must be atleast 3 character long"}),
        email: z.string().email(),
        password: z.string().min(6,{message:"password must be atleast 6 character long"}),
     });
    
     const validateData = userSchema.safeParse(req.body);
     if(!validateData.success){
        return resp.status(400).json({ errors: validateData.error.issues.map(err => err.message) });

     }

     const hashedPassword=await bcrypt.hash(password, 10);
     try
     {const existingUser=await User.findOne({email: email});
     if(existingUser){
        return resp.status(400).json({errors:"User already exist"});
     }

     const newUser=new User({firstName, lastName, email, password:hashedPassword});
     await newUser.save();
     resp.status(201).json({message:"Signup successfully",newUser})
    }catch (error){
        resp.status(500).json({errors:"Error in signup"})
       console.log("Error in signup", error);
        
    }

}

export const login = async (req,resp)=>{
     const { email, password}= req.body;

     try{
             const user=await User.findOne({email: email})
             const isPasswordCorrect= await bcrypt.compare(password, user.password)
             if(!user || !isPasswordCorrect){
                return resp.status(403).json({errors:"Invalid credentials"})
             }
             //jwt code
             const token=jwt.sign({
                id:user._id,
               
             }, config.JWT_USER_PASSWORD,
            { expiresIn:"1d"})
            const cookieOptions={
                expires: new Date(Date.now() +24*60*60*1000), //1hour
                httpOnly: true, 
                secure: process.env.NODE_ENV==="production", //true for http only
                 sameSite: "Strict", //CSRF attack
            }
             resp.cookie("jwt",token,cookieOptions)
             resp.status(201).json({message:"Login successfully", user,token})
     }catch(error){
        resp.status(500).json({errors:"Error in login"});
        console.log("error in login", error);
     }
}

export const logout = (req, res) => {
  try {
   if(!req.cookies.jwt){
    return res.status(401).json({errors:"Kindly login first"})
   }
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in logout" });
    console.log("Error in logout", error);
  }
};

export const purchases=async (req,resp)=>{
     const userId=req.userId;
      try{
        const purchased=await Purchase.find({userId})
        let purchasedCourseId=[];
        for(let i=0;i<purchased.length;i++){
            purchasedCourseId.push(purchased[i].courseId)
           
        }

         const courseData=await Course.find({
                _id:{$in:purchasedCourseId}
            })

        resp.status(200).json({purchased,courseData})

      } catch(error){
        resp.status(500).json({errors:"Error in purchases"})
        console.log("Error in purchase",error)

      }
}

