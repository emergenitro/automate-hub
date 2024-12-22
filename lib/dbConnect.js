// lib/dbConnect.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plantcar';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**

Global is used here to maintain a cached connection during dev.
This prevents connections from growing too large over frequent HMR.
*/
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
export async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = { bufferCommands: false };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then(m => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}