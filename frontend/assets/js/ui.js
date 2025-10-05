/**
 * UI Helper Functions
 */

const UIHelpers = {
    /**
     * Create floating particles
     */
    createParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 5 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = Math.random() * 3 + 4 + 's';
            container.appendChild(particle);
        }
    },

    /**
     * Parse message for rich content (YouTube, links, code)
     */
    parseMessage(text) {
        // YouTube Links
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
        text = text.replace(youtubeRegex, (match, videoId) => {
            return `<div class="youtube-embed mt-3"><iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
        });

        // Regular URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, (url) => {
            if (url.includes('youtube.com') || url.includes('youtu.be')) return url;
            return `<a href="${url}" target="_blank" class="text-blue-400 hover:text-blue-300 underline">${url}</a>`;
        });

        // Code blocks
        const codeRegex = /``````/g;
        text = text.replace(codeRegex, (match, lang, code) => {
            return `<div class="code-block"><pre><code class="language-${lang || 'plaintext'}">${this.escapeHtml(code.trim())}</code></pre></div>`;
        });

        // Inline code
        const inlineCodeRegex = /`([^`]+)`/g;
        text = text.replace(inlineCodeRegex, '<code class="bg-gray-800 px-2 py-1 rounded text-pink-400">$1</code>');

        // Bold text
        const boldRegex = /\*\*([^*]+)\*\*/g;
        text = text.replace(boldRegex, '<strong>$1</strong>');

        // Line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Add message to chat
     */
    /**
 * Add message to chat
 */
addMessage(text, sender, isThinking = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Remove welcome message if exists
    const welcomeMsg = chatMessages.querySelector('.text-center');
    if (welcomeMsg) welcomeMsg.remove();

    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper flex ${sender === 'user' ? 'justify-end' : sender === 'system' ? 'justify-center' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender} max-w-lg rounded-2xl px-6 py-4`;

    if (isThinking) {
        bubble.id = 'thinking-bubble';
        bubble.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    } else {
        bubble.innerHTML = this.parseMessage(text);
    }

    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Highlight code blocks
    if (typeof hljs !== 'undefined') {
        bubble.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }
},


    /**
     * Update last thinking message
     */
    updateLastMessage(text) {
        const thinkingBubble = document.getElementById('thinking-bubble');
        if (thinkingBubble) {
            thinkingBubble.id = '';
            thinkingBubble.innerHTML = this.parseMessage(text);
            
            if (typeof hljs !== 'undefined') {
                thinkingBubble.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }
        } else {
            this.addMessage(text, 'tutor');
        }
    },

    /**
     * Show achievement popup
     */
    showAchievement(text) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-2">🏆</div>
                <div class="font-bold text-xl">${text}</div>
            </div>
        `;
        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 3000);
    },

    /**
     * Show reaction animation
     */
    showReaction(emoji) {
        const reaction = document.createElement('div');
        reaction.className = 'fixed text-6xl z-50';
        reaction.style.left = Math.random() * 80 + 10 + '%';
        reaction.style.top = Math.random() * 80 + 10 + '%';
        reaction.style.animation = 'ping 1s cubic-bezier(0, 0, 0.2, 1)';
        reaction.textContent = emoji;
        document.body.appendChild(reaction);

        setTimeout(() => reaction.remove(), 1000);
    },

    /**
     * Update timer display
     */
    updateTimer(startTime) {
        const timerElement = document.getElementById('call-timer');
        if (!timerElement || !startTime) return;

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    },

    /**
     * Update game stats
     */
    updateStats(stats) {
        const elements = {
            points: document.getElementById('points-display'),
            level: document.getElementById('level-display'),
            streak: document.getElementById('streak-display'),
            questions: document.getElementById('questions-display')
        };

        if (elements.points) elements.points.textContent = stats.points;
        if (elements.level) elements.level.textContent = stats.level;
        if (elements.streak) elements.streak.textContent = stats.streak;
        if (elements.questions) elements.questions.textContent = stats.questionsAsked;
    },

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    },

    /**
     * Hide error message
     */
    hideError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    },

    /**
     * Show loading
     */
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    },

    /**
     * Hide loading
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
};
