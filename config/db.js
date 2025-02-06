const mongoose = require("mongoose");
require('dotenv').config();
const DB_URI = process.env.MONGO_URI;
// console.log(DB_URI);
    mongoose.connect(DB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
  
  // Export the connection for use in other parts of your application
  module.exports = mongoose.connection;