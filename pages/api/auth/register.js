import { dbConnect } from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password are required.' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save user
        const newUser = await User.create({
            email,
            password: hashedPassword,
            sensorData: {},
        });

        return res.status(201).json({ message: 'User registered!', user: { email: newUser.email } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}