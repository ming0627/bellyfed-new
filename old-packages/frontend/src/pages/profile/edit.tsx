import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// import { useAuth } from "@/contexts/AuthContext"; // Commented out as it is not used
import { User } from '@/types';
import { withServerAuth } from '@/utils/serverAuth';
import { ChevronLeft } from 'lucide-react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useCognitoUser, useUserProfile } from '@/hooks';

// Import the rest of the file content here

import Head from 'next/head';

import React, { useEffect, useState } from 'react';

// Custom toast
// Define the props type
type ProfileEditPageProps = {
  user: {
    id: string;
    username: string;
    email?: string;
    name?: string;
    bio?: string;
    location?: string;
    phone?: string;
    interests?: string[];
  };
};

const ProfileEditPage: React.FC<ProfileEditPageProps> = ({
  user: serverUser,
}) => {
  // const { isAuthenticated } = useAuth(); // Commented out as it is not used
  const router = useRouter();
  const { toast } = useToast();
  const { user: cognitoUser, isLoading: isLoadingCognitoUser } =
    useCognitoUser();
  const {
    profile,
    isLoading: isLoadingProfile,
    updateProfile,
    /* isUpdating */
  } = useUserProfile();

  // Determine if we're loading
  const isLoading = isLoadingCognitoUser || isLoadingProfile;

  // Use profile from useUserProfile if available, then cognitoUser, then serverUser
  const displayUser = profile || cognitoUser || serverUser;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    interests: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  // Initialize form data with user data
  useEffect(() => {
    if (displayUser) {
      setFormData({
        name: displayUser.name || '',
        bio: displayUser.bio || '',
        location: displayUser.location || '',
        phone: displayUser.phone || '',
        interests: displayUser.interests || [],
      });
    }
  }, [displayUser]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new interest
  const handleAddInterest = (): void => {
    if (
      newInterest.trim() &&
      !formData.interests.includes(newInterest.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  // Handle removing an interest
  const handleRemoveInterest = (interest: string): void => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayUser) {
      toast({
        message: 'Error',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user profile using React Query mutation
      updateProfile(formData as Partial<User>, {
        onSuccess: (updatedUser: any) => {
          // Check if the response indicates an asynchronous process
          if (updatedUser.eventStatus === 'PROCESSING') {
            toast({
              message: 'Profile Update In Progress',
              type: 'success',
            });

            // We could implement polling here to check the status, but for now we'll just wait
            // and redirect to the profile page after a delay
            setTimeout(() => {
              router.push('/profile');
            }, 2000);
          } else {
            toast({
              message: 'Success',
            });

            // Redirect to profile page
            router.push('/profile');
          }
        },
        onError: (error: any) => {
          console.error('Error updating profile:', error);
          toast({
            message: 'Error',
            type: 'error',
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        message: 'Error',
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <Head>
        <title>Edit Profile | BellyFed</title>
        <meta name="description" content="Edit your profile information" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-900"
            onClick={() => router.push('/profile')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <Card>
            <CardHeader className="pb-0 pt-6 px-6">
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-8">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Skeleton className="h-8 w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b">
                    <div className="flex-shrink-0">
                      <Avatar className="w-24 h-24 border-2 border-white shadow-md">
                        <AvatarImage
                          src={'/bellyfed.png'}
                          alt={displayUser?.name || 'User'}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {getInitials(displayUser?.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h3 className="font-medium text-gray-900">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-gray-500">
                        Upload a new profile picture. Recommended size:
                        400x400px.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          Upload New Picture
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          disabled
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Avatar upload functionality coming soon
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="block mb-2">
                            Display Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your display name"
                            className="w-full border-gray-300 focus:border-orange-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="block mb-2">
                            Email
                          </Label>
                          <Input
                            id="email"
                            value={displayUser?.email || ''}
                            disabled
                            className="w-full bg-gray-50 border-gray-200 text-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone" className="block mb-2">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your phone number"
                            className="w-full border-gray-300 focus:border-orange-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="location" className="block mb-2">
                            Location
                          </Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Country"
                            className="w-full border-gray-300 focus:border-orange-400"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio" className="block mb-2">
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself"
                          className="w-full border-gray-300 focus:border-orange-400 min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Food Interests</h3>

                    <div>
                      <Label htmlFor="interests" className="block mb-2">
                        Add Interests
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="interests"
                          value={newInterest}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewInterest(e.target.value)
                          }
                          placeholder="Add a food interest (e.g., Italian, Vegan, Spicy)"
                          className="flex-1 border-gray-300 focus:border-orange-400"
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                          ) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInterest();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddInterest}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest) => (
                          <div
                            key={interest}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              className="ml-2 text-orange-500 hover:text-orange-700"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      {formData.interests.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          No interests added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/profile')}
                      disabled={isSubmitting}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withServerAuth(
  async (_context: any) => {
    // Any additional server-side props logic can go here
    return {
      props: {
        // Additional props will be merged with the user prop from withServerAuth
        serverTime: new Date().toISOString(),
      },
    };
  },
  {
    redirectUrl: '/signin',
    returnTo: true,
  },
);

export default ProfileEditPage;
