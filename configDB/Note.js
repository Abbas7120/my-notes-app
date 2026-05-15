const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPinned: {
      // Custom feature — users can pin important notes
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Full-text search index on title + content (stretch goal)
noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);