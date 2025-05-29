import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ChatInterface';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { availableChatbots } from '.';

import Link from 'next/link';

export default function ChatbotPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;

  const selectedBot = availableChatbots.find((bot) => bot.id === id);

  if (!selectedBot) {
    return (
      <div className="container mx-auto max-w-4xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Chatbot not found</h1>
        <p className="text-sm text-gray-500">
          We're sorry, but we couldn't find this chatbot.
        </p>
        <Link href="/chatbot">
          <Button variant="default">Return to Chatbot List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/chatbot">
          <Button variant="ghost" className="hover:bg-gray-100 mb-4">
            ← Back to Chatbot List
          </Button>
        </Link>
        <ChatInterface
          botName={selectedBot.name}
          botDescription={selectedBot.description}
          gradient={selectedBot.gradient}
          botId={selectedBot.id}
        />
      </motion.div>
    </div>
  );
}
