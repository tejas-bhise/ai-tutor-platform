/**
 * YoLearn.ai v2.0 - API Service
 * Handles all backend communication for 5 specialized AI tutors
 * 
 * DEPLOYMENT INFORMATION:
 * - Production Backend: https://ai-tutor-platform-7vte.onrender.com
 * - Local Backend: http://localhost:5000
 * - Frontend (Vercel): https://ai-tutor-platform-lime.vercel.app
 * - Frontend (Local): http://localhost:5500
 * 
 * Features:
 * - Auto environment detection
 * - 5 specialized tutors support
 * - Room management
 * - WebRTC config
 * - Health monitoring
 * - Error handling with retries
 */

// ============================================
// Environment Detection
// ============================================

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : 'https://ai-tutor-platform-7vte.onrender.com';  // Production (Render)

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📍 Environment:', window.location.hostname === 'localhost' ? 'LOCAL' : 'PRODUCTION');

// ============================================
// API Service Object
// ============================================

const api = {
    
    /**
     * Generate AI response from backend
     * Supports all 5 tutors: Alex, Sophia, Maya, Ryan, Emma
     */
    async generateResponse(query, tutorName = 'Alex', context = {}) {
        try {
            console.log('📡 Sending request to:', `${API_BASE_URL}/api/generate`);
            console.log('👨‍🏫 Tutor:', tutorName);
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
                }),
                timeout: 30000 // 30 second timeout
            });

            console.log('📊 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Response received from', data.tutorName || tutorName);
            
            return data;

        } catch (error) {
            console.error('❌ API Error:', error);
            
            // Enhanced error messages
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to backend server. The server might be starting up (Render cold start takes 30-60s). Please wait and try again.');
            }
            
            if (error.message.includes('timeout')) {
                throw new Error('Request timed out. Please try again.');
            }
            
            throw error;
        }
    },

    /**
     * Fetch all available AI companions/tutors
     */
    async getCompanions() {
        try {
            console.log('📡 Fetching companions from:', `${API_BASE_URL}/api/companions`);
            
            const response = await fetch(`${API_BASE_URL}/api/companions`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch companions');
            }

            const data = await response.json();
            console.log('✅ Fetched', data.companions?.length || 0, 'companions');
            return data;

        } catch (error) {
            console.error('❌ Companions fetch error:', error);
            return {
                success: false,
                error: error.message,
                companions: []
            };
        }
    },

    /**
     * Get specific companion by ID
     */
    async getCompanion(companionId) {
        try {
            console.log('📡 Fetching companion:', companionId);
            
            const response = await fetch(`${API_BASE_URL}/api/companions/${companionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Companion not found');
            }

            const data = await response.json();
            console.log('✅ Fetched companion:', data.companion?.name);
            return data;

        } catch (error) {
            console.error('❌ Companion fetch error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Create a new learning room/session
     */
    async createRoom(userId, companionId) {
        try {
            console.log('📡 Creating room for:', companionId);
            
            const response = await fetch(`${API_BASE_URL}/api/video/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    companionId: companionId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create room');
            }

            const data = await response.json();
            console.log('✅ Room created:', data.room?.id);
            return data;

        } catch (error) {
            console.error('❌ Room creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get room information
     */
    async getRoom(roomId) {
        try {
            console.log('📡 Fetching room:', roomId);
            
            const response = await fetch(`${API_BASE_URL}/api/video/rooms/${roomId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Room not found');
            }

            const data = await response.json();
            console.log('✅ Room status:', data.room?.status);
            return data;

        } catch (error) {
            console.error('❌ Room fetch error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get WebRTC configuration
     */
    async getWebRTCConfig() {
        try {
            console.log('📡 Fetching WebRTC config');
            
            const response = await fetch(`${API_BASE_URL}/api/webrtc/config`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch WebRTC config');
            }

            const data = await response.json();
            console.log('✅ WebRTC config received');
            return data;

        } catch (error) {
            console.error('❌ WebRTC config error:', error);
            return {
                success: false,
                error: error.message,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                }
            };
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
            console.log('✅ Backend health:', data.status);
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
     * Test backend connection (with retry)
     */
    async testConnection(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`🔍 Testing connection (attempt ${i + 1}/${retries})...`);
                
                const response = await fetch(`${API_BASE_URL}/`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Connection test failed');
                }

                const data = await response.json();
                console.log('✅ Connection test successful!');
                console.log('📊 Backend version:', data.version);
                console.log('👥 Available tutors:', data.tutors);
                return data;

            } catch (error) {
                console.warn(`⚠️ Connection attempt ${i + 1} failed:`, error.message);
                
                if (i === retries - 1) {
                    console.error('❌ All connection attempts failed');
                    return {
                        success: false,
                        error: error.message
                    };
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
    },

    /**
     * Get API base URL
     */
    getBaseURL() {
        return API_BASE_URL;
    },

    /**
     * Check if running locally
     */
    isLocal() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
};

// ============================================
// Auto-Initialize Connection Check
// ============================================

window.addEventListener('load', async () => {
    console.log('🔍 Initializing backend connection...');
    
    const health = await api.checkHealth();
    
    if (health.success) {
        console.log('✅ Backend connected successfully!');
        console.log('📊 Backend Info:', {
            status: health.status,
            tutors: health.tutorsAvailable || 'N/A',
            apiKey: health.apiKeyConfigured ? '✅ Configured' : '❌ Missing'
        });
    } else {
        console.warn('⚠️ Backend connection issue:', health.error);
        console.log('💡 Note: Render free tier has cold starts (30-60s)');
        console.log('💡 The app will still work with local tutor data');
    }
});

// ============================================
// Export for Global Access
// ============================================

window.api = api;
window.API_BASE_URL = API_BASE_URL;

console.log('✅ API service v2.0 loaded');
console.log('🚀 Available methods:', Object.keys(api).join(', '));
