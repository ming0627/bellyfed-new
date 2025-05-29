export default function SimpleTestPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Simple Test Page</h1>
      <p className="text-lg mb-6">
        This is a simple test page to check if routing is working.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-semibold mb-3">Route Information</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Page Type:</span> Simple Test Page
          </p>
          <p>
            <span className="font-medium">Path:</span> /simple-test
          </p>
        </div>
      </div>
    </div>
  );
}

// Add getStaticProps to ensure the page is properly built
export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
