import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/user.model.js'
import doctorModel from "../models/doctor.model.js"
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import appointmentModel from '../models/appointment.model.js'
import { sendEmail } from "../Utils/SendEmail.js";

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
    console.log("📅 [API] bookAppointment called");
    console.log("recieved req",req.body);
    
    try {
        const {docId,slotDate, slotTime} = req.body;
        const userId = req.userId;
        const docData = await doctorModel.findById(docId).select('-password')
        console.log("🩺 docData:", docData);
        if (!docData.available) {
           return res.json({success:false,message:"Doctor Not Available"})
        }
        let slots_booked = docData.slots_booked

        // checking for slots availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
             return res.json({success:false,message:"Slots Not Available"})  
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

         // Send confirmation email to user
       try {
  await sendEmail(
    userData.email,
   "Appointment Confirmation –" + docData.name,
  `
Dear ${userData.name},

✅ Your appointment has been successfully confirmed!

📅 Date: ${slotDate.replace(/_/g, "/")}
⏰ Time: ${slotTime}
👩‍⚕️ Doctor:  ${docData.name} (${docData.speciality})
📍 Clinic Address: ${docData.address?.line1 || "Clinic address not available"}

💳 Appointment Fee: $${ docData.fees} 

Please arrive 10 minutes before your scheduled appointment time. If you have any questions, feel free to reach out.

Thank you for using our platform.

Warm regards,  
HealthCare App Team
  `
  );
//   console.log("User confirmation email sent successfully.");
} catch (err) {
  console.error("Error sending user confirmation email:", err);
}
// console.log("About to send doctor email");
try {
  await sendEmail(
    docData.email,
   " New Appointment Booked – " + userData.name,
  `
Dear ${docData.name},

📢 A new appointment has been scheduled with you.

👤 Patient: ${userData.name}
📧 Email: ${userData.email}
📞 Phone: ${userData.phone || "Not provided"}

📅 Date: ${slotDate.replace(/_/g, "/")}
⏰ Time: ${slotTime}

Please make the necessary preparations and be available at the scheduled time.

Thank you for your continued dedication.

Best regards,  
HealthCare App Team
  `
  );
  console.log("Doctor notification email sent successfully.");
} catch (err) {
  console.error("Error sending doctor notification email:", err);
}
return res.json({success:true, message:"Appointment booked successfully"});

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
// const cancelAppointment = async (req,res) => {
//     try {
//         const {appointmentId} = req.body;
//         const userId = req.userId;
//         const appointmentData = await appointmentModel.findById(appointmentId)
//         if (!appointmentData) {
//   return res.json({ success: false, message: "Appointment not found" });
// }

//         // verify appointment user
//         if (appointmentData.userId !== userId) {
//             return res.json({success:false , message:"Unauthorized Action"})
//         }

//         await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

//         // releasing doctor slots

//         const {docId , slotDate , slotTime} = appointmentData

//         const doctorData = await doctorModel.findById(docId)

//         let slots_booked = doctorData.slots_booked

//         slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
//         await doctorModel.findByIdAndUpdate(docId,{slots_booked})

//         res.json({success:true , message:"Appointment Cancelled"})
//     } catch (error) {
//         console.log(error);
//          return res.json({success:false , message:error.message})
//     }
// }


const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.userId;
        const appointmentData = await appointmentModel.findById(appointmentId);
        
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Verify appointment user
        if (appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized Action" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Releasing doctor slots
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        // Sending cancellation emails
        const userData = await userModel.findById(userId).select('-password');

        // Send cancellation email to user
        try {
            await sendEmail(
                userData.email,
                "Appointment Cancellation Confirmation – " + doctorData.name,
                `
Dear ${userData.name},

❌ Your appointment with Dr. ${doctorData.name} has been successfully cancelled.

📅 Date: ${slotDate.replace(/_/g, "/")}
⏰ Time: ${slotTime}
👨‍⚕️ Doctor: ${doctorData.name} (${doctorData.speciality})
📍 Clinic Address: ${doctorData.address?.line1 || "Clinic address not available"}

If this was a mistake or you’d like to reschedule, please book a new appointment at your convenience.

Best regards,  
HealthCare App Team
                `
            );
        } catch (err) {
            console.error("Error sending cancellation email to user:", err);
        }

        // Send cancellation email to doctor
        try {
            await sendEmail(
                doctorData.email,
                "Appointment Cancelled – " + userData.name,
                `
Dear ${doctorData.name},

❗ The following appointment has been cancelled:

👤 Patient: ${userData.name}
📧 Email: ${userData.email}
📅 Date: ${slotDate.replace(/_/g, "/")}
⏰ Time: ${slotTime}

The slot has been released and is now available for booking.

Thank you,  
HealthCare App Team
                `
            );
        } catch (err) {
            console.error("Error sending cancellation email to doctor:", err);
        }

        res.json({ success: true, message: "Appointment Cancelled and emails sent." });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};


export {registerUser , userLogin ,getProfile , updateProfile,bookAppointment , listAppointments , cancelAppointment}