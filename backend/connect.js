const mongoose = require('mongoose');

const uri = "mongodb+srv://bharatkolhe20_db_user:bharat123@cluster0.1cg8pal.mongodb.net/poultrysmart?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
    try {
        await mongoose.connect(uri);

        console.log("MongoDB Connected");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
};

module.exports = connectDB;