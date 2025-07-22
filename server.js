import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/admin.route.js';
import doctorRouter from './routes/doctor.route.js';
import userRouter from './routes/user.route.js';
import paymentRoutes from './routes/payment.route.js'

// app config
const app = express();
const port = process.env.PORT || 5177 
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use('/api/admin' , adminRouter)
app.use('/api/doctor' , doctorRouter)
app.use('/api/user' , userRouter)
app.use("/api/payment", paymentRoutes);

app.get("/" , (req , res) => {
    res.send("server started...")
})

app.listen(port , () => {
    console.log("server started on the port:" , port);
    
})