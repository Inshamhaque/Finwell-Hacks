const QuizSchema = new mongoose.Schema({
  dayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrackDay",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  passingScore: {
    type: Number,
    default: 70, // 0-100
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number,
    default: 30 // minutes
  },
  // Settings
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  allowRetakes: {
    type: Boolean,
    default: true
  },
  maxAttempts: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});