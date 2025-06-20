const API_BASE_URL = import.meta.env.VITE_URL_COMP || 'http://localhost:8000';

export const compileAndRun = async (language, code, input = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        code,
        input
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to compile and run code');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    console.log("Loaded API_BASE_URL:", API_BASE_URL);
    throw error;
  }
};

export const aiCodeReview = async (language, code, input = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        code,
        input
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get AI review');
    }

    return result;
  } catch (error) {
    console.error('AI Review API Error:', error);
    throw error;
  }
};

export const chatBot = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat-bot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get AI response');
    }

    return result;
  } catch (error) {
    console.error('Chat Bot API Error:', error);
    throw error;
  }
};