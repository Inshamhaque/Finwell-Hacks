import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, BookOpen, Calendar, BarChart3, Gem, Coins, TrendingUp, Brain, Award, Play, ChevronRight, RotateCcw, Zap, Clock, Target, CheckCircle2 } from 'lucide-react';
import axios from "axios";

const BACKEND_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

const learningTracks = [
  {
    id: 1,
    title: "Stock Market Fundamentals",
    description: "Master the basics of stock trading and investment",
    duration: "7 days",
    difficulty: "Beginner",
    icon: TrendingUp,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Cryptocurrency Trading",
    description: "Learn digital asset trading strategies",
    duration: "10 days",
    difficulty: "Intermediate",
    icon: Brain,
    color: "bg-purple-500"
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Protect your investments with proper risk strategies",
    duration: "5 days",
    difficulty: "Intermediate",
    icon: Award,
    color: "bg-green-500"
  },
  {
    id: 4,
    title: "Financial Planning & Budgeting",
    description: "Build a solid financial plan and learn how to manage a budget effectively",
    duration: "7 days",
    difficulty: "Beginner",
    icon: Calendar,
    color: "bg-yellow-500"
  },
  {
    id: 5,
    title: "Technical Analysis for Traders",
    description: "Understand charts, indicators, and patterns to forecast price movements",
    duration: "8 days",
    difficulty: "Advanced",
    icon: BarChart3,
    color: "bg-red-500"
  },
  {
    id: 6,
    title: "Value Investing Like Warren Buffett",
    description: "Learn principles of long-term investing in undervalued companies",
    duration: "6 days",
    difficulty: "Intermediate",
    icon: Gem,
    color: "bg-emerald-600"
  },
  {
    id: 7,
    title: "Building Passive Income Streams",
    description: "Explore financial tools and strategies to earn income with minimal effort",
    duration: "7 days",
    difficulty: "Beginner",
    icon: Coins,
    color: "bg-amber-600"
  }
];

function getRandomTracks(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function DailyLearn() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizState, setQuizState] = useState('none'); // 'none', 'active', 'completed'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [learningState, setLearningState] = useState('idle'); // 'idle', 'learning', 'quiz', 'completed'
  const [tracks, setTracks] = useState([]); // For progress carousel
  const [loading,setLoading] = useState(false)
  const messagesEndRef = useRef(null);

  const [userData, setUserData] = useState({
    name: "Alex",
    streak: 5,
    currentTrack: "Stock Market Basics",
    currentDay: 2,
    totalDays: 7,
    dayProgress: 65,
    lastActive: "yesterday",
    completedTopics: ["Stock Exchanges", "Market Participants"],
    currentTopic: "Market Orders",
    nextTopic: "Technical Analysis"
  });

  const quickTopics = [
    "Options Trading", "Technical Analysis", "Market Psychology", 
    "Portfolio Management", "ETFs vs Mutual Funds", "Dividend Investing"
  ];

  useEffect(() => {
    if (userData.lastActive === "yesterday") {
      const welcomeMessage = {
        id: 1,
        text: `Welcome back, ${userData.name}! Yesterday you were learning about '${userData.currentTrack}' - Day ${userData.currentDay} of your track. Your progress on '${userData.currentTopic}' is at ${userData.dayProgress}%. Ready to continue?`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ['Continue Learning', 'Review Previous Day', 'Switch Topics', 'Take Quiz']
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch specific track data by ID
  const fetchTrackData = async (trackId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/daily-learn/track/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.track;
    } catch (error) {
      console.error('Error fetching track data:', error);
      return null;
    }
  };

  const startLearningTrack = async (track) => {
    try {
      // If it's a predefined track, generate it first
      if (!track._id) {
        setIsTyping(true);
        setLoading(true)
        // currently days is default to 7 now.... need to modify this 
        const response = await axios.post(`${BACKEND_URL}/daily-learn/randomTracks`, {
          topic: track.title,
          description: track.description,
          level: track.difficulty,
          totalDays: parseInt(track.duration.split(' ')[0])
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLoading(false)
        
        if (response.data.track) {
          track = response.data.track;
        }
      }

      setCurrentTrack(track);
      setLearningState('learning');
      setIsTyping(false);
      
      const currentDay = track.days.find(day => day.dayNumber === track.currentDay);
      
      const welcomeMessage = {
        id: Date.now(),
        text: `Great choice! Let's start "${track.title}". This is a ${track.totalDays}-day ${track.difficulty.toLowerCase()} course. 

Today we'll be learning about: **${currentDay?.topic || 'Getting Started'}**

Are you ready to begin Day ${track.currentDay}?`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ['Start Learning', 'Tell me more about this track', 'Switch tracks']
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error starting learning track:', error);
      setIsTyping(false);
    }
  };

  const startDayContent = (dayData) => {
    const contentMessage = {
      id: Date.now(),
      text: `**${dayData.topic}**

${dayData.content}

Take your time to read and understand this content. When you're ready, I'll test your understanding with a quick quiz!`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: ['I understand, start the quiz', 'Explain this more', 'Give me examples']
    };
    
    setMessages(prev => [...prev, contentMessage]);
  };

  const startQuiz = (dayData) => {
    setCurrentQuiz(dayData.quiz);
    setQuizState('active');
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setLearningState('quiz');
    
    const quizMessage = {
      id: Date.now(),
      text: `Perfect! Let's test your knowledge with a ${dayData.quiz.questions.length}-question quiz.

**Question 1 of ${dayData.quiz.questions.length}:**

${dayData.quiz.questions[0].question}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: dayData.quiz.questions[0].options,
      isQuiz: true
    };
    
    setMessages(prev => [...prev, quizMessage]);
  };

  const handleQuizAnswer = (selectedAnswer) => {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    const newAnswers = [...quizAnswers, { 
      question: currentQuestion.question, 
      selected: selectedAnswer, 
      correct: currentQuestion.answer,
      isCorrect 
    }];
    setQuizAnswers(newAnswers);

    // Show feedback for current answer
    const feedbackMessage = {
      id: Date.now(),
      text: isCorrect 
        ? `✅ Correct! "${selectedAnswer}" is the right answer.` 
        : `❌ Not quite. The correct answer is "${currentQuestion.answer}".`,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, feedbackMessage]);

    // Move to next question or finish quiz
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        const nextQuestion = currentQuiz.questions[nextIndex];
        const nextQuestionMessage = {
          id: Date.now() + 1,
          text: `**Question ${nextIndex + 1} of ${currentQuiz.questions.length}:**

${nextQuestion.question}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          options: nextQuestion.options,
          isQuiz: true
        };
        
        setMessages(prev => [...prev, nextQuestionMessage]);
      }, 1500);
    } else {
      // Quiz completed
      setTimeout(() => {
        completeQuiz(newAnswers);
      }, 1500);
    }
  };

  const completeQuiz = async (answers) => {
    setQuizState('completed');
    
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / answers.length) * 100);
    const passed = score >= 70;

    const completionMessage = {
      id: Date.now(),
      text: `🎉 Quiz completed! 

**Your Score: ${score}% (${correctAnswers}/${answers.length} correct)**

${passed 
  ? `Congratulations! You've successfully completed Day ${currentTrack.currentDay} of "${currentTrack.title}". 

Your progress has been saved and you can now move to the next day!`
  : `You scored below 70%. Don't worry! Review the material and try again when you're ready.`
}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: passed 
        ? ['Continue to next day', 'Review today\'s content', 'View my progress']
        : ['Review content', 'Retake quiz', 'Get help']
    };

    setMessages(prev => [...prev, completionMessage]);

    if (passed) {
      // Update progress in backend
      try {
        await axios.post(`${BACKEND_URL}/daily-learn/complete-day`, {
          trackId: currentTrack._id,
          dayNumber: currentTrack.currentDay,
          score: score
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Update local state
        setCurrentTrack(prev => ({
          ...prev,
          currentDay: Math.min(prev.currentDay + 1, prev.totalDays),
          days: prev.days.map(day => 
            day.dayNumber === prev.currentDay 
              ? { ...day, completed: true }
              : day
          )
        }));
        
        setLearningState('completed');
        
        // Refresh tracks in progress carousel
        fetchAllTracks();
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const fetchAllTracks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/daily-learn/allTracks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data?.tracks) {
        setTracks(response.data.tracks);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      if (aiResponse) {
        setMessages(prev => [...prev, aiResponse]);
      }
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (userInput) => {
    if (quizState === 'active') {
      // Handle quiz answers
      handleQuizAnswer(userInput);
      return null;
    }

    const responses = {
      "Start Learning": () => {
        if (currentTrack && currentTrack.days) {
          const currentDay = currentTrack.days.find(day => day.dayNumber === currentTrack.currentDay);
          if (currentDay) {
            startDayContent(currentDay);
            return null;
          }
        }
      },
      "I understand, start the quiz": () => {
        if (currentTrack && currentTrack.days) {
          const currentDay = currentTrack.days.find(day => day.dayNumber === currentTrack.currentDay);
          if (currentDay && currentDay.quiz) {
            startQuiz(currentDay);
            return null;
          }
        }
      },
      "Continue Learning": {
        text: "Perfect! Let's continue with Market Orders. You were learning about Stop Loss Orders. Here's a quick recap: A stop loss order automatically sells your stock when it reaches a certain price to limit losses. Ready to learn about Limit Orders?",
        options: ["Yes, let's continue", "I need a recap", "Show me examples"]
      },
      "Review Previous Day": {
        text: "Great idea! Yesterday we covered Stock Exchanges and Market Participants. Here's a quick 2-minute summary: Stock exchanges are marketplaces where stocks are bought and sold, with key players including retail investors, institutional investors, and market makers. Feeling refreshed?",
        options: ["Yes, continue today's lesson", "I need more review", "Take a quiz"]
      },
      "Switch Topics": {
        text: "No problem! I'll save your current progress. What interests you today? You could explore Cryptocurrency Trading, Risk Management, or start a completely new topic. What sounds interesting?",
        options: ["Cryptocurrency Trading", "Risk Management", "Portfolio Management", "Surprise me!"]
      },
      "Take Quiz": {
        text: "Excellent! Let's test your knowledge of Stock Exchanges. Question 1: What is the primary function of a stock exchange? A) To set stock prices B) To provide a marketplace for trading C) To give investment advice D) To guarantee profits",
        options: ["A", "B", "C", "D"]
      },
      "Continue to next day": {
        text: "Excellent progress! You're building a strong foundation in investment knowledge. Your next lesson will be available tomorrow, or you can continue with another track if you'd like!",
        options: ["View available tracks", "Check my progress", "End session"]
      }
    };

    if (responses[userInput]) {
      if (typeof responses[userInput] === 'function') {
        return responses[userInput]();
      }
      return {
        id: Date.now(),
        text: responses[userInput].text,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: responses[userInput].options || []
      };
    }

    // Handle quick topics
    if (userInput.startsWith("I want to learn about")) {
      const topic = userInput.replace("I want to learn about ", "");
      return {
        id: Date.now(),
        text: `Great choice! Let me explain ${topic} in simple terms. ${topic} is an important concept in finance. Would you like me to start with the basics or dive into more advanced concepts?`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ["Start with basics", "Advanced concepts", "Show examples", "Related topics"]
      };
    }

    return {
      id: Date.now(),
      text: "I'm here to help you learn! You can ask me about any topic, start a new learning track, or continue where you left off. What would you like to explore?",
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: ["Start new track", "Continue learning", "Ask a question"]
    };
  };

  const handleOptionClick = (option) => {
    if (quizState === 'active') {
      handleQuizAnswer(option);
    } else {
      handleSendMessage(option);
    }
  };

  const continueExistingTrack = async (track) => {
    setCurrentTrack(track);
    setLearningState('learning');
    
    const currentDay = track.days.find(day => day.dayNumber === track.currentDay);
    
    const continueMessage = {
      id: Date.now(),
      text: `Welcome back to "${track.title}"! 

You're on Day ${track.currentDay} of ${track.totalDays}. Today's topic: **${currentDay?.topic || 'Continue Learning'}**

${currentDay?.completed ? 'You\'ve completed this day. Would you like to review or move to the next day?' : 'Ready to continue where you left off?'}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: currentDay?.completed 
        ? ['Move to next day', 'Review this day', 'Take quiz again']
        : ['Continue learning', 'Review content', 'Start quiz']
    };
    
    setMessages([continueMessage]);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">Daily Learn</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-700 font-medium">{userData.streak} day streak</span>
              </div>
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <Target className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-700 font-medium">Day {userData.currentDay}/7</span>
              </div>
            </div>
          </div>
          
          {/* Current Progress Card */}
          <CurrentProgressCarousel 
            setIsChatOpen={setIsChatOpen} 
            tracks={tracks}
            setTracks={setTracks}
            onContinueTrack={continueExistingTrack}
          />
        </div>

        {/* Learning Tracks */}
        <LearningTracks startLearningTrack={startLearningTrack} />
        
        {/* Quick Topics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickTopics.map((topic, index) => (
              <button 
                key={index}
                onClick={() => {
                  handleSendMessage(`I want to learn about ${topic}`);
                  setIsChatOpen(true);
                }}
                className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-400 rounded-lg p-3 text-center transition-all duration-200 group backdrop-blur-sm bg-opacity-80"
              >
                <div className="text-sm font-medium text-gray-300 group-hover:text-blue-400">
                  {topic}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

          
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3">
            <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span className="text-lg font-medium">Generating your track...</span>
          </div>
        </div>
      )}

      {/* Chatbot */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-800 rounded-xl shadow-2xl border border-gray-700 flex flex-col backdrop-blur-lg bg-opacity-95">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              <span className="font-medium">FinBot - AI Tutor</span>
              {learningState !== 'idle' && (
                <span className="ml-2 text-xs  bg-opacity-20 px-2 py-1 rounded-full">
                  {learningState === 'learning' && 'Learning'}
                  {learningState === 'quiz' && 'Quiz Mode'}
                  {learningState === 'completed' && 'Completed'}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress indicator for quiz */}
          {quizState === 'active' && (
            <div className="bg-gray-700 p-2">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Quiz Progress</span>
                <span>{currentQuestionIndex + 1}/{currentQuiz.questions.length}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-100 shadow-lg'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className={`block w-full text-left text-xs rounded px-2 py-1 transition-colors ${
                            message.isQuiz 
                              ? 'bg-blue-600 bg-opacity-20 hover:bg-opacity-40 border border-blue-400'
                              : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={quizState === 'active' ? "Use the buttons above to answer..." : "Ask me anything about finance..."}
                disabled={quizState === 'active'}
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || quizState === 'active'}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LearningTracks({ startLearningTrack }) {
  const [displayedTracks, setDisplayedTracks] = useState(() => getRandomTracks(learningTracks, 3));
  const [showModal, setShowModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLevel, setCustomLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const shuffleTracks = () => {
    setDisplayedTracks(getRandomTracks(learningTracks, 3));
  };

  const handleGenerateCustomTrack = async () => {
    if (!customName.trim() || !customLevel) {
      alert("Please fill in both fields");
      return;
    }

    setShowModal(false);
    setLoading(true);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/daily-learn/randomTracks`, {
        level: customLevel,
        topic: customName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setLoading(false);
      
      if (response.data.track) {
        // Start the generated track immediately
        startLearningTrack(response.data.track);
      }
      
      // Reset form
      setCustomName("");
      setCustomLevel("");
    } catch (error) {
      console.error('Error generating custom track:', error);
      setLoading(false);
      alert("Failed to generate custom track. Please try again.");
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Learning Tracks</h2>
        <div className="space-x-4">
          <button
            onClick={shuffleTracks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Shuffle Tracks
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Generate Custom Module
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTracks.map((track) => {
          const IconComponent = track.icon;
          return (
            <div
              key={track.id}
              className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-blue-500/20 hover:shadow-2xl transition-all duration-300 cursor-pointer group backdrop-blur-sm bg-opacity-80"
              onClick={() => startLearningTrack(track)}
            >
              <div className={`${track.color} h-2`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${track.color} p-3 rounded-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                    {track.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {track.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">{track.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {track.duration}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3">
            <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span className="text-lg font-medium">Generating your track...</span>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
            <h3 className="text-white text-xl font-semibold mb-4">Generate Custom Track</h3>
            <input
              type="text"
              placeholder="Module Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 outline-none"
            />
            <select
              value={customLevel}
              onChange={(e) => setCustomLevel(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white outline-none"
            >
              <option value="">Select Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCustomTrack}
                disabled={!customName.trim() || !customLevel}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CurrentProgressCarousel({ setIsChatOpen, tracks, setTracks, onContinueTrack }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/daily-learn/allTracks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data?.tracks) {
          setTracks(response.data.tracks);
        }
      } catch (err) {
        console.error("Error fetching tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [setTracks]);

  if (loading) return <div className="text-white">Loading your progress...</div>;
  if (!tracks.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Your Ongoing Modules</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 pb-2">
        {tracks.map((track) => {
          const progress = Math.floor((track.currentDay / track.totalDays) * 100);

          return (
            <div
              key={track._id}
              className="min-w-[320px] bg-gray-800 rounded-xl shadow-2xl p-6 border-l-4 border-blue-400 backdrop-blur-sm bg-opacity-80 flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Continue Your Journey</h3>
                  <p className="text-gray-300">{track.title}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{progress}%</div>
                  <div className="text-sm text-gray-400">Day {track.currentDay} Progress</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => onContinueTrack(track)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center transform hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </button>
                <button
                  onClick={() => {
                    onContinueTrack({
                      ...track,
                      currentDay: Math.max(1, track.currentDay - 1)
                    });
                  }}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Review Day {Math.max(1, track.currentDay - 1)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}