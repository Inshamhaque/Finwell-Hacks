const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  // Results
  score: {
    type: Number,
    required: true, // 0-100
    min: 0,
    max: 100
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true // seconds
  },
  // Status
  isPassed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  // Detailed answers
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizQuestion"
    },
    userAnswer: String,
    isCorrect: Boolean
  }]
}, {
  timestamps: true
});