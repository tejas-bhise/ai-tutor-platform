/**
 * API Service - Handles all backend communication
 */

const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000
};

class APIService {
    constructor(baseUrl = API_CONFIG.BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetch tutors list from backend
     */
    async getTutors() {
        try {
            const response = await fetch(`${this.baseUrl}/tutors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching tutors:', error);
            throw error;
        }
    }

    /**
     * Generate AI response from backend
     */
    async generateResponse(query, tutorName = 'Alex', context = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    tutorName: tutorName,
                    context: context
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Backend not responding');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }
}

// Create global API instance
const api = new APIService();
