import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connecté: ${conn.connection.host}`.cyan.underline);

    // Handle errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`Erreur MongoDB: ${err.message}`.red.underline.bold);
    });

  } catch (error) {
    console.error(`Erreur: ${error.message}`.red.underline.bold);
    console.error(`Stack: ${error.stack}`.red);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;

