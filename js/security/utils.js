/**
 * MindWeave Platform - Security Utilities
 * Input sanitization, rate limiting, and security helpers
 */

// ============ Input Sanitization ============
const Security = {
    /**
     * Sanitize user input to prevent XSS/Prompt Injection
     */
    sanitize(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '') // Remove brackets
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    },

    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate password strength
     */
    validatePassword(password) {
        return password && password.length >= 6;
    },

    /**
     * Escape HTML to prevent XSS when displaying user content
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ============ Rate Limiting ============
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    canMakeRequest(key = 'default') {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        
        // Remove old requests outside the window
        const recentRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        
        // Add current request
        recentRequests.push(now);
        this.requests.set(key, recentRequests);
        return true;
    }

    getRemainingRequests(key = 'default') {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        const recentRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        return Math.max(0, this.maxRequests - recentRequests.length);
    }

    reset(key = 'default') {
        this.requests.delete(key);
    }
}

// Rate limiters for different features
const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute for API
const promptRateLimiter = new RateLimiter(5, 60000); // 5 prompts per minute

// ============ API Key Protection ============
const API = {
    // Note: In production, use server-side proxy to hide API keys
    // This is a client-side wrapper with rate limiting and sanitization
    
    async callGroq(message) {
        if (!promptRateLimiter.canMakeRequest('prompt')) {
            throw new Error('Rate limit exceeded. Please wait a moment.');
        }

        // Sanitize input
        const sanitizedMessage = Security.sanitize(message);
        
        if (!sanitizedMessage || sanitizedMessage.length < 5) {
            throw new Error('Message too short');
        }

        try {
            const response = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: sanitizedMessage })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async callBackend(endpoint, options = {}) {
        if (!apiRateLimiter.canMakeRequest(endpoint)) {
            throw new Error('Too many requests. Please wait.');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await fetch(`/api/${endpoint}`, {
                ...defaultOptions,
                ...options
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// ============ CSP Helper ============
function applyCSP() {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://mtirzcuntupkuavmjtcv.supabase.co https://api.groq.com https://integrate.api.nvidia.com",
        "frame-ancestors 'none'"
    ].join('; ');
    document.head.appendChild(cspMeta);
}

// Apply CSP on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCSP);
} else {
    applyCSP();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Security, RateLimiter, API };
}