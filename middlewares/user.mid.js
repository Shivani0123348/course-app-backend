import  config  from "../config.js";
import jwt from "jsonwebtoken"
function userMiddleware(req,resp,next){
    const authHeader=req.headers.authorization;
   
    if(!authHeader || !authHeader.startsWith("Bearer") ) {
        return resp.status(401).json({errors:"No token provided"})

    }

    const token=authHeader.split(" ")[1];
    try{

        const decoded=jwt.verify(token,config.JWT_USER_PASSWORD)
        
        req.userId=decoded.id
        next();
    }catch(error){
         resp.status(401).json({errors:"Invalid token or expired token"})
        console.log("Invlaid token or expired token",error);
        
    }
}

export default userMiddleware;