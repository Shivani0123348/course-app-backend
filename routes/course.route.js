import express from "express"
import { createCourse,deleteCourse,updateCourse ,getCourses,courseDetails, buyCourses} from "../controllers/course.controller.js"
import adminMiddleware from "../middlewares/admin.mid.js"
import userMiddleware from "../middlewares/user.mid.js"
import { verifyPayment } from "../controllers/course.controller.js";


const router = express.Router()

router.post("/create",adminMiddleware,createCourse)

router.put("/update/:courseId",adminMiddleware,updateCourse)
router.delete("/delete/:courseId",adminMiddleware,deleteCourse)
router.get("/courses",getCourses)
router.get("/:courseId",courseDetails)
router.post("/buy/:courseId", userMiddleware ,buyCourses)
router.post("/verify-payment", userMiddleware, verifyPayment);

export default router;