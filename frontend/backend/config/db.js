const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    }

    console.log('MongoDB URI not configured. Trying in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'visionxstore' },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected: ${uri}`);
    global.__mongod = mongod;
    return true;
  } catch (error) {
    console.warn(`MongoDB not available: ${error.message}`);
    console.warn('Starting in demo mode. Configure MONGODB_URI to persist data.');
    return false;
  }
};

module.exports = connectDB;