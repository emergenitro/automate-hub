import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    password: String, // hashed
    authToken: String, // used for NFC-based auth
    sensorData: {
        soilMoisture: Number,
        waterSensor: Number,
        lightSensor: Number,
        // camera images or references (e.g., storing URLs or base64 data)
        cameraImages: [String],
        // Add other fields as needed
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);