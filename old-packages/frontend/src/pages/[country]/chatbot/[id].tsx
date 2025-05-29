import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ChatInterface';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { availableChatbots } from '@/pages/ai-center';
import { useEffect } from 'react';
import { COUNTRIES } from '@/config/countries';

import Link from 'next/link';

export default function ChatbotPage(): JSX.Element {
  const router = useRouter();
  const { country, id } = router.query;

  // Validate country code and chatbot id
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/chatbot/' + id);
      return;
    }

    const chatbot = availableChatbots.find((bot) => bot.id === id);
    if (!chatbot) {
      router.replace(`/${country || 'my'}/ai-center`);
    }
  }, [country, id, router]);

  const selectedBot = availableChatbots.find((bot) => bot.id === id);

  if (!selectedBot) {
    return (
      <div className="container mx-auto max-w-4xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">AI Assistant not found</h1>
        <p className="text-sm text-gray-500">
          We're sorry, but we couldn't find this AI center.
        </p>
        <Link href={`/${country || 'my'}/ai-center`}>
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
        <Link href={`/${country || 'my'}/ai-center`}>
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

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  const paths = availableChatbots.flatMap((bot) =>
    ['my', 'sg'].map((country) => ({
      params: { country, id: bot.id },
    })),
  );

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
