import mongoose from 'mongoose';


const connectDB = async () => {

    mongoose.connection.on("connected", () => {
        console.log("Database Connected.");
        
    })

    await mongoose.connect(`${process.env.DB_URI}/Priscripto`)
}

export default connectDB;