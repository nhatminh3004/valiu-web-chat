const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        lastView: {
          type: Date,
        },
        isNotify: {
          type: Boolean,
          default: true,
        },
      },
    ],
    name: {
      type: String,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Conversations", conversationSchema);
