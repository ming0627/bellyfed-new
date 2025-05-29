import { Card } from '@/components/ui/card';
import { Brain, LifeBuoy, Settings, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
}

export const availableChatbots: Chatbot[] = [
  {
    id: 'support-assistant',
    name: 'AI Support Center',
    description:
      'Get instant help with technical issues and customer support questions.',
    icon: LifeBuoy,
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Technical Assistance', 'Issue Resolution', 'Customer Support'],
  },
  {
    id: 'hr-guide',
    name: 'AI HR Assistant',
    description:
      'Navigate HR policies, benefits, and employee onboarding processes.',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Policy Guidance',
      'Employee Onboarding',
      'Benefits Information',
    ],
  },
  {
    id: 'knowledge-base',
    name: 'AI Knowledge Center',
    description:
      'Access comprehensive documentation and best practices resources.',
    icon: Brain,
    gradient: 'from-emerald-500 to-green-500',
    features: ['Documentation Access', 'Resource Library', 'Best Practices'],
  },
  {
    id: 'operations-assistant',
    name: 'AI Operations Center',
    description:
      'Optimize workflows and operational processes for maximum efficiency.',
    icon: Settings,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'Workflow Management',
      'Operations Guide',
      'Process Optimization',
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function ChatbotListPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-25">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <Sparkles className="h-8 w-8 text-primary relative" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              AI Nexus™
            </h1>
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-25">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <Sparkles className="h-8 w-8 text-primary relative" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience next-generation AI-powered intelligence, tailored to
            transform your business
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
              Powered by Advanced AI
            </span>
            <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
              Real-time Learning
            </span>
            <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
              Contextual Intelligence
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 md:grid-cols-2"
        >
          {availableChatbots.map((bot) => {
            const Icon = bot.icon;
            return (
              <motion.div key={bot.id} variants={item}>
                <Link href={`/chatbot/${bot.id}`} className="block">
                  <Card className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group h-[280px] flex flex-col">
                    <div
                      className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                      style={
                        {
                          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                          ['--tw-gradient-from' as string]: `rgb(var(--${bot.gradient.split('-')[2]}))`,
                          ['--tw-gradient-to' as string]: `rgb(var(--${bot.gradient.split('-')[4]}))`,
                        } as React.CSSProperties
                      }
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className={`p-4 rounded-xl bg-gradient-to-br ${bot.gradient}`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">{bot.name}</h2>
                      </div>
                      <p className="text-gray-600 mb-6 text-lg flex-grow">
                        {bot.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {bot.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
