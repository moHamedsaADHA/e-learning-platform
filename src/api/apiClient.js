import { store } from '../redux/store.js';
import { refreshToken, logout } from '../redux/slices/authSlice.js';

// const BASE_URL = 'http://localhost:3000';
const BASE_URL = 'https://api.magdy-gamal.com';
// const BASE_URL = 'https://courses-nine-eta.vercel.app';

// Helper function to get current auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Helper function to handle token refresh
async function handleTokenRefresh() {
  try {
    await store.dispatch(refreshToken()).unwrap();
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    store.dispatch(logout());
    window.location.href = '/login';
    return false;
  }
}

// Enhanced fetch function with retry logic and timeout
async function enhancedFetch(url, options = {}, retryCount = 0) {
  const maxRetries = 2;
  const timeout = 60000; // 60 seconds timeout
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // First attempt with timeout
    let response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    // If 401 and we have a token, try to refresh it
    if (response.status === 401 && localStorage.getItem('authToken')) {
      const refreshSuccess = await handleTokenRefresh();
      
      if (refreshSuccess) {
        // Retry the request with new token
        const newController = new AbortController();
        const newTimeoutId = setTimeout(() => newController.abort(), timeout);
        
        response = await fetch(url, {
          ...options,
          signal: newController.signal,
          headers: {
            ...getAuthHeaders(),
            ...options.headers
          }
        });
        
        clearTimeout(newTimeoutId);
      }
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry on network errors or timeout
    if ((error.name === 'AbortError' || error.message.includes('fetch')) && retryCount < maxRetries) {
      console.log(`Request timed out or failed, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return enhancedFetch(url, options, retryCount + 1);
    }
    
    throw error;
  }
}

export async function apiGet(path) {
  try {
    const response = await enhancedFetch(BASE_URL + path);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
}

export async function apiPost(path, body) {
  try {
    const response = await enhancedFetch(BASE_URL + path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API POST Error:', error);
    throw error;
  }
}

export async function apiPut(path, body) {
  try {
    const response = await enhancedFetch(BASE_URL + path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API PUT Error:', error);
    throw error;
  }
}

export async function apiDelete(path) {
  try {
    const response = await enhancedFetch(BASE_URL + path, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API DELETE Error:', error);
    throw error;
  }
}