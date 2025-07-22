import doctorModel from "../models/doctor.model.js";
import appointmentModel from "../models/appointment.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const changeAvailability = async (req,res) => {
    try {
        const {docId} = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true , message:'availability Changed'})
    } catch (error) {
         console.log(error);
        res.json({success:false , message:error.message})
    }
}

const doctorList = async (req,res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password' , '-email'])
        res.json({success:true , doctors})
    } catch (error) {
        console.log(error);
        res.json({success:false , message:error.message})        
    }
}

// API for doctor login
const loginDoctor = async (req,res) => {
    try {
        const {email,password} = req.body
       const doctors = await doctorModel.findOne({email})

       if (!doctors) {
        return res.json({success:false,message:"Invalid credentials"})
       }

       const isMatch = await bcrypt.compare(password,doctors.password)

       if (isMatch) {
        const token = jwt.sign({id:doctors._id},process.env.JWT_SECRET)
        return res.json({success:true,token})
       }else{
       return res.json({success:false,message:"incorrect password"})
       }
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message})      
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req,res) => {
    try {
        const docId = req.docId;
        const appointments = await appointmentModel.find({docId})

        res.json({success:true,appointments})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message})  
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req,res) => {
    try {
       const docId = req.docId;
const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId.toString() === docId.toString()) {
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
            return res.json({success:true,message:"Appointment Completed"})
        }else{
            return res.json({success:false,message:"Mark Failed"})
        }
    } catch (error) {
         console.log(error);
        return res.json({success:false , message:error.message}) 
    }
}

// API to cancel appointment  for doctor panel
const appointmentCancel = async (req,res) => {
    try {
        const docId = req.docId;
const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId.toString() === docId.toString()) {
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
            return res.json({success:true,message:"Appointment Cacelled"})
        }else{
            return res.json({success:false,message:"Cancellation Failed"})
        }
    } catch (error) {
         console.log(error);
        return res.json({success:false , message:error.message}) 
    }
}

// API to get dashboard data for doctor panel

const doctorDashboard = async (req,res) => {
    try {
        const docId = req.docId;
        const appointments = await appointmentModel.find({docId})

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.amount) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message}) 
    }
}

// API to get doctor profile for doctor panel 
const doctorProfile = async (req,res) => {
    try {
        const docId = req.docId;
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success:true,profileData})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message}) 
    }
} 

// API to update doctor profile for doctor panel 
const updateDoctorProfile = async (req,res) => {
    try {
        const docId = req.docId;
        const { fees , address ,available} = req.body;

      const updated =   await doctorModel.findByIdAndUpdate(docId,{fees,address,available},{ new: true })

        res.json({success:true,message:"Profile Updated",profileData: updated})
    } catch (error) {
         console.log(error);
        return res.json({success:false , message:error.message}) 
    }
}

export {
    changeAvailability,doctorList,
    loginDoctor,appointmentsDoctor,
    appointmentCancel,appointmentComplete,
    doctorDashboard,doctorProfile,
    updateDoctorProfile
}