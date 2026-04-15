import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const globalWithMongoose = global as typeof globalThis & {
  _mongooseConn?: typeof mongoose;
};

export async function connectDB() {
  if (globalWithMongoose._mongooseConn) {
    return globalWithMongoose._mongooseConn;
  }
  const conn = await mongoose.connect(MONGO_URI);
  globalWithMongoose._mongooseConn = conn;
  return conn;
}

// Eagerly connect when this module is first imported.
// Mongoose buffers commands by default so queries issued before the connection
// is ready are queued and executed once it resolves.
void connectDB();

// Export the mongoose client for the better-auth mongodb adapter
export { mongoose };
