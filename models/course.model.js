//database schema for courses

import mongoose from "mongoose"

const courseSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true,
       
    },
    description:{
        type:String
    },
    price:{
        type:Number,
        required:true,
    },
    image:{
       public_id:{
        type:String,
        required:true
       },

       url:{
        type:String,
        required:true
       },

    },

    creatorId:{
      type: mongoose.Types.ObjectId,
      ref: "User"  
    }
})

export const Course=mongoose.model("course",courseSchema)