import appointmentModel from "../models/appointment.model.js";

const makeDummyPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Check if this user owns the appointment
    if (appointment.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    appointment.paid = true;
    await appointment.save();

    return res.json({ success: true, message: "Payment successful!" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export { makeDummyPayment };
