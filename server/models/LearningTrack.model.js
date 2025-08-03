import mongoose from "mongoose"
const LearningTrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true
  },
  estimatedDuration: {
    type: String,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Content metadata
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningTrack"
  }],
  learningObjectives: [String],
  tags: [String],
  coverImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});
