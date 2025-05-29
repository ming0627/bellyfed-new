import { useRouter } from 'next/router';

export default function TestSimplePage(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Test Simple Page</h1>
      <p className="text-lg mb-6">
        This is a test page to check if dynamic routes are working.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-semibold mb-3">Route Information</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Country Code:</span> {country}
          </p>
          <p>
            <span className="font-medium">Page Type:</span> Test Simple Page
          </p>
          <p>
            <span className="font-medium">Path:</span> /{country}/test-simple
          </p>
        </div>
      </div>
    </div>
  );
}

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
