const Note = require("../configDB/Note");
const User = require("../configDB/User");

const formatNote = (note) => ({
  id: note._id,
  title: note.title,
  content: note.content,
  isPinned: note.isPinned,
  created_at: note.createdAt,
  updated_at: note.updatedAt,
});

// GET /notes
const getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
    };

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 }) // pinned notes appear first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalNotes: total,
      notes: notes.map(formatNote),
    });
  } catch (error) {
    console.error("Get all notes error:", error.message);
    res.status(500).json({ message: "Could not fetch notes." });
  }
};

// GET /notes/:id
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    const isOwner = note.owner.toString() === req.user._id.toString();
    const isShared = note.sharedWith.some(
      (uid) => uid.toString() === req.user._id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "You don't have access to this note." });
    }

    res.status(200).json(formatNote(note));
  } catch (error) {
    console.error("Get note error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid note ID." });
    }
    res.status(500).json({ message: "Could not fetch note." });
  }
};

// POST /notes
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: "Title cannot exceed 200 characters." });
    }

    const note = await Note.create({
      title,
      content,
      owner: req.user._id,
    });

    res.status(201).json(formatNote(note));
  } catch (error) {
    console.error("Create note error:", error.message);
    res.status(500).json({ message: "Could not create note." });
  }
};

// PUT /notes/:id
const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({ message: "Provide at least title or content to update." });
    }

    if (title && title.length > 200) {
      return res.status(400).json({ message: "Title cannot exceed 200 characters." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can update this note." });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    await note.save();

    res.status(200).json(formatNote(note));
  } catch (error) {
    console.error("Update note error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid note ID." });
    }
    res.status(500).json({ message: "Could not update note." });
  }
};

// DELETE /notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this note." });
    }

    await note.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error("Delete note error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid note ID." });
    }
    res.status(500).json({ message: "Could not delete note." });
  }
};

// POST /notes/:id/share
const shareNote = async (req, res) => {
  try {
    const { share_with_email } = req.body;

    if (!share_with_email) {
      return res.status(400).json({ message: "share_with_email is required." });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can share this note." });
    }

    if (share_with_email === req.user.email) {
      return res.status(400).json({ message: "You can't share a note with yourself." });
    }

    const targetUser = await User.findOne({ email: share_with_email });
    if (!targetUser) {
      return res.status(404).json({ message: "No user found with that email." });
    }

    const alreadyShared = note.sharedWith.some(
      (uid) => uid.toString() === targetUser._id.toString()
    );
    if (alreadyShared) {
      return res.status(400).json({ message: "Note is already shared with this user." });
    }

    note.sharedWith.push(targetUser._id);
    await note.save();

    res.status(200).json({ message: `Note shared successfully with ${share_with_email}.` });
  } catch (error) {
    console.error("Share note error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid note ID." });
    }
    res.status(500).json({ message: "Could not share note." });
  }
};

// PATCH /notes/:id/pin — Custom Feature: Pin/Unpin a note
const togglePinNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can pin/unpin this note." });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      message: `Note ${note.isPinned ? "pinned" : "unpinned"} successfully.`,
      ...formatNote(note),
    });
  } catch (error) {
    console.error("Pin note error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid note ID." });
    }
    res.status(500).json({ message: "Could not pin/unpin note." });
  }
};

// GET /search?q=keyword — Stretch Goal
const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query 'q' is required." });
    }

    const notes = await Note.find({
      $and: [
        { $or: [{ owner: req.user._id }, { sharedWith: req.user._id }] },
        { $text: { $search: q } },
      ],
    }).sort({ score: { $meta: "textScore" } });

    res.status(200).json({ results: notes.length, notes: notes.map(formatNote) });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: "Search failed." });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  togglePinNote,
  searchNotes,
};