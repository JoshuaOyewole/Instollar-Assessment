/**
 * Cookie utility functions for token management
 */

export const cookieUtils = {
  /**
   * Get a cookie value by name
   */
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  /**
   * Set a cookie with secure defaults
   */
  set: (name: string, value: string, days: number = 1): void => {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; samesite=strict${isSecure ? '; secure' : ''}`;
  },

  /**
   * Delete a cookie
   */
  delete: (name: string): void => {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=strict`;
  },

  /**
   * Get the authentication token
   */
  getToken: (): string | null => {
    return cookieUtils.get('token');
  },

  /**
   * Set the authentication token
   */
  setToken: (token: string, days: number = 1): void => {
    cookieUtils.set('token', token, days);
  },

  /**
   * Clear the authentication token
   */
  clearToken: (): void => {
    cookieUtils.delete('token');
  }
};

export default cookieUtils;
