const TrackDaySchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningTrack",
    required: true
  },
  dayNumber: {
    type: Number,
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
  estimatedTime: {
    type: Number,
    required: true // minutes
  },
  learningObjectives: [String]
}, {
  timestamps: true
});