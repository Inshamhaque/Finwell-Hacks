import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, BookOpen, TrendingUp, Brain, Award, Play, ChevronRight, RotateCcw, Zap, Clock, Target } from 'lucide-react';

export default function DailyLearn() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock user data - replace with API calls
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

  const learningTracks = [
    {
      id: 1,
      title: "Stock Market Fundamentals",
      description: "Master the basics of stock trading and investment",
      duration: "7 days",
      difficulty: "Beginner",
      icon: TrendingUp,
      progress: 65,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Cryptocurrency Trading",
      description: "Learn digital asset trading strategies",
      duration: "10 days",
      difficulty: "Intermediate",
      icon: Brain,
      progress: 0,
      color: "bg-purple-500"
    },
    {
      id: 3,
      title: "Risk Management",
      description: "Protect your investments with proper risk strategies",
      duration: "5 days",
      difficulty: "Intermediate",
      icon: Award,
      progress: 0,
      color: "bg-green-500"
    }
  ];

  const quickTopics = [
    "Options Trading", "Technical Analysis", "Market Psychology", 
    "Portfolio Management", "ETFs vs Mutual Funds", "Dividend Investing"
  ];

  useEffect(() => {
    // Initialize chat with welcome message for returning users
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const responses = {
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
      }
    };

    return {
      id: Date.now(),
      text: responses[userInput]?.text || "I understand you're interested in learning more about finance. Could you tell me what specific topic you'd like to explore today? I can help with stocks, crypto, trading strategies, or any other financial concept!",
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: responses[userInput]?.options || ["Stock Market Basics", "Cryptocurrency", "Risk Management", "Technical Analysis"]
    };
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option);
  };

  const startLearningTrack = (track) => {
    setCurrentTrack(track);
    const message = {
      id: Date.now(),
      text: `Great choice! Starting "${track.title}" track. This is a ${track.duration} ${track.difficulty.toLowerCase()} course. Let's begin with the fundamentals. Are you ready to start Day 1?`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: ["Start Day 1", "Tell me more about this track", "Choose different difficulty"]
    };
    setMessages(prev => [...prev, message]);
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
          {userData.currentTrack && (
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-l-4 border-blue-400 backdrop-blur-sm bg-opacity-80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Continue Your Journey</h3>
                  <p className="text-gray-300">{userData.currentTrack} - {userData.currentTopic}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{userData.dayProgress}%</div>
                  <div className="text-sm text-gray-400">Day {userData.currentDay} Progress</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${userData.dayProgress}%` }}
                ></div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center transform hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </button>
                <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Review Day {userData.currentDay - 1}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Learning Tracks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Learning Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningTracks.map((track) => {
              const IconComponent = track.icon;
              return (
                <div key={track.id} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-blue-500/20 hover:shadow-2xl transition-all duration-300 cursor-pointer group backdrop-blur-sm bg-opacity-80" onClick={() => startLearningTrack(track)}>
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
                      <span className="text-sm font-medium text-gray-300">{track.progress}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${track.color} h-2 rounded-full transition-all duration-300 shadow-lg`} 
                        style={{ width: `${track.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-800 rounded-xl shadow-2xl border border-gray-700 flex flex-col backdrop-blur-lg bg-opacity-95">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              <span className="font-medium">FinBot - AI Tutor</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-100 shadow-lg'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left text-xs bg-white bg-opacity-10 hover:bg-opacity-20 rounded px-2 py-1 transition-colors"
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
                placeholder="Ask me anything about finance..."
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
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