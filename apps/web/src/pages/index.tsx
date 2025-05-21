import Layout from '../components/layout/Layout';

export default function Home() {
  return (
    <Layout title="Bellyfed - Home" description="Discover the best food experiences around you">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Welcome to Bellyfed
        </h1>

        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12">
          Discover the best food experiences around you
        </p>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Featured Restaurants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow">
              <h3 className="font-medium text-gray-900 dark:text-white">Pasta Paradise</h3>
              <p className="text-gray-500 dark:text-gray-300">Italian cuisine</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow">
              <h3 className="font-medium text-gray-900 dark:text-white">Sushi Sensation</h3>
              <p className="text-gray-500 dark:text-gray-300">Japanese cuisine</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow">
              <h3 className="font-medium text-gray-900 dark:text-white">Taco Temple</h3>
              <p className="text-gray-500 dark:text-gray-300">Mexican cuisine</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
