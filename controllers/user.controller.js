import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/user.model.js'
import doctorModel from "../models/doctor.model.js"
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import appointmentModel from '../models/appointment.model.js'

// API to register user
const registerUser = async (req,res) => {
    try {
        const {name , email , password} = req.body;
        if (!name || !email || !password) {
           return res.json({success:false , message:"Missing Details"})
        }
        // validating email format
        if(!validator.isEmail(email)){
           return res.json({success:false , message:"Enter a valid email"})
        }
        // validating strong password
        if (password.length < 8) {
            return res.json({success:false , message:"Enter a strong password"})
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save();
        const token = jwt.sign({id:user._id} , process.env.JWT_SECRET)

       return res.json({success:true , token} )
    } catch (error) {
        console.log(error);
       return res.json({success:false , message:error.message})
    }
}

// API for user login

const userLogin = async (req,res) => {
    try {
        const {email,password} =req.body;
        const user = await userModel.findOne({email})
        if (!user) {
       return res.json({success:false , message:"user does not exist"})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if (isMatch) {
            const token = jwt.sign({id:user._id} , process.env.JWT_SECRET)
            return res.json({success:true , token})
        }else{
            return res.json({success:false , message:"invalid credentials"})
        }
    } catch (error) {
        console.log(error);
         return res.json({success:false , message:error.message})
    }
}

// API to get user profile Data

const getProfile = async (req,res) => {
    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password')
        return res.json({success:true , userData})
    } catch (error) {
        console.log(error);
         return res.json({success:false , message:error.message})
    }
}

// API to update user profile

const updateProfile = async (req,res) => {
    try {
        const userId = req.userId;
        const {name, phone , address , dob , gender} = req.body;
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
          return  res.json({success:false , message:"Missing Data"})
        }
        await userModel.findByIdAndUpdate(userId , {name ,  phone , address:JSON.parse(address) , dob , gender})

        if (imageFile) {
            // upload to the cloudinary
            const uploadImage = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageUrl = uploadImage.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageUrl})
        }

        res.json({success:true , message:"Profile Updated"})
    } catch (error) {
        console.log(error);
         return res.json({success:false , message:error.message})
    }
}

// API to book appointment
const bookAppointment = async (req,res) => {
    try {
        const {docId,slotDate, slotTime} = req.body;
        const userId = req.userId;
        const docData = await doctorModel.findById(docId).select('-password')
        if (!docData.available) {
            res.json({success:false,message:"Doctor Not Available"})
        }
        let slots_booked = docData.slots_booked

        // checking for slots availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
              res.json({success:false,message:"Slots Not Available"})  
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password').lean()

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            dateTime: slotDate + " " + slotTime,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in doctor data 
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        return res.json({success:true , message:"Appointment Booked"})
    } catch (error) {
         console.log(error);
         return res.json({success:false , message:error.message})
    }
}


// API to get user appointments for frontend page my-appointments
const listAppointments = async (req,res) => {
    try {
        const userId = req.userId
        const appointments = await appointmentModel.find({userId})
        res.json({success:true,appointments})
    } catch (error) {
        console.log(error);
         return res.json({success:false , message:error.message})
    }
}

// API to cancel the appointments
const cancelAppointment = async (req,res) => {
    try {
        const {appointmentId} = req.body;
        const userId = req.userId;
        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
  return res.json({ success: false, message: "Appointment not found" });
}

        // verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({success:false , message:"Unauthorized Action"})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

        // releasing doctor slots

        const {docId , slotDate , slotTime} = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true , message:"Appointment Cancelled"})
    } catch (error) {
        console.log(error);
         return res.json({success:false , message:error.message})
    }
}


export {registerUser , userLogin ,getProfile , updateProfile,bookAppointment , listAppointments , cancelAppointment}