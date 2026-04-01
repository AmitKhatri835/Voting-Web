const mongoose = require("mongoose")
require('dotenv').config();

//  define the mongodb connection URL
const mongoURL = process.env.MONGODB_URL;

// setup mongoDB connection
mongoose.connect(mongoURL);

// get the default connection
// mongoose maintain a default connection object representing the mongoDB connection
const db = mongoose.connection;

// define event listners for database connection
db.on("connected", () => {
  console.log("Connected To MongoDB Server");
});

db.on("error", (err) => {
  console.log("MongoDB Connection Error: ", err);
});

db.on("disconnected", () => {
  console.log("MongoDB Server Disconnected");
});


// Export the database connection
module.exports = db;
