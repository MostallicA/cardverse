/**
 * CardVerse Frontend - Device ID Utility
 *
 * Generates and persists a stable device identifier for Guest authentication.
 * The backend /auth/guest validator requires a `deviceId` field.
 */

const STORAGE_KEY = 'cardverse_device_id';

/**
 * Returns the stored device ID, or generates + stores a new one on first use.
 */
export const getOrCreateDeviceId = (): string => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  localStorage.setItem(STORAGE_KEY, deviceId);
  return deviceId;
};
