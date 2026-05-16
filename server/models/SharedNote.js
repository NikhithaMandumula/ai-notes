import mongoose from 'mongoose';

const sharedNoteSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'dismissed'],
      default: 'pending',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent sharing same note to same user twice
sharedNoteSchema.index({ noteId: 1, toUserId: 1 }, { unique: true });
// Fast lookups for sent/received queries
sharedNoteSchema.index({ fromUserId: 1, createdAt: -1 });
sharedNoteSchema.index({ toUserId: 1, status: 1, createdAt: -1 });

const SharedNote = mongoose.model('SharedNote', sharedNoteSchema);

export default SharedNote;
