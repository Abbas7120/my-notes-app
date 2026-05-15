const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configDB/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const notesRoutes = require("./routes/notesRoutes");
const { searchNotes } = require("./controllers/notesController");


dotenv.config();

const app = express();


connectDB();


app.use(express.json());

app.use("/", authRoutes);  
app.use("/notes", notesRoutes);

// GET /search?q=keyword 
app.get("/search", protect, searchNotes);

// GET /about
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Your Name",
    email: "youremail@example.com",
    "my features" : {
      "Pin / Unpin Notes": "PATCH /notes/:id/pin — Lets users pin important notes so they appear at the top of the list. Toggling again unpins it. Chose this because it's a practical quality-of-life feature, just like Google Keep, and very simple to implement cleanly.",
      "Pagination": "GET /notes?page=1&limit=10 — Notes list is paginated so the API doesn't return thousands of notes at once. Returns total count and total pages alongside the data.",
      "Full-text Search": "GET /search?q=keyword — MongoDB text index on title + content lets users search all their accessible notes. Results sorted by relevance score.",
    },
  });
});



// GET /openapi.json
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
      "/notes": {
        get: {
          summary: "Get all notes (paginated)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }],
          responses: { 200: { description: "List of notes" }, 401: { description: "Unauthorized" } },
        },
        post: {
          summary: "Create a note",
          security: [{ bearerAuth: [] }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } }, required: ["title", "content"] } } } },
          responses: { 201: { description: "Note created" } },
        },
      },
      "/notes/{id}": {
        get: { summary: "Get note by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Note data" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } } },
        put: { summary: "Update a note", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } } } } } }, responses: { 200: { description: "Updated note" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } } },
        delete: { summary: "Delete a note", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 204: { description: "Deleted" } } },
      },
      "/notes/{id}/share": {
        post: {
          summary: "Share note with a user",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { share_with_email: { type: "string" } }, required: ["share_with_email"] } } } },
          responses: { 200: { description: "Shared" }, 404: { description: "User or note not found" } },
        },
      },
      "/notes/{id}/pin": {
        patch: { summary: "Toggle pin/unpin note (custom feature)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Pin toggled" } } },
      },
      "/search": {
        get: { summary: "Full-text search notes", security: [{ bearerAuth: [] }], parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Matching notes" } } },
      },
      "/about": {
        get: { summary: "About this project", responses: { 200: { description: "Dev info" } } },
      },
    },
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});