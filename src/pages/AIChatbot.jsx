import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { sendMessageToMedicalAI } from '../utils/chatbotService';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

const getChatErrorMessage = error => {
  if (error?.message === 'AI_UNAUTHORIZED') {
    return 'يجب تسجيل الدخول أولًا لاستخدام المساعد الطبي، أو قد تكون صلاحية الجلسة انتهت.';
  }

  if (error?.message === 'AI_RATE_LIMIT') {
    return 'تم تجاوز حد الطلبات المؤقت من مزود الذكاء الاصطناعي. انتظر قليلًا ثم حاول مرة أخرى.';
  }

  if (error?.message === 'AI_UPSTREAM_UNAVAILABLE' || error?.message === 'AI_SERVER_UNAVAILABLE') {
    return 'خدمة الذكاء الاصطناعي أو السيرفر غير متاحة الآن. تأكد من تشغيل API server ثم حاول مرة أخرى.';
  }

  if (error?.message === 'AI_REQUEST_FAILED') {
    return 'مزود الذكاء الاصطناعي رفض الطلب أو أعاد خطأ غير متوقع. غالبًا المفتاح أو إعدادات OpenRouter أو النموذج يحتاجوا مراجعة.';
  }

  if (error?.message === 'INVALID_MESSAGE') {
    return 'الرسالة المرسلة غير صالحة. اكتب سؤالًا واضحًا ثم حاول مرة أخرى.';
  }

  return 'حدث خطأ أثناء الاتصال بالمساعد الطبي. حاول مرة أخرى لاحقًا.';
};

const AIChatbot = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content:
        "Hello! I'm Noura AI Medical Assistant. Ask me about cancer awareness, scans, results, or how to use the system.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const quickActions = [
    {
      icon: '🧠',
      label: 'Cancer Awareness',
      query: 'Tell me about early cancer detection',
    },
    { icon: '📋', label: 'How to Upload', query: 'How do I upload a scan for analysis?' },
    { icon: '📊', label: 'Results Info', query: 'How do I view my analysis results?' },
    { icon: '📅', label: 'Appointments', query: 'How do I schedule an appointment?' },
    { icon: '🔒', label: 'Privacy', query: 'Is my data secure and private?' },
    { icon: '💬', label: 'Contact Doctor', query: 'How do I contact my doctor?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) setIsOpen(false);
  }, [isAuthenticated]);

  if (
    !isAuthenticated ||
    location.pathname === '/login' ||
    location.pathname === '/forgot-password'
  ) {
    return null;
  }

  const submitMessage = async query => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedQuery,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowQuickActions(false);
    setIsTyping(true);

    try {
      const history = [...messages, userMessage].map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const aiReply = await sendMessageToMedicalAI(trimmedQuery, history);

      const botResponse = {
        id: Date.now() + 1,
        role: 'bot',
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      logger.error('AI chatbot error:', error);

      const errorMessage = {
        id: Date.now() + 2,
        role: 'bot',
        content: getChatErrorMessage(error),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    await submitMessage(input);
  };

  const handleQuickAction = async query => {
    await submitMessage(query);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Noura AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                    {message.role === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && messages.length <= 1 && (
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2"
              >
                {showQuickActions ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronUp className="w-3 h-3 mr-1" />
                )}
                Quick Questions
              </button>
              {showQuickActions && (
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-3 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +20 100 000 0000
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> support@noura-ai.com
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
