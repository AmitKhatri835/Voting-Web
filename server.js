const express = require("express");
const app = express();
require('dotenv').config();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); //req.json
const db = require("./db"); // Import the database connection
// const passport = require("./auth");
const PORT = process.env.PORT || 3000;



// import the router files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

// use the router files
app.use("/user", userRoutes); // Use the user routes for handling requests to /user
app.use("/candidate", candidateRoutes); // Use the candidate routes for handling requests to /candidate



app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
