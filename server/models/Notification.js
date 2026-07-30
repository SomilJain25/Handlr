const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'new_proposal',
        'proposal_accepted',
        'proposal_rejected',
        'new_message',
        'new_review',
        'project_completed',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // client-side route to navigate to on click, e.g. /jobs/:id
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // job/proposal/conversation id
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);