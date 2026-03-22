
// const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'https://api.magdy-gamal.com';
// const API_BASE_URL = 'https://courses-nine-eta.vercel.app';

// Helper function for public API calls (no auth required) with retry and timeout
const publicFetch = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const maxRetries = 2;
  const timeout = 60000; // 60 seconds timeout
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const defaultOptions = {
    method: 'GET',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry on network errors or timeout
    if ((error.name === 'AbortError' || error.message.includes('fetch')) && retryCount < maxRetries) {
      console.log(`Public API request timed out or failed, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return publicFetch(endpoint, options, retryCount + 1);
    }
    
    console.error(`Public API Error for ${url}:`, error);
    throw error;
  }
};

// Public API functions
export const publicApi = {
  // Get all grades (public)
  getAllGrades: () => publicFetch('/grades'),
  
  // Get grade info (public)
  getGradeInfo: (gradeParam) => publicFetch(`/grades/${gradeParam}`),
  
  // Get public lessons for a grade
  getPublicLessonsByGrade: (gradeParam) => publicFetch(`/grades/${gradeParam}/lessons/public`),
  
  // Check if endpoint exists (for debugging)
  checkEndpoint: (endpoint) => publicFetch(endpoint),
};

export default publicApi;