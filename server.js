const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configDB/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");

dotenv.config();

const app = express();


connectDB();


app.use(express.json());

app.use("/", authRoutes);  

app.get("/openapi.json", (req, res) => {
  res.status(200).json({
    openapi: "3.0.0",
    info: { title: "Notes App API", version: "1.0.0", description: "Multi-user notes backend" },
    paths: {
      "/register": {
        post: {
          summary: "Register a new user",
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } }, required: ["email", "password"] } } } },
          responses: { 201: { description: "Registered successfully" }, 400: { description: "Validation error" }, 409: { description: "Email already registered" } },
        },
      },
      "/login": {
        post: {
          summary: "Login and get JWT",
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } }, required: ["email", "password"] } } } },
          responses: { 200: { description: "Returns access_token" }, 401: { description: "Invalid credentials" } },
        },
     },
  }
});
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});