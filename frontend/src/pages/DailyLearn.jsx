import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, BookOpen, Calendar, BarChart3, Gem, Coins, TrendingUp, Brain, Award, Play, ChevronRight, RotateCcw, Zap, Clock, Target, CheckCircle2 } from 'lucide-react';
import axios from "axios";
import { Navbar, NavbarLogo, NavBody, NavItems, NavbarButton } from '../components/ui/resizable-navbar';
import { toast,ToastContainer } from "react-toast"
import ReactMarkdown from 'react-markdown';


const BACKEND_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.OPENAI_API_KEY 
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

// Enhanced AI chat function using RAG
const getAIResponse = async (userMessage, context = null) => {
  try {
    let systemPrompt = `You are FinBot, a friendly financial education tutor. You help users learn about finance through engaging conversations.

Rules:
1. Keep responses conversational and engaging
2. Provide practical examples when explaining concepts
3. If user asks about learning tracks, suggest they browse available options
4. If user wants to continue a specific track, guide them to the learning content
5. Always be encouraging and supportive
6. Keep responses under 200 words for chat interface`;

    if (context) {
      systemPrompt += `\n\nContext: ${JSON.stringify(context)}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "I'm here to help you learn about finance! You can ask me questions about financial topics, start a new learning track, or continue with your current progress. What would you like to explore today?";
  }
};

// AI-driven learning content
const getAILearningContent = async (dayData) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial education tutor. Explain the given topic in a clear, engaging way with practical examples. Make it interactive and easy to understand. End with encouraging the user to take the quiz when they feel ready.' 
          },
          { 
            role: 'user', 
            content: `Teach me about: "${dayData.topic}"\n\nBase content: ${dayData.content}\n\nMake this engaging and include real-world examples.` 
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `**${dayData.topic}**\n\n${dayData.content}\n\nThis is a fundamental concept in finance. Take your time to understand it, and when you're ready, let me know if you'd like to take the quiz!`;
  }
};

export default function DailyLearn() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentDayData, setCurrentDayData] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const messagesEndRef = useRef(null);
  const lastScrollY = useRef(0);

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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startLearningTrack = async (track) => {
    try {
      setLoading(true);
      
      // If it's a predefined track, generate it first
      if (!track._id) {
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
        
        if (response.data.track) {
          track = response.data.track;
        }
      }

      setCurrentTrack(track);
      const currentDay = track.days.find(day => day.dayNumber === track.currentDay);
      setCurrentDayData(currentDay);
      
      setLoading(false);
      
      const welcomeMessage = {
        id: Date.now(),
        text: `Great choice! Let's start "${track.title}". This is a ${track.totalDays}-day ${track.difficulty.toLowerCase()} course.\n\nToday we'll be learning about: **${currentDay?.topic || 'Getting Started'}**\n\nAre you ready to begin Day ${track.currentDay}?`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ['Start Learning', 'Tell me more about this track']
      };
      
      setMessages([welcomeMessage]);
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error starting learning track:', error);
      setLoading(false);
    }
  };

  const continueExistingTrack = async (track) => {
    setCurrentTrack(track);
    
    const currentDay = track.days?.find(day => day.dayNumber === track.currentDay);
    setCurrentDayData(currentDay);
    
    const continueMessage = {
      id: Date.now(),
      text: `Welcome back to "${track.title}"!\n\nYou're on Day ${track.currentDay} of ${track.totalDays}. Today's topic: **${currentDay?.topic || `Day ${track.currentDay}`}**\n\n${currentDay?.completed ? 'You\'ve completed this day. Would you like to review or move to the next day?' : 'Ready to continue where you left off?'}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: currentDay?.completed 
        ? ['Move to next day', 'Review this day', 'Take quiz again']
        : ['Start Learning', 'Take Quiz', 'Ask a question']
    };
    
    setMessages([continueMessage]);
    setIsChatOpen(true);
  };

  const startLearningContent = async () => {
    if (!currentDayData) return;
    
    setIsTyping(true);
    
    try {
      const enhancedContent = await getAILearningContent(currentDayData);
      
      setIsTyping(false);
      
      const contentMessage = {
        id: Date.now(),
        text: enhancedContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ['Take Quiz', 'Ask a question', 'Explain more']
      };
      
      setMessages(prev => [...prev, contentMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error('Error getting learning content:', error);
    }
  };

  const startQuiz = () => {
    if (!currentDayData?.quiz) return;
    
    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    
    const quiz = currentDayData.quiz;
    const quizMessage = {
      id: Date.now(),
      text: `Perfect! Let's test your knowledge with a ${quiz.questions.length}-question quiz.\n\n**Question 1 of ${quiz.questions.length}:**\n\n${quiz.questions[0].question}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: quiz.questions[0].options,
      isQuiz: true
    };
    
    setMessages(prev => [...prev, quizMessage]);
  };

  const handleQuizAnswer = async (selectedAnswer) => {
    const quiz = currentDayData.quiz;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    const newAnswers = [...quizAnswers, { 
      question: currentQuestion.question, 
      selected: selectedAnswer, 
      correct: currentQuestion.answer,
      isCorrect 
    }];
    setQuizAnswers(newAnswers);

    // Add user's answer
    const userAnswerMessage = {
      id: Date.now(),
      text: selectedAnswer,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userAnswerMessage]);

    // Show feedback
    const feedbackMessage = {
      id: Date.now() + 1,
      text: isCorrect 
        ? `✅ Correct! "${selectedAnswer}" is the right answer.` 
        : `❌ Not quite. The correct answer is "${currentQuestion.answer}".`,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, feedbackMessage]);

    // Move to next question or finish quiz
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        const nextQuestion = quiz.questions[nextIndex];
        const nextQuestionMessage = {
          id: Date.now() + 2,
          text: `**Question ${nextIndex + 1} of ${quiz.questions.length}:**\n\n${nextQuestion.question}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          options: nextQuestion.options,
          isQuiz: true
        };
        
        setMessages(prev => [...prev, nextQuestionMessage]);
      }, 2000);
    } else {
      // Quiz completed
      setTimeout(() => {
        completeQuiz(newAnswers);
      }, 2000);
    }
  };

  const completeQuiz = async (answers) => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / answers.length) * 100);
    const passed = score >= 70;

    setIsTyping(true);

    try {
      if (passed) {
        // Call the complete-day API
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
        
        // Refresh tracks
        fetchAllTracks();
      }
      
      setIsTyping(false);
      setQuizMode(false);
      
      const completionMessage = {
        id: Date.now(),
        text: passed 
          ? `🎉 **Congratulations!**\n\n**Your Score: ${score}% (${correctAnswers}/${answers.length} correct)**\n\nYou've successfully completed Day ${currentDayData.dayNumber} of "${currentTrack.title}"!\n\n✅ Your progress has been saved\n🚀 ${currentTrack.currentDay < currentTrack.totalDays ? 'You can now move to the next day' : 'You\'ve completed the entire track!'}`
          : `📚 **Quiz Results**\n\n**Your Score: ${score}% (${correctAnswers}/${answers.length} correct)**\n\nYou need at least 70% to pass. Don't worry - learning takes time and practice!`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: passed 
          ? currentTrack.currentDay < currentTrack.totalDays
            ? ['Continue to next day', 'View my progress', 'Ask a question']
            : ['View my progress', 'Start new track', 'Ask a question']
          : ['Review content', 'Retake quiz', 'Ask for help']
      };

      setMessages(prev => [...prev, completionMessage]);
      
    } catch (error) {
      setIsTyping(false);
      console.error('Failed to save progress:', error);
      
      const errorMessage = {
        id: Date.now(),
        text: `Quiz completed with ${score}% score, but there was an issue saving your progress. Please try again.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ['Retry', 'Continue anyway']
      };
      
      setMessages(prev => [...prev, errorMessage]);
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

    // Handle specific actions
    if (messageText === 'Start Learning') {
      setIsTyping(false);
      startLearningContent();
      return;
    }

    if (messageText === 'Take Quiz') {
      setIsTyping(false);
      startQuiz();
      return;
    }

    if (messageText === 'Continue to next day') {
      if (currentTrack && currentTrack.currentDay <= currentTrack.totalDays) {
        const nextDay = currentTrack.days.find(day => day.dayNumber === currentTrack.currentDay);
        if (nextDay) {
          setCurrentDayData(nextDay);
          setIsTyping(false);
          const nextDayMessage = {
            id: Date.now(),
            text: `🚀 **Day ${nextDay.dayNumber}: ${nextDay.topic}**\n\nReady to continue your learning journey?`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            options: ['Start Learning', 'Take Quiz', 'Ask a question']
          };
          setMessages(prev => [...prev, nextDayMessage]);
          return;
        }
      }
    }

    if (messageText === 'Retake quiz') {
      setIsTyping(false);
      setQuizMode(false);
      setQuizAnswers([]);
      setCurrentQuestionIndex(0);
      
      const retakeMessage = {
        id: Date.now(),
        text: "No problem! Let's try the quiz again. Take your time and think through each question carefully.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: ['Start Quiz', 'Review content first']
      };
      setMessages(prev => [...prev, retakeMessage]);
      return;
    }

    // For all other messages, use AI
    try {
      const context = currentTrack ? {
        currentTrack: currentTrack.title,
        currentDay: currentTrack.currentDay,
        currentTopic: currentDayData?.topic
      } : null;

      const aiResponse = await getAIResponse(messageText, context);
      
      setIsTyping(false);
      
      const aiMessage = {
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        options: currentTrack ? ['Take Quiz', 'Continue Learning', 'Ask another question'] : ['Browse Learning Tracks', 'Ask another question']
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error('Error getting AI response:', error);
    }
  };

  const handleOptionClick = (option) => {
    if (quizMode) {
      handleQuizAnswer(option);
    } else {
      handleSendMessage(option);
    }
  };

  const openChatWithWelcome = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: `Hi there! I'm FinBot, your AI financial tutor. 🤖\n\nI'm ready to help! What would you like to do?`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      options: tracks.length > 0 
        ? ['Continue my track', 'Start new track', 'Ask a question']
        : ['Browse learning tracks', 'Ask a question', 'Quick topics']
    };
    
    setMessages([welcomeMessage]);
    setIsChatOpen(true);
  };

  const navItems = [
    { name: "Overview", link: "#overview" },
    { name: "Learn Daily", link: "/daily-learn" },
    { name: "Smart OCR", link: "#ocr" },
    { name: "FinCalcy Tools", link: "#tools" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setShowButton(false);
      } else {
        setShowButton(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <Navbar>
        <NavBody>
          <NavItems items={navItems} />
          {showButton && (
            <NavbarButton href="#chatbot" variant="gradient">
              💬 Ask FinBot Anything
            </NavbarButton>
          )}
        </NavBody>
      </Navbar>
            
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
          onClick={openChatWithWelcome}
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
              {quizMode && (
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  Quiz Mode
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
          {quizMode && currentDayData?.quiz && (
            <div className="bg-gray-700 p-2">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Quiz Progress</span>
                <span>{currentQuestionIndex + 1}/{currentDayData.quiz.questions.length}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / currentDayData.quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
  <div
    key={message.id}
    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`max-w-[80%] p-3 rounded-lg ${
        message.sender === 'user'
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
          : 'bg-gray-700 text-gray-100 shadow-lg'
      }`}
    >
      <div className="text-sm prose prose-invert whitespace-pre-wrap">
  <ReactMarkdown>
    {message.text}
  </ReactMarkdown>
</div>

      {message.options && message.options.length > 0 && (
        <div className="mt-3 space-y-2">
          {message.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`block w-full text-left text-xs rounded px-3 py-2 transition-colors ${
                message.isQuiz
                  ? 'bg-blue-600 bg-opacity-20 hover:bg-opacity-40 border border-blue-400 hover:border-blue-300'
                  : 'bg-gray-600 bg-opacity-30 hover:bg-opacity-50 text-gray-200 hover:text-white'
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
                placeholder={quizMode ? "Use the buttons above to answer..." : "Ask me anything about finance..."}
                disabled={quizMode}
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || quizMode}
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
          const progress = Math.floor((track.currentDay-1 / track.totalDays) * 100);

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