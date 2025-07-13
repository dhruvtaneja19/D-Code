const connectDB = require('./config/db');

const testConnection = async () => {
  try {
    await connectDB();
    console.log('✅ Database connection test successful!');
    console.log('✅ Your MongoDB Atlas database is now connected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  }
};

testConnection();
