const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configDB/db");


dotenv.config();

const app = express();


connectDB();


app.use(express.json());


app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});