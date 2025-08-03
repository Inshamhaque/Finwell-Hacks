const DaySectionSchema = new mongoose.Schema({
  dayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrackDay",
    required: true
  },
  sectionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ["text", "video", "interactive", "simulation"],
    required: true
  },
  estimatedTime: {
    type: Number,
    required: true // minutes
  },
  // Rich content
  videoUrl: {
    type: String,
    default: null
  },
  interactiveElements: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  attachments: [String] // URLs
}, {
  timestamps: true
});