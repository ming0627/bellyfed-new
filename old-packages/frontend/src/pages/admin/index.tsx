import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Utensils,
  ChefHat,
  BarChart3,
  Settings,
  Database,
  Import,
} from 'lucide-react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { withServerAuth } from '@/utils/serverAuth';
import Head from 'next/head';
import Link from 'next/link';

/**
 * Admin Dashboard Page
 *
 * Main admin dashboard for the Bellyfed application
 */
interface AdminDashboardProps {
  user: {
    id: string;
    username: string;
    email: string;
    name?: string;
  };
}

interface AdminStats {
  restaurants: number;
  dishes: number;
  users: number;
  reviews: number;
}

export default function AdminDashboard(
  _props: AdminDashboardProps,
): JSX.Element {
  const [stats, setStats] = useState<AdminStats>({
    restaurants: 0,
    dishes: 0,
    users: 0,
    reviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, this would be an API call
        // For now, we'll use mock data with a delay to simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStats({
          restaurants: 125,
          dishes: 843,
          users: 512,
          reviews: 1678,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Head>
        <title>Admin Dashboard - Bellyfed</title>
        <meta name="description" content="Bellyfed Admin Dashboard" />
      </Head>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-orange-600 mr-3" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Return to Site</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Utensils className="h-5 w-5 text-orange-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats.restaurants.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Dishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ChefHat className="h-5 w-5 text-orange-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats.dishes.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-orange-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats.users.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-orange-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats.reviews.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Restaurant Management</CardTitle>
          <CardDescription>
            Tools for managing restaurants and dishes in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/restaurants/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Utensils className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">Create Restaurant</h3>
                <p className="text-sm text-gray-500">
                  Add a new restaurant to the database
                </p>
              </div>
            </Link>

            <Link
              href="/admin/restaurants/import"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Import className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">Import Restaurants</h3>
                <p className="text-sm text-gray-500">
                  Import restaurants from Google Maps
                </p>
              </div>
            </Link>

            <Link
              href="/admin/dishes"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChefHat className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">Manage Dishes</h3>
                <p className="text-sm text-gray-500">
                  View and edit dishes in the system
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Tools */}
      <Card>
        <CardHeader>
          <CardTitle>System Administration</CardTitle>
          <CardDescription>
            Tools for managing system settings and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">User Management</h3>
                <p className="text-sm text-gray-500">
                  Manage user accounts and permissions
                </p>
              </div>
            </Link>

            <Link
              href="/admin/database"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Database className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">Database Tools</h3>
                <p className="text-sm text-gray-500">
                  Database maintenance and operations
                </p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">System Settings</h3>
                <p className="text-sm text-gray-500">
                  Configure application settings
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Use getServerSideProps to check authentication on the server side
export const getServerSideProps: GetServerSideProps = withServerAuth(
  async (_context: GetServerSidePropsContext) => {
    // This function will only be called if the user is authenticated
    // due to the withServerAuth wrapper

    // Check if the user is an admin
    const adminUsers = process.env.ADMIN_USERS
      ? process.env.ADMIN_USERS.split(',')
      : [];

    // Get the user from the context (added by withServerAuth)
    // In a real implementation, we would get the user from the context
    // For now, we'll use a mock user
    const user = { id: 'mock-user-id', email: 'admin@example.com' };

    // If no admin users are specified in development, allow all authenticated users
    const isAdmin =
      process.env.NODE_ENV === 'development' && adminUsers.length === 0
        ? true
        : adminUsers.includes(user.id) || adminUsers.includes(user.email);

    // If the user is not an admin, redirect to the home page
    if (!isAdmin) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    // User is authenticated and is an admin, return the props
    return {
      props: {
        user,
      },
    };
  },
  {
    redirectUrl: '/signin',
    returnTo: true,
  },
);
