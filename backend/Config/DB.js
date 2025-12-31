import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(
            `Connected to MongoDB database`
            );
        
    } catch (error) {
        console.log(`You failed to connect to the database `);
        console.log(error);
        process.exit(1); // Exit the process with failure
    }
}
