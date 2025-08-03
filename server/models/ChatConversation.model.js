const ChatConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Conversation metadata
  title: {
    type: String,
    default: "New Conversation"
  },
  topic: {
    type: String,
    default: "General"
  },
  context: {
    currentTrack: String,
    currentDay: Number,
    userLevel: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});