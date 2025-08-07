// import appointmentModel from "../models/appointment.model.js";

// const  createAppointment = async (req, res) => {
//   try {
//     const { userId, docId, slotDate, slotTime, dateTime, userData, docData, amount, date } = req.body;

//     const appointment = new appointmentModel({
//       userId,
//       docId,
//       slotDate,
//       slotTime,
//       dateTime,
//       userData,
//       docData,
//       amount,
//       date,
//     });

//     await appointment.save();

//     res.json({ success: true, message: "Appointment created ✅", appointment });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error creating appointment", error });
//   }
// };



// export {createAppointment, }




import appointmentModel from "../models/appointment.model.js";
import {sendEmail} from "../Utils/SendEmail.js";  // import your email helper

const createAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, dateTime, userData, docData, amount, date } = req.body;

    // Save appointment to DB
    const appointment = new appointmentModel({
      userId,
      docId,
      slotDate,
      slotTime,
      dateTime,
      userData,
      docData,
      amount,
      date,
    });

    await appointment.save();

    console.log("👉 Sending email to user:", userData.email);
    // Send email to user
    await sendEmail(
      userData.email,
      "Appointment Confirmed",
      `Hello ${userData.name},\n\nYour appointment with Dr. ${docData.name} is confirmed for ${slotDate} at ${slotTime}.\n\nThank you!`      
    );

    
    console.log("✅ User email sent successfully.");
    

       // 🟡 Log before sending doctor email
    console.log("👉 Sending email to doctor:", docData.email);
    // Send email to doctor
    await sendEmail(
      docData.email,
      "New Appointment Booked",
      `Hello Dr. ${docData.name},\n\nYou have a new appointment on ${slotDate} at ${slotTime} with ${userData.name}.\n\nPlease check your dashboard for details.`
    );
    

    res.json({ success: true, message: "Appointment created ✅ and emails sent", appointment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating appointment", error });
  }
};

export { createAppointment };
