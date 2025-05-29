/**
 * This file contains the form validation schema for the signup process.
 */

import { z } from 'zod';

export const formSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().refine(
      (date: string) => {
        const year = new Date(date).getFullYear();
        const currentYear = new Date().getFullYear();
        return year >= 1900 && year <= currentYear;
      },
      { message: 'Please enter a valid date of birth' },
    ),
    gender: z.enum(['male', 'female']),
    country: z.string().min(1, 'Country is required'),
    state: z.string().min(1, 'State is required'),
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
