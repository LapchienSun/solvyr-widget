// sunrise-solvyr-widget.js
// Sunrise Solvyr Chatbot Widget
// Version: 1.0.0

(function() {
    'use strict';

    // Create namespace
    window.SunriseSolvyr = window.SunriseSolvyr || {};

    // Widget configuration
    const defaultConfig = {
        chatApiUrl: 'https://solvyr-chatbot.sunrise-saas.com/chat',
        authApiUrl: 'https://chatbot-api-admin.sunrise-saas.com',
        position: 'bottom-right',
        theme: {
            primaryColor: '#f47303',
            headerColor: '#1f2937'
        }
    };

    // Widget state
    let widgetState = {
        isOpen: false,
        isAuthenticated: false,
        sessionId: generateUUID(),
        authToken: null,
        userDetails: null,
        config: defaultConfig
    };

    // Generate UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Create widget HTML
    function createWidgetHTML() {
        const html = `
            <div id="solvyr-widget-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <!-- Chat Bubble -->
                <div id="solvyr-chat-bubble" style="width: 64px; height: 64px; background-color: ${widgetState.config.theme.primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 32px rgba(244, 115, 3, 0.3); transition: transform 0.2s;">
                    <svg xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 28px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>

                <!-- Chat Window -->
                <div id="solvyr-chat-widget" style="display: none; width: 400px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12); overflow: hidden; flex-direction: column;">
                    <!-- Header -->
                    <div style="background-color: ${widgetState.config.theme.headerColor}; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background-color: ${widgetState.config.theme.primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-weight: 600; font-size: 14px;">S</span>
                            </div>
                            <div>
                                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Sunrise Solvyr</h3>
                                <p style="margin: 0; font-size: 12px; opacity: 0.9;">AI Support Assistant</p>
                            </div>
                        </div>
                        <button id="solvyr-close-widget" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
                            <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Auth Screen -->
                    <div id="solvyr-auth-screen" style="display: flex; flex: 1; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                        <div>
                            <h3 style="color: ${widgetState.config.theme.headerColor}; margin-bottom: 10px;">Authenticating...</h3>
                            <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid ${widgetState.config.theme.primaryColor}; border-radius: 50%; animation: solvyr-spin 1s linear infinite; margin: 20px auto;"></div>
                            <p id="solvyr-auth-status" style="color: #6b7280; font-size: 14px;">Checking your session...</p>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div id="solvyr-messages" style="display: none; flex: 1; padding: 20px; overflow-y: auto; background: #f8f9fa;">
                        <div id="solvyr-messages-container"></div>
                    </div>

                    <!-- Typing Indicator -->
                    <div id="solvyr-typing" style="display: none; padding: 0 20px 20px;">
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: white; padding: 12px 16px; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                            <div style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: solvyr-typing 1.4s infinite;"></div>
                            <div style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: solvyr-typing 1.4s infinite; animation-delay: 0.2s;"></div>
                            <div style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: solvyr-typing 1.4s infinite; animation-delay: 0.4s;"></div>
                            <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">Solvyr is typing...</span>
                        </div>
                    </div>

                    <!-- Input -->
                    <div style="border-top: 1px solid #e5e7eb; padding: 16px; background: white; display: none;" id="solvyr-input-area">
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="solvyr-input" placeholder="Type your message..." style="flex: 1; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 20px; outline: none; font-size: 14px;">
                            <button id="solvyr-send" style="width: 40px; height: 40px; background: ${widgetState.config.theme.primaryColor}; color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                @keyframes solvyr-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes solvyr-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }

                #solvyr-chat-bubble:hover {
                    transform: scale(1.05);
                }

                #solvyr-input:focus {
                    border-color: ${widgetState.config.theme.primaryColor};
                    box-shadow: 0 0 0 2px ${widgetState.config.theme.primaryColor}33;
                }

                #solvyr-send:hover {
                    opacity: 0.9;
                }

                .solvyr-message {
                    margin-bottom: 16px;
                    animation: solvyr-fadeIn 0.3s ease-out;
                }

                @keyframes solvyr-fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .solvyr-user-message {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 16px;
                }

                .solvyr-user-bubble {
                    background: ${widgetState.config.theme.headerColor};
                    color: white;
                    padding: 10px 16px;
                    border-radius: 18px;
                    max-width: 280px;
                    font-size: 14px;
                }

                .solvyr-bot-message {
                    color: #111827;
                    line-height: 1.5;
                    margin-bottom: 16px;
                    font-size: 14px;
                }

                .solvyr-bot-message strong {
                    color: #000;
                    font-weight: 600;
                }
            </style>
        `;

        // Create container and add to page
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // Add event listeners
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Chat bubble click
        document.getElementById('solvyr-chat-bubble').addEventListener('click', openWidget);

        // Close button
        document.getElementById('solvyr-close-widget').addEventListener('click', closeWidget);

        // Send button
        document.getElementById('solvyr-send').addEventListener('click', sendMessage);

        // Enter key in input
        document.getElementById('solvyr-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Open widget
    function openWidget() {
        const widget = document.getElementById('solvyr-chat-widget');
        widget.style.display = 'flex';
        document.getElementById('solvyr-chat-bubble').style.display = 'none';
        widgetState.isOpen = true;

        // Start authentication if not already authenticated
        if (!widgetState.isAuthenticated) {
            authenticate();
        }
    }

    // Close widget
    function closeWidget() {
        document.getElementById('solvyr-chat-widget').style.display = 'none';
        document.getElementById('solvyr-chat-bubble').style.display = 'flex';
        widgetState.isOpen = false;
    }

    // Authentication
    async function authenticate() {
        console.log('[Solvyr] Starting authentication...');
        
        try {
            const response = await fetch(`${widgetState.config.authApiUrl}/api/get-current-user-details`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('[Solvyr] Auth response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('[Solvyr] Authentication successful:', data);
                
                widgetState.isAuthenticated = true;
                widgetState.authToken = data.apiToken;
                widgetState.userDetails = data;
                
                showChatInterface();
            } else if (response.status === 403) {
                const error = await response.json();
                showAuthError(error.message || 'Access denied. Please contact support.');
            } else if (response.status === 401) {
                showAuthError('Please log in to your portal first.');
            } else {
                showAuthError('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('[Solvyr] Auth error:', error);
            showAuthError('Connection error. Please check your connection.');
        }
    }

    // Show authentication error
    function showAuthError(message) {
        const authStatus = document.getElementById('solvyr-auth-status');
        authStatus.innerHTML = `<span style="color: #dc2626;">${message}</span>`;
    }

    // Show chat interface
    function showChatInterface() {
        document.getElementById('solvyr-auth-screen').style.display = 'none';
        document.getElementById('solvyr-messages').style.display = 'block';
        document.getElementById('solvyr-input-area').style.display = 'block';

        // Add welcome message
        const welcomeMessage = widgetState.userDetails?.displayName ? 
            `Hello ${widgetState.userDetails.displayName}! I'm Sunrise Solvyr. How can I help you today?` :
            `Hello! I'm Sunrise Solvyr. How can I help you today?`;
        
        addBotMessage(welcomeMessage);
        
        // Focus input
        document.getElementById('solvyr-input').focus();
    }

    // Send message
    async function sendMessage() {
        const input = document.getElementById('solvyr-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        addUserMessage(message);
        input.value = '';

        // Show typing indicator
        showTyping();

        try {
            const response = await fetch(widgetState.config.chatApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${widgetState.authToken}`
                },
                body: JSON.stringify({
                    message: message,
                    session_id: widgetState.sessionId
                })
            });

            const data = await response.json();
            hideTyping();
            
            addBotMessage(data.message || 'Sorry, I encountered an issue.');
        } catch (error) {
            console.error('[Solvyr] Chat error:', error);
            hideTyping();
            addBotMessage('I\'m having trouble connecting. Please try again later.');
        }
    }

    // Add user message
    function addUserMessage(text) {
        const container = document.getElementById('solvyr-messages-container');
        const messageEl = document.createElement('div');
        messageEl.className = 'solvyr-user-message';
        messageEl.innerHTML = `<div class="solvyr-user-bubble">${escapeHtml(text)}</div>`;
        container.appendChild(messageEl);
        scrollToBottom();
    }

    // Add bot message
    function addBotMessage(text) {
        const container = document.getElementById('solvyr-messages-container');
        const messageEl = document.createElement('div');
        messageEl.className = 'solvyr-bot-message';
        messageEl.innerHTML = parseMarkdown(text);
        container.appendChild(messageEl);
        scrollToBottom();
    }

    // Show typing indicator
    function showTyping() {
        document.getElementById('solvyr-typing').style.display = 'block';
        scrollToBottom();
    }

    // Hide typing indicator
    function hideTyping() {
        document.getElementById('solvyr-typing').style.display = 'none';
    }

    // Scroll to bottom
    function scrollToBottom() {
        const messages = document.getElementById('solvyr-messages');
        messages.scrollTop = messages.scrollHeight;
    }

    // Parse markdown
    function parseMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize widget
    function init(config) {
        console.log('[Solvyr] Initializing widget...');
        
        // Merge config
        widgetState.config = { ...defaultConfig, ...config };
        
        // Create widget HTML
        createWidgetHTML();
        
        console.log('[Solvyr] Widget initialized');
    }

    // Public API
    window.SunriseSolvyr = {
        init: init,
        open: openWidget,
        close: closeWidget,
        getState: () => widgetState
    };

    // Auto-initialize if config is present
    if (window.solvyrConfig) {
        init(window.solvyrConfig);
    }
})();