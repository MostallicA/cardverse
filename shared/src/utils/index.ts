// Utility functions

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const isTest = (): boolean => process.env.NODE_ENV === 'test';
