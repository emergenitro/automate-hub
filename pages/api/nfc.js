import { dbConnect } from '../../lib/dbConnect';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

const NFC_SECRET = process.env.NFC_SECRET || 'nfc_shared_secret';

export default async function handler(req, res) {
    await dbConnect();

    // This endpoint could be used to create/update the user’s NFC token
    if (req.method === 'POST') {
        const { token } = req.body; // This is the user’s web JWT from /auth/login
        if (!token) {
            return res.status(401).json({ message: 'Missing user token' });
        }
        try {
            // Verify user’s web JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate a short-lifetime NFC token or reuse user’s authToken 
            // For example:
            const nfcToken = jwt.sign({ userId: user._id }, NFC_SECRET, { expiresIn: '7d' });

            // Store in user document
            user.authToken = nfcToken;
            await user.save();

            // Return the NFC token that the client can then write to the NFC chip
            return res.status(200).json({ message: 'NFC token generated', nfcToken });
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}