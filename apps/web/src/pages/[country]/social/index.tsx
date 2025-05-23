import { getCountryStaticPaths, getCountryStaticProps } from '@bellyfed/utils';
import { Container } from '@bellyfed/ui';
import { Users } from 'lucide-react';

export default function SocialPage({ country }: { country: string }) {
  return (
    <Container>
      <div className="py-8">
        <div className="flex items-center mb-6">
          <Users className="w-8 h-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">Social Feed</h1>
        </div>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Connect with food lovers and share your culinary experiences
        </p>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
          <p className="text-center text-lg">
            Social feed content will be displayed here.
          </p>
        </div>
      </div>
    </Container>
  );
}

// Generate static paths for all supported countries
export const getStaticPaths = () => getCountryStaticPaths();

// Get static props with country information
export const getStaticProps = ({ params }: { params: { country: string } }) => getCountryStaticProps(params);
