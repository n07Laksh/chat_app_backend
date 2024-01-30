import mongoose from "mongoose";

const mongoURI = process.env.MONGODB_URL || "mongodb://localhost:27017/admin";

const dbConnection = ()=> {
    mongoose.connect(mongoURI)
    .then(()=>{
        console.log("connected to the database")
    })
    .catch((error)=>{
        console.error("Error connecting to the database:", error);
    })
}

export default dbConnection;