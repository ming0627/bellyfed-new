import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ChatInterface';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { availableChatbots } from '.';

import Link from 'next/link';

export default function AICenterPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;

  const selectedBot = availableChatbots.find((bot) => bot.id === id);

  if (!selectedBot) {
    return (
      <div className="container mx-auto max-w-4xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">AI Assistant not found</h1>
        <p className="text-sm text-gray-500">
          We're sorry, but we couldn't find this AI center.
        </p>
        <Link href="/ai-center">
          <Button variant="default">Return to AI Center</Button>
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
        <Link href="/ai-center">
          <Button variant="ghost" className="hover:bg-gray-100 mb-4">
            ← Back to AI Center
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
