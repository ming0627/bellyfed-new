import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: number;
  suggestions?: string[];
}

interface ChatInterfaceProps {
  botName: string;
  botDescription: string;
  botId: string;
  gradient?: string;
}

const getBotSuggestions = (botId: string): string[] => {
  switch (botId) {
    case 'support-assistant':
      return [
        'How do I report a technical issue?',
        'I need help with customer support',
        "What's the bug reporting process?",
      ];
    case 'hr-guide':
      return [
        'What are the employee benefits?',
        'Tell me about the onboarding process',
        'How do I request time off?',
      ];
    case 'knowledge-base':
      return [
        'Show me the documentation guide',
        'What are the best practices?',
        'Where can I find company resources?',
      ];
    case 'operations-assistant':
      return [
        'Explain the restaurant management workflow',
        'What are the operating procedures?',
        'How do I handle business operations?',
      ];
    default:
      return [];
  }
};

const getBotResponse = (
  botId: string,
  message: string,
): { response: string; suggestions?: string[] } => {
  // This is a simplified response system. In a real application, you'd integrate with an AI service.
  const lowercaseMessage = message.toLowerCase();

  switch (botId) {
    case 'support-assistant':
      if (
        lowercaseMessage.includes('technical issue') ||
        lowercaseMessage.includes('bug')
      ) {
        return {
          response:
            'To report a technical issue or bug, please follow these steps:\n1. Take a screenshot of the issue\n2. Note down the steps to reproduce it\n3. Fill out our bug report form\n4. Our team will respond within 24 hours',
          suggestions: [
            "Where's the bug report form?",
            'What details should I include?',
            'How long until I get a response?',
          ],
        };
      }
      break;

    case 'hr-guide':
      if (
        lowercaseMessage.includes('benefits') ||
        lowercaseMessage.includes('insurance')
      ) {
        return {
          response:
            'Our employee benefits package includes:\n• Health, dental, and vision insurance\n• 401(k) with company match\n• Paid time off and holidays\n• Professional development allowance',
          suggestions: [
            'How do I enroll?',
            'When do benefits start?',
            "What's the PTO policy?",
          ],
        };
      }
      break;

    case 'knowledge-base':
      if (
        lowercaseMessage.includes('documentation') ||
        lowercaseMessage.includes('guide')
      ) {
        return {
          response:
            'Our documentation is organized into these main sections:\n• Getting Started Guide\n• Technical Documentation\n• Process Workflows\n• Best Practices\n\nWhich section would you like to explore?',
          suggestions: [
            'Show Getting Started',
            'Technical docs please',
            'Best practices guide',
          ],
        };
      }
      break;

    case 'operations-assistant':
      if (
        lowercaseMessage.includes('workflow') ||
        lowercaseMessage.includes('procedure')
      ) {
        return {
          response:
            'Here are our key restaurant operations workflows:\n• Opening Procedures\n• Service Standards\n• Inventory Management\n• Staff Scheduling\n• Closing Procedures',
          suggestions: [
            'Tell me about opening procedures',
            'How does scheduling work?',
            'Explain inventory management',
          ],
        };
      }
      break;
  }

  // Default response if no specific match is found
  return {
    response: `I understand you're asking about "${message}". Could you please provide more details or choose from the suggested topics below?`,
    suggestions: getBotSuggestions(botId),
  };
};

export function ChatInterface({
  botName,
  botDescription,
  botId,
  gradient,
}: ChatInterfaceProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: `Hello! I'm ${botName}. ${botDescription}`,
      isUser: false,
      timestamp: Date.now(),
      suggestions: getBotSuggestions(botId),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      content: message,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const { response, suggestions } = getBotResponse(botId, message);
      const botMessage: Message = {
        content: response,
        isUser: false,
        timestamp: Date.now(),
        suggestions,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card
      className={`h-[calc(100vh-8rem)] flex flex-col bg-white border-2 ${gradient}`}
    >
      <div className="p-8 border-b bg-primary">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/20 rounded-xl">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2 text-white">
              {botName}
              <Sparkles className="h-5 w-5 animate-pulse text-white" />
            </h2>
            <p className="text-white text-lg font-semibold">{botDescription}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-grow px-8 py-6 bg-slate-100">
        <AnimatePresence>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.isUser
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white text-slate-900 shadow-md border-2 border-slate-200'
                    }`}
                  >
                    <p className="text-[16px] leading-relaxed whitespace-pre-line font-medium">
                      {message.content}
                    </p>
                    <p
                      className={`text-sm mt-2 ${
                        message.isUser ? 'text-white' : 'text-slate-600'
                      } font-medium`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {!message.isUser && message.suggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.2 }}
                    className="mt-4 flex flex-wrap gap-2 pl-4"
                  >
                    {message.suggestions.map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-300 shadow-sm font-medium text-[14px]"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white text-slate-900 max-w-[80%] rounded-2xl p-4 shadow-md border-2 border-slate-200">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-slate-600 rounded-full animate-bounce" />
                    <div className="w-2.5 h-2.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2.5 h-2.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </AnimatePresence>
      </ScrollArea>

      <div className="p-6 border-t bg-white">
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-4"
        >
          <Input
            value={inputMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputMessage(e.target.value)
            }
            onKeyDown={handleKeyPress}
            placeholder={`Message ${botName}...`}
            className="flex-1 bg-slate-50 border-2 border-slate-300 focus:border-primary focus:ring-primary/20 text-slate-900 text-[16px]"
          />
          <Button
            type="submit"
            className="bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            disabled={!inputMessage.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
