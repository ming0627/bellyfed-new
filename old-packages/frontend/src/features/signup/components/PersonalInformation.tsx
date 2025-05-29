/**
 * This file contains the PersonalInformation component for the signup process.
 * It handles the first step of the signup form, collecting personal information.
 */

import CustomDatePicker from '@/components/CustomDatePicker';
import { FormField } from '@/components/FormField';
import { Label } from '@/components/ui/label';
import { State } from 'country-state-city';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { CountryOption, StateOption, StepProps } from '../types';

const PersonalInformation: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
  touched,
  handleBlur,
  handleKeyPress,
}) => {
  const handleDateChange = (date: Date | null): void => {
    updateFormData('dateOfBirth', date ? date.toISOString().split('T')[0] : '');
  };

  const [countryOptions] = useState<CountryOption[]>(() =>
    countryList().getData(),
  );
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);

  useEffect(() => {
    if (formData.country) {
      const states = State.getStatesOfCountry(formData.country).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        }),
      );
      setStateOptions(states);
    } else {
      setStateOptions([]);
    }
  }, [formData.country]);

  const handleCountryChange = (selectedOption: CountryOption | null): void => {
    updateFormData('country', selectedOption ? selectedOption.value : '');
    updateFormData('state', ''); // Reset state when country changes
    handleBlur('country');
  };

  const handleStateChange = (selectedOption: StateOption | null): void => {
    updateFormData('state', selectedOption ? selectedOption.value : '');
    handleBlur('state');
  };

  return (
    <div className="space-y-3" onKeyDown={handleKeyPress}>
      <h2 className="text-lg font-bold mb-2">Tell Us About Yourself</h2>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="firstName"
          label="First Name"
          placeholder="Enter first name"
          value={formData.firstName}
          onChange={updateFormData}
          onBlur={handleBlur}
          error={errors.firstName}
          touched={touched.firstName}
        />
        <FormField
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={updateFormData}
          onBlur={handleBlur}
          error={errors.lastName}
          touched={touched.lastName}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <CustomDatePicker
          selected={
            formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
          }
          onChange={handleDateChange}
          onBlur={() => handleBlur('dateOfBirth')}
          error={errors.dateOfBirth}
          touched={touched.dateOfBirth}
        />
      </div>
      <FormField
        id="gender"
        label="Gender"
        type="radio"
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]}
        value={formData.gender}
        onChange={updateFormData}
        onBlur={handleBlur}
        error={errors.gender}
        touched={touched.gender}
      />
      <div className="space-y-1">
        <Label htmlFor="country">Country</Label>
        <Select<CountryOption>
          id="country"
          options={countryOptions}
          value={countryOptions.find(
            (option) => option.value === formData.country,
          )}
          onChange={handleCountryChange}
          onBlur={() => handleBlur('country')}
          placeholder="Select your country"
          className={errors.country && touched.country ? 'border-red-500' : ''}
        />
        {errors.country && touched.country && (
          <p className="text-red-500 text-xs">{errors.country}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="state">State</Label>
        <Select<StateOption>
          id="state"
          options={stateOptions}
          value={stateOptions.find((option) => option.value === formData.state)}
          onChange={handleStateChange}
          onBlur={() => handleBlur('state')}
          placeholder={
            formData.country ? 'Select your state' : 'Select a country first'
          }
          isDisabled={!formData.country}
          className={errors.state && touched.state ? 'border-red-500' : ''}
        />
        {errors.state && touched.state && (
          <p className="text-red-500 text-xs">{errors.state}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalInformation;
