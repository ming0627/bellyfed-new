'use client';

import {
  Edit,
  Facebook,
  Image as ImageIcon,
  Instagram,
  PlusIcon,
  Star,
  Trash2,
  Twitter,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  type: 'permanent' | 'popup';
  locations: Location[];
  rating: number;
  reviews: number;
  images: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
};

type Location = {
  id: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
};

// Sample data
const sampleRestaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Pasta Paradise',
    cuisine: 'Italian',
    description: 'Authentic Italian pasta and pizza in a cozy atmosphere.',
    type: 'permanent',
    rating: 4.5,
    reviews: 120,
    images: ['/restaurant1.jpg', '/restaurant2.jpg'],
    locations: [
      {
        id: 1,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '(212) 555-1234',
        email: 'info@pastaparadise.com',
        hours: {
          monday: '11:00 AM - 10:00 PM',
          tuesday: '11:00 AM - 10:00 PM',
          wednesday: '11:00 AM - 10:00 PM',
          thursday: '11:00 AM - 10:00 PM',
          friday: '11:00 AM - 11:00 PM',
          saturday: '11:00 AM - 11:00 PM',
          sunday: '12:00 PM - 9:00 PM',
        },
      },
    ],
    socialMedia: {
      facebook: 'pastaparadise',
      instagram: 'pasta_paradise',
      twitter: 'PastaParadise',
    },
  },
  {
    id: 2,
    name: 'Sushi Sensation',
    cuisine: 'Japanese',
    description:
      'Fresh sushi and Japanese specialties prepared by master chefs.',
    type: 'permanent',
    rating: 4.8,
    reviews: 85,
    images: ['/restaurant3.jpg', '/restaurant4.jpg'],
    locations: [
      {
        id: 2,
        address: '456 Sushi Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        phone: '(323) 555-6789',
        email: 'info@sushisensation.com',
        hours: {
          monday: '12:00 PM - 10:00 PM',
          tuesday: '12:00 PM - 10:00 PM',
          wednesday: '12:00 PM - 10:00 PM',
          thursday: '12:00 PM - 10:00 PM',
          friday: '12:00 PM - 11:00 PM',
          saturday: '12:00 PM - 11:00 PM',
          sunday: '1:00 PM - 9:00 PM',
        },
      },
    ],
    socialMedia: {
      instagram: 'sushi_sensation',
    },
  },
];

const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] =
    useState<Restaurant[]>(sampleRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for editing/creating
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    cuisine: '',
    description: '',
    type: 'permanent',
    rating: 0,
    reviews: 0,
    images: [],
    locations: [],
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
  });

  // Handle restaurant selection
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData(restaurant);
    setIsEditing(false);
  };

  // Handle edit mode
  const handleEditMode = () => {
    setIsEditing(true);
  };

  // Handle create mode
  const handleCreateMode = () => {
    setIsCreating(true);
    setSelectedRestaurant(null);
    setFormData({
      name: '',
      cuisine: '',
      description: '',
      type: 'permanent',
      rating: 0,
      reviews: 0,
      images: [],
      locations: [],
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
      },
    });
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle social media input changes
  const handleSocialMediaChange = (
    platform: keyof Restaurant['socialMedia'],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  // Handle save
  const handleSave = () => {
    if (isCreating) {
      // Create new restaurant
      const newRestaurant: Restaurant = {
        ...(formData as Restaurant),
        id: Math.max(...restaurants.map((r) => r.id), 0) + 1,
      };
      setRestaurants([...restaurants, newRestaurant]);
      setIsCreating(false);
      setSelectedRestaurant(newRestaurant);
    } else if (isEditing && selectedRestaurant) {
      // Update existing restaurant
      const updatedRestaurants = restaurants.map((r) =>
        r.id === selectedRestaurant.id
          ? { ...(formData as Restaurant), id: r.id }
          : r,
      );
      setRestaurants(updatedRestaurants);
      setSelectedRestaurant({
        ...(formData as Restaurant),
        id: selectedRestaurant.id,
      });
      setIsEditing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false);
    } else if (isEditing) {
      setIsEditing(false);
      setFormData(selectedRestaurant || {});
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    const updatedRestaurants = restaurants.filter((r) => r.id !== id);
    setRestaurants(updatedRestaurants);
    setSelectedRestaurant(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Restaurant Management</h1>

      <Tabs defaultValue="restaurants" className="w-full">
        <TabsContent value="restaurants" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Restaurant List */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Restaurants</span>
                    <Button size="sm" onClick={handleCreateMode}>
                      <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                          selectedRestaurant?.id === restaurant.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSelectRestaurant(restaurant)}
                      >
                        <div>
                          <h3 className="font-medium">{restaurant.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {restaurant.cuisine} • {restaurant.type}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm flex items-center mr-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {restaurant.rating}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(restaurant.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Restaurant Details or Form */}
            <div className="md:col-span-2">
              {isCreating ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Restaurant</CardTitle>
                    <CardDescription>
                      Fill in the details to add a new restaurant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Restaurant Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cuisine">Cuisine</Label>
                          <Input
                            id="cuisine"
                            name="cuisine"
                            value={formData.cuisine || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={formData.description || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Restaurant Type</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) =>
                              handleSelectChange('type', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="permanent">
                                Permanent
                              </SelectItem>
                              <SelectItem value="popup">Pop-up</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rating">Rating</Label>
                          <Input
                            id="rating"
                            name="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={formData.rating || 0}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Social Media</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Facebook className="h-4 w-4" />
                            <Input
                              placeholder="Facebook handle"
                              value={formData.socialMedia?.facebook || ''}
                              onChange={(e) =>
                                handleSocialMediaChange(
                                  'facebook',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-4 w-4" />
                            <Input
                              placeholder="Instagram handle"
                              value={formData.socialMedia?.instagram || ''}
                              onChange={(e) =>
                                handleSocialMediaChange(
                                  'instagram',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Twitter className="h-4 w-4" />
                            <Input
                              placeholder="Twitter handle"
                              value={formData.socialMedia?.twitter || ''}
                              onChange={(e) =>
                                handleSocialMediaChange(
                                  'twitter',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Images</Label>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <ImageIcon className="h-4 w-4 mr-2" /> Upload Image
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            No images uploaded
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Restaurant</Button>
                  </CardFooter>
                </Card>
              ) : selectedRestaurant ? (
                isEditing ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Restaurant</CardTitle>
                      <CardDescription>
                        Update the details for {selectedRestaurant.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Restaurant Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cuisine">Cuisine</Label>
                            <Input
                              id="cuisine"
                              name="cuisine"
                              value={formData.cuisine || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="type">Restaurant Type</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value) =>
                                handleSelectChange('type', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="permanent">
                                  Permanent
                                </SelectItem>
                                <SelectItem value="popup">Pop-up</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rating">Rating</Label>
                            <Input
                              id="rating"
                              name="rating"
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={formData.rating || 0}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Social Media</Label>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Facebook className="h-4 w-4" />
                              <Input
                                placeholder="Facebook handle"
                                value={formData.socialMedia?.facebook || ''}
                                onChange={(e) =>
                                  handleSocialMediaChange(
                                    'facebook',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Instagram className="h-4 w-4" />
                              <Input
                                placeholder="Instagram handle"
                                value={formData.socialMedia?.instagram || ''}
                                onChange={(e) =>
                                  handleSocialMediaChange(
                                    'instagram',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Twitter className="h-4 w-4" />
                              <Input
                                placeholder="Twitter handle"
                                value={formData.socialMedia?.twitter || ''}
                                onChange={(e) =>
                                  handleSocialMediaChange(
                                    'twitter',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{selectedRestaurant.name}</span>
                        <Button size="sm" onClick={handleEditMode}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        {selectedRestaurant.cuisine} • {selectedRestaurant.type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">
                            {selectedRestaurant.rating}
                          </span>
                          <span className="text-muted-foreground">
                            ({selectedRestaurant.reviews} reviews)
                          </span>
                        </div>

                        <p>{selectedRestaurant.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium mb-2">Location</h3>
                            {selectedRestaurant.locations.map((location) => (
                              <div key={location.id} className="space-y-1">
                                <p>{location.address}</p>
                                <p>
                                  {location.city}, {location.state}{' '}
                                  {location.zipCode}
                                </p>
                                <p>{location.phone}</p>
                                <p>{location.email}</p>
                              </div>
                            ))}
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Hours</h3>
                            {selectedRestaurant.locations[0] && (
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="font-medium">Monday:</span>{' '}
                                  {selectedRestaurant.locations[0].hours.monday}
                                </p>
                                <p>
                                  <span className="font-medium">Tuesday:</span>{' '}
                                  {
                                    selectedRestaurant.locations[0].hours
                                      .tuesday
                                  }
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Wednesday:
                                  </span>{' '}
                                  {
                                    selectedRestaurant.locations[0].hours
                                      .wednesday
                                  }
                                </p>
                                <p>
                                  <span className="font-medium">Thursday:</span>{' '}
                                  {
                                    selectedRestaurant.locations[0].hours
                                      .thursday
                                  }
                                </p>
                                <p>
                                  <span className="font-medium">Friday:</span>{' '}
                                  {selectedRestaurant.locations[0].hours.friday}
                                </p>
                                <p>
                                  <span className="font-medium">Saturday:</span>{' '}
                                  {
                                    selectedRestaurant.locations[0].hours
                                      .saturday
                                  }
                                </p>
                                <p>
                                  <span className="font-medium">Sunday:</span>{' '}
                                  {selectedRestaurant.locations[0].hours.sunday}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Social Media</h3>
                          <div className="flex space-x-4">
                            {selectedRestaurant.socialMedia.facebook && (
                              <Button variant="ghost" size="icon">
                                <Facebook className="h-5 w-5" />
                              </Button>
                            )}
                            {selectedRestaurant.socialMedia.instagram && (
                              <Button variant="ghost" size="icon">
                                <Instagram className="h-5 w-5" />
                              </Button>
                            )}
                            {selectedRestaurant.socialMedia.twitter && (
                              <Button variant="ghost" size="icon">
                                <Twitter className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Images</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedRestaurant.images.map((image, index) => (
                              <div
                                key={index}
                                className="relative h-40 rounded-md overflow-hidden"
                              >
                                <Image
                                  src={image}
                                  alt={`${selectedRestaurant.name} image ${index + 1}`}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">
                      No Restaurant Selected
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Select a restaurant from the list or add a new one
                    </p>
                    <Button onClick={handleCreateMode}>
                      <PlusIcon className="h-4 w-4 mr-2" /> Add New Restaurant
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantManagement;
