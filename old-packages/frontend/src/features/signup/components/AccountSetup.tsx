/**
 * This file contains the AccountSetup component for the signup process.
 * It handles the second step of the signup form, collecting account information.
 */

import { FormField } from '@/components/FormField';
import React from 'react';
import { StepProps } from '../types';

const AccountSetup: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
  touched,
  handleBlur,
  handleKeyPress,
}) => {
  return (
    <div className="space-y-3" onKeyDown={handleKeyPress}>
      <h2 className="text-lg font-bold mb-2">Create Your Account</h2>
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={updateFormData}
        onBlur={handleBlur}
        error={errors.email}
        touched={touched.email}
      />
      <FormField
        id="username"
        label="Username"
        placeholder="Choose a username"
        value={formData.username}
        onChange={updateFormData}
        onBlur={handleBlur}
        error={errors.username}
        touched={touched.username}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        placeholder="Enter a secure password"
        value={formData.password}
        onChange={updateFormData}
        onBlur={handleBlur}
        error={errors.password}
        touched={touched.password}
      />
      <FormField
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={updateFormData}
        onBlur={handleBlur}
        error={errors.confirmPassword}
        touched={touched.confirmPassword}
      />
    </div>
  );
};

export default AccountSetup;
