const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  togglePinNote,
} = require("../controllers/notesController");

// All routes below require a valid JWT
router.use(protect);

router.get("/", getAllNotes);
router.post("/", createNote);

router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/share", shareNote);
router.patch("/:id/pin", togglePinNote); // Custom feature

module.exports = router;