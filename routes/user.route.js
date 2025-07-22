import express from 'express';
import { getProfile, registerUser, updateProfile, userLogin , bookAppointment, listAppointments, cancelAppointment} from '../controllers/user.controller.js';
import authUser from "../middlewares/authUser.middleware.js"
import upload from "../middlewares/multer.js"

const userRouter = express.Router();


userRouter.post("/register" , registerUser)
userRouter.post("/login" , userLogin)
userRouter.get("/get-profile" , authUser ,getProfile)
userRouter.post("/update-profile" , upload.single("image"), authUser ,updateProfile)
userRouter.post("/book-appointment" , authUser ,bookAppointment)
userRouter.get('/appointments', authUser,listAppointments)
userRouter.post('/cancel-appointment' , authUser , cancelAppointment)
export default userRouter;