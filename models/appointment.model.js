import mongoose from 'mongoose'
// import userModel from './user.model.js';
// import doctorModel from './doctor.model.js';


const appointmentSchema = new mongoose.Schema({
    userId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'user',
     required:true
    },
    docId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'doctor',
        required:true
    },
    slotDate:{
        type:String,
        required:true
    },
    slotTime:{
        type:String,
        required:true
    },
    dateTime:{
        type:String,
        required:true
    },
    userData:{
        type:Object,
        required:true
    },
    docData:{
        type:Object,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    cancelled:{
        type:Boolean,
        default:false
    },
    payment:{
        type:Boolean,
        default:false
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    paid: {
        type: Boolean,
        default: false,
    },
})

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema) 

export default appointmentModel;