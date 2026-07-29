const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // optional context
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

// Fast lookup of "do these two users already have a conversation".
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);