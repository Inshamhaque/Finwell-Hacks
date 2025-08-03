const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningTrack",
    required: true
  },
  // Progress tracking
  currentDay: {
    type: Number,
    default: 1
  },
  currentSection: {
    type: Number,
    default: 1
  },
  overallProgress: {
    type: Number,
    default: 0, // 0-100
    min: 0,
    max: 100
  },
  dayProgress: {
    type: Number,
    default: 0, // 0-100
    min: 0,
    max: 100
  },
  // Status
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed", "paused"],
    default: "not_started"
  },
  startedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Performance metrics
  timeSpent: {
    type: Number,
    default: 0 // minutes
  },
  averageQuizScore: {
    type: Number,
    default: 0
  },
  strongAreas: [String],
  weakAreas: [String]
}, {
  timestamps: true
});