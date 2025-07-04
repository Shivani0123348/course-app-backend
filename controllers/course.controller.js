import { Course } from "../models/course.model.js"

import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from "../models/purchase.model.js"

export const createCourse=async(req,resp)=>{
    const adminId=req.adminId
   const  {title,description,price}=req.body;

   try{
    if(!title||!description||!price){
        return resp.status(400).json({errors:"All fields are required"})
    }
   

   
    if(!req.files || Object.keys(req.files).length==0){
        return resp.status(400).json({errors:"No files uploaded"})
    }
 const { image }=req.files
    const allowedFormat= ["image/png", "image/jpeg"];
    if(!allowedFormat.includes(image.mimetype)){
        return resp.status(400).json({errors: "invalid file format. only PNG and JPG are allowed"});

    }

    // claudinary code
    
    const cloud_response=await cloudinary.uploader.upload(image.tempFilePath)
  
    if(!cloud_response||cloud_response.error){
        return resp.status(400).json({errors:" error uploading file to cloudinary"});
    }
    const  courseData={
        title,
        description,
        price,
        image:{
          public_id: cloud_response.public_id,
          url: cloud_response.url,
        },
       creatorId:adminId 
    }

   const course = await Course.create(courseData)
   resp.json({
    message:"course created successfully",
    course
})
   }

   catch(error){
    console.log(error);
    resp.status(500).json({error: "error in creating course"})
   }
  
};

export const updateCourse=async(req,resp)=>{
    const adminId=req.adminId
    const {courseId}=req.params;
    const {title, description, price, image}=req.body;

    
    try{

        const courseSearch=await Course.findById(courseId);
        if(!courseSearch){
          return resp.status(404).json({errors:"Course not found"})  
        }
           const  course=await Course.findOneAndUpdate({
              _id:courseId,
              creatorId: adminId,
           },{

            title,
            description,
            price,
            image:{
                public_id: image?.public_id,
                url: image?.url,
            }

           });

           if(!course){
            return resp.status(404).json({errors:"can't update, created by other admin"})
           }

           resp.status(201).json({message:"course updated successfully",course})
    }
    catch(error){
         resp.status(500).json({error:"Error in course updating"})
        console.log("Error in course updating", error)
    }
};

export const deleteCourse=async(req,resp)=>{
    const adminId=req.adminId;
    const { courseId }=req.params;

    try{
         const course=await Course.findOneAndDelete({
            _id:courseId,
           creatorId:adminId,
         })

        if(!course){
           return resp.status(404).json({errors:"can't delete, created by other admin"}) 
        }

        resp.status(200).json({message:"Course deleted successfully"});
    }
    catch(error){
        resp.status(500).json({errors:"Error in course updating"});
        console.log("Error in course deleting",error)
    }
}

export const getCourses = async(req,resp) =>{
     try{
         const courses=await Course.find({})
         resp.status(201).json({ courses})
     } 

     catch(error){
        resp.status(500).json({errors:"Error in getting the courses"})
        console.log("error to get courses", error)
     }
}

export const courseDetails=async(req,resp)=>{
    const { courseId } =req.params;
    
    try{
       
      const course=await Course.findById(courseId);
      if(!course){
        return resp.status(404).json({error:"Course not found"});
      }

      resp.status(200).json({ course });
    }

    catch(error){
        resp.status(500).json({ errors:"Error in getting course details"})
        console.log("error in getting course details", error)
    }
}


import Razorpay from "razorpay";
import crypto from "crypto";
import config from "../config.js";





const razorpay = new Razorpay({
  key_id: config.RAZORPAY_ID_KEY,
  key_secret: config.RAZORPAY_SECRET_KEY
});

export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res.status(400).json({ errors: "You already purchased this course" });
    }

    const options = {
      amount: Math.round(course.price * 100), // amount in cents (USD x 100)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        courseId
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      course,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_ID_KEY, // <-- Important!
    });
  } catch (error) {
    console.error("Error in creating Razorpay order", error);
    res.status(500).json({ error: "Error in creating Razorpay order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      courseId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Save the purchase
      const newPurchase = new Purchase({ userId, courseId });
      await newPurchase.save();

      res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment verification failed", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

