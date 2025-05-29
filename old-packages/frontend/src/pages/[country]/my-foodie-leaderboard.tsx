import React from 'react';
import { MyFoodieLeaderboard } from '@/components/my-foodie-leaderboard';
import { GetStaticProps, GetStaticPaths } from 'next';

// Pre-render these paths
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const country = params?.country as string;

  return {
    props: {
      country,
    },
  };
};

export default function MyFoodieLeaderboardPage(): JSX.Element {
  return <MyFoodieLeaderboard />;
}
