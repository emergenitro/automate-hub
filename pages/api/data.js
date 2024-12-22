import { dbConnect } from '../../lib/dbConnect';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

const NFC_SECRET = process.env.NFC_SECRET || 'nfc_shared_secret';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'POST') {
        try {
            const authHeader = req.headers.authorization; // e.g. Bearer
            if (!authHeader) {
                return res.status(401).json({ message: 'Missing NFC authorization' });
            }
            const nfcToken = authHeader.split(' ')[1];
            const decoded = jwt.verify(nfcToken, NFC_SECRET);

            // Find user
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Destructure data from the request body; only update what is provided
            const { soilMoisture, waterSensor, lightSensor, cameraImage } = req.body;

            // If a field is provided, update it
            if (soilMoisture !== undefined) user.sensorData.soilMoisture = soilMoisture;
            if (waterSensor !== undefined) user.sensorData.waterSensor = waterSensor;
            if (lightSensor !== undefined) user.sensorData.lightSensor = lightSensor;
            if (cameraImage !== undefined) {
                // Possibly push to array or store a single one
                user.sensorData.cameraImages = user.sensorData.cameraImages || [];
                user.sensorData.cameraImages.push(cameraImage);
            }

            await user.save();

            return res.status(200).json({ message: 'Data updated successfully' });
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Invalid token or error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}