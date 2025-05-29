import { Card } from '@/components/ui/card';
import { Brain, LifeBuoy, Settings, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  iconGradient: string;
  features: string[];
}

export const availableChatbots: Chatbot[] = [
  {
    id: 'support-assistant',
    name: 'AI Support Center',
    description:
      'Get help with technical issues and customer support inquiries',
    icon: LifeBuoy,
    gradient: 'bg-gradient-to-r from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
    iconColor: 'text-blue-500',
    iconGradient: 'bg-gradient-to-br from-blue-500 to-cyan-400',
    features: ['Technical Assistance', 'Issue Resolution', 'Customer Support'],
  },
  {
    id: 'hr-guide',
    name: 'AI HR Assistant',
    description:
      'Navigate HR policies, onboarding processes, and benefits information',
    icon: Users,
    gradient: 'bg-gradient-to-r from-[#F3E8FF] via-[#E9D5FF] to-[#D8B4FE]',
    iconColor: 'text-purple-500',
    iconGradient: 'bg-gradient-to-br from-purple-500 to-pink-400',
    features: [
      'Policy Guidance',
      'Employee Onboarding',
      'Benefits Information',
    ],
  },
  {
    id: 'knowledge-base',
    name: 'AI Knowledge Center',
    description: 'Access documentation, resources, and best practices',
    icon: Brain,
    gradient: 'bg-gradient-to-r from-[#DCFCE7] via-[#BBF7D0] to-[#86EFAC]',
    iconColor: 'text-emerald-500',
    iconGradient: 'bg-gradient-to-br from-emerald-500 to-green-400',
    features: ['Documentation Access', 'Resource Library', 'Best Practices'],
  },
  {
    id: 'operations-assistant',
    name: 'AI Operations Center',
    description: 'Optimize workflows, operations, and business processes',
    icon: Settings,
    gradient: 'bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]',
    iconColor: 'text-amber-500',
    iconGradient: 'bg-gradient-to-br from-amber-500 to-orange-400',
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

export default function AICenterPage(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/80 to-gray-50/50 py-8">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {availableChatbots.map((bot) => (
            <motion.div key={bot.id} variants={item}>
              <Link href={`/${country || 'my'}/chatbot/${bot.id}`}>
                <Card
                  className={`relative p-6 cursor-pointer transition-all duration-300
                  hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]
                  hover:scale-[1.01] ${bot.gradient}
                  group overflow-hidden rounded-xl border border-gray-100`}
                >
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] group-hover:bg-white/50 transition-all duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg ${bot.iconGradient} shadow-lg group-hover:shadow-xl transition-all duration-300
                        relative before:absolute before:inset-0 before:bg-white/10 before:backdrop-blur-[1px]
                        before:rounded-lg before:opacity-0 group-hover:before:opacity-100 before:transition-opacity`}
                      >
                        <bot.icon className="w-6 h-6 text-white relative z-10" />
                      </div>
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${bot.iconColor}`}
                    >
                      {bot.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{bot.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {bot.features.map((feature) => (
                        <span
                          key={feature}
                          className={`px-3 py-1 rounded-full text-sm font-medium
                            bg-white/70 backdrop-blur-sm
                            ${bot.iconColor} border-[0.5px] border-current/20`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
