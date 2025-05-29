/**
 * This file has been replaced with direct AWS SDK configuration.
 * The application no longer uses AWS Amplify.
 *
 * AWS Cognito authentication is now handled directly through the AWS SDK
 * via the cognitoAuthService in src/services/cognitoAuthService.ts
 */

// This file is kept for backward compatibility but its functions are now no-ops

export const configureAmplify = (): void => {
  console.log(
    'Amplify configuration has been removed. Using AWS SDK directly.',
  );
};

export const isAmplifyConfigured = (): boolean => {
  return false;
};
