/**
 * FormFieldExample
 * 
 * This is an example of how to use the FormField component with react-hook-form.
 * It demonstrates various input types and validation.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, MapPin, Phone } from 'lucide-react';
import FormField from '../components/FormField.js';
import Layout from '../components/layout/Layout.js';

// Define the validation schema using zod
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  bio: z
    .string()
    .max(500, { message: 'Bio must be at most 500 characters long' })
    .optional(),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long' })
    .max(100, { message: 'Location must be at most 100 characters long' })
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, { message: 'Please enter a valid phone number' })
    .optional(),
  country: z
    .string()
    .min(1, { message: 'Please select a country' }),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, { message: 'You must agree to the terms and conditions' }),
  notificationType: z
    .string()
    .min(1, { message: 'Please select a notification type' }),
});

/**
 * Example of a form using the FormField component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const FormFieldExample = () => {
  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      bio: '',
      location: '',
      phone: '',
      country: '',
      agreeToTerms: false,
      notificationType: 'email',
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    console.log('Form data:', data);
    alert('Form submitted successfully! Check the console for the data.');
    reset();
  };

  // Country options for select input
  const countryOptions = [
    { value: '', label: 'Select a country' },
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'sg', label: 'Singapore' },
    { value: 'my', label: 'Malaysia' },
  ];

  // Notification type options for radio input
  const notificationOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notification' },
  ];

  return (
    <Layout
      title="FormField Example"
      description="Example of using the FormField component with react-hook-form"
    >
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            FormField Example
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="name"
              label="Name"
              type="text"
              placeholder="Enter your name"
              required
              leftIcon={User}
              register={register}
              error={errors.name}
            />

            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              required
              leftIcon={Mail}
              register={register}
              error={errors.email}
            />

            <FormField
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
              register={register}
              error={errors.password}
              helpText="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers."
            />

            <FormField
              name="bio"
              label="Bio"
              type="textarea"
              placeholder="Tell us about yourself"
              register={register}
              error={errors.bio}
              helpText="Optional: Share a brief description about yourself."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="location"
                label="Location"
                type="text"
                placeholder="Enter your location"
                leftIcon={MapPin}
                register={register}
                error={errors.location}
              />

              <FormField
                name="phone"
                label="Phone"
                type="text"
                placeholder="Enter your phone number"
                leftIcon={Phone}
                register={register}
                error={errors.phone}
              />
            </div>

            <FormField
              name="country"
              label="Country"
              type="select"
              required
              register={register}
              error={errors.country}
              options={countryOptions}
            />

            <FormField
              name="notificationType"
              label="Notification Preferences"
              type="radio"
              register={register}
              error={errors.notificationType}
              options={notificationOptions}
            />

            <FormField
              name="agreeToTerms"
              type="checkbox"
              label="I agree to the terms and conditions"
              register={register}
              error={errors.agreeToTerms}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default FormFieldExample;
