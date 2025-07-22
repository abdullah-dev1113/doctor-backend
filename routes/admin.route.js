import express from 'express'
import { addDoctor , adminDashboard, adminLogin, allDoctors, appointmentCancel, appointmentsAdmin } from '../controllers/admin.controller.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/auth.middleware.js';
import { changeAvailability } from '../controllers/doctor.controller.js';

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin , upload.single('image') , addDoctor)
adminRouter.post("/login" , adminLogin)
adminRouter.post("/all-doctors", authAdmin , allDoctors)
adminRouter.post("/change-availability", authAdmin , changeAvailability)
adminRouter.get("/appointments",authAdmin,appointmentsAdmin);
adminRouter.post("/cancel-appointment" , authAdmin , appointmentCancel)
adminRouter.get("/dashboard",authAdmin,adminDashboard)
export default adminRouter;