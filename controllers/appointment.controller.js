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
