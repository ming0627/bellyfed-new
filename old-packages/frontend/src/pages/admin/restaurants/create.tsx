import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { withServerAuth } from '@/utils/serverAuth';

/**
 * Admin Restaurant Creation Page
 *
 * Form for creating a new restaurant in the database.
 */

import Head from 'next/head';
import Link from 'next/link';
// Custom toast
interface RestaurantFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  latitude: string;
  longitude: string;
  phone: string;
  website: string;
  email: string;
  cuisineType: string;
  priceRange: string;
}

const initialFormData: RestaurantFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  countryCode: 'my', // Default to Malaysia
  latitude: '',
  longitude: '',
  phone: '',
  website: '',
  email: '',
  cuisineType: '',
  priceRange: '2', // Default to medium price range
  description: '',
};

interface CreateRestaurantPageProps {
  user: {
    id: string;
    username: string;
    email: string;
    name?: string;
  };
}

export default function CreateRestaurantPage(
  _props: CreateRestaurantPageProps,
): JSX.Element {
  return <CreateRestaurantForm />;
}

function CreateRestaurantForm(): JSX.Element {
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev: RestaurantFormData) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev: RestaurantFormData) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    // Required fields
    const requiredFields = [
      'name',
      'address',
      'city',
      'country',
      'countryCode',
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof RestaurantFormData]) {
        toast({
          message: `Validation Error: ${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          type: 'error',
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a UUID for the restaurant
      const restaurantId = uuidv4();

      // Prepare the data for submission
      const restaurantData = {
        ...formData,
        restaurantId,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        priceRange: parseInt(formData.priceRange, 10),
      };

      // Submit the data to the API
      const response = await fetch('/api/admin/restaurants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create restaurant');
      }

      const responseData = await response.json();

      // Check if the response indicates an asynchronous process
      if (response.status === 202 && responseData.status === 'PROCESSING') {
        toast({
          message: `Restaurant Creation In Progress: Your restaurant is being created. This may take a few moments. (ID: ${responseData.restaurantId})`,
          type: 'success',
        });

        // We could implement polling here to check the status, but for now we'll just wait
        // and redirect to the admin page after a delay
        setTimeout(() => {
          router.push('/admin');
        }, 3000);

        return;
      }

      toast({
        message: `Success: Restaurant ${responseData.restaurant?.name || ''} created successfully`,
        type: 'success',
      });

      // Redirect to the admin dashboard
      router.push('/admin');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast({
        message: `Error: ${error instanceof Error ? error.message : 'Failed to create restaurant'}`,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Head>
        <title>Create Restaurant - Bellyfed Admin</title>
        <meta
          name="description"
          content="Create a new restaurant in the Bellyfed system"
        />
      </Head>

      <div className="mb-6">
        <Link
          href="/admin"
          className="flex items-center text-orange-600 hover:text-orange-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Restaurant</CardTitle>
          <CardDescription>
            Add a new restaurant to the Bellyfed database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type</Label>
                  <Input
                    id="cuisineType"
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleInputChange}
                    placeholder="e.g., Malaysian, Italian, Japanese"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceRange">Price Range</Label>
                  <Select
                    value={formData.priceRange}
                    onValueChange={(value: string) =>
                      handleSelectChange('priceRange', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">$ (Inexpensive)</SelectItem>
                      <SelectItem value="2">$$ (Moderate)</SelectItem>
                      <SelectItem value="3">$$$ (Expensive)</SelectItem>
                      <SelectItem value="4">$$$$ (Very Expensive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country Code *</Label>
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value: string) =>
                      handleSelectChange('countryCode', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="my">Malaysia (MY)</SelectItem>
                      <SelectItem value="sg">Singapore (SG)</SelectItem>
                      <SelectItem value="id">Indonesia (ID)</SelectItem>
                      <SelectItem value="th">Thailand (TH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      type="number"
                      step="0.000001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      type="number"
                      step="0.000001"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+60123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Additional details like opening hours, features, and images
                  can be added after creating the restaurant.
                </p>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Restaurant
                  </>
                )}
              </Button>
            </div>
          </form>
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
