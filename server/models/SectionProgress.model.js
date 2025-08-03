const SectionProgressSchema = new mongoose.Schema({
  userProgressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProgress",
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DaySection",
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0 // minutes
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});
