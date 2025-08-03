const ChatMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatConversation",
    required: true
  },
  // Message content
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "options", "quiz", "content_suggestion"],
    default: "text"
  },
  // AI response data
  options: [String], // for AI messages with quick replies
  relatedContent: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  },
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});