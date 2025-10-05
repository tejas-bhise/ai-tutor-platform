/**
 * API Service - Handles all backend communication
 * Supports both local development and production deployment
 */

// Detect environment and set API URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : 'https://ai-tutor-platform-7vte.onrender.com';  // Production - UPDATE THIS AFTER DEPLOYING BACKEND

console.log('🌐 API Base URL:', API_BASE_URL);

const api = {
    /**
     * Generate AI response from backend
     */
    async generateResponse(query, tutorName = 'Alex', context = {}) {
        try {
            console.log('📡 Sending request to:', `${API_BASE_URL}/api/generate`);
            console.log('📝 Query:', query.substring(0, 50) + '...');
            
            const response = await fetch(`${API_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    tutorName: tutorName,
                    context: context
                })
            });

            console.log('📊 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Response received successfully');
            
            return data;

        } catch (error) {
            console.error('❌ API Error:', error);
            
            // Check if it's a network error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to backend server. Please check if the server is running.');
            }
            
            throw error;
        }
    },

    /**
     * Check backend health status
     */
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Backend health check failed');
            }

            const data = await response.json();
            console.log('✅ Backend health:', data);
            return data;

        } catch (error) {
            console.error('❌ Health check error:', error);
            return {
                success: false,
                status: 'unhealthy',
                error: error.message
            };
        }
    },

    /**
     * Test backend connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/test`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Connection test failed');
            }

            const data = await response.json();
            console.log('✅ Connection test successful:', data);
            return data;

        } catch (error) {
            console.error('❌ Connection test error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// Test connection on page load
window.addEventListener('load', async () => {
    console.log('🔍 Testing backend connection...');
    const health = await api.checkHealth();
    
    if (health.success) {
        console.log('✅ Backend connected successfully!');
    } else {
        console.warn('⚠️ Backend connection issue:', health.error);
        console.log('💡 Make sure backend server is running on:', API_BASE_URL);
    }
});

console.log('✅ API service loaded');
