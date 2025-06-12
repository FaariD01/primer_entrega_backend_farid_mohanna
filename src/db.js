const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://faridmohanna:faridmohanna@clusterfaridmohanna.s8335rx.mongodb.net/?retryWrites=true&w=majority&appName=ClusterFaridMohanna', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
};

module.exports = connectDB;
