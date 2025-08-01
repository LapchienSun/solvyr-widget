// sunrise-solvyr-widget.js
// Sunrise Solvyr Chatbot Widget
// Version: 2.0.0 - Enhanced UI

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

    // Create widget HTML with enhanced styling
    function createWidgetHTML() {
        const html = `
            <div id="solvyr-widget-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <!-- Chat Bubble -->
                <div id="solvyr-chat-bubble" style="width: 64px; height: 64px; background-color: #f47303; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 32px rgba(244, 115, 3, 0.3); transition: transform 0.2s ease-in-out;">
                    <svg xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 28px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>

                <!-- Chat Window -->
                <div id="solvyr-chat-widget" style="display: none; width: 400px; height: 752px; background: white; border-radius: 16px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12); overflow: hidden; flex-direction: column; border: 1px solid #e5e7eb;">
                    <!-- Header -->
                    <div style="background-color: #1f2937; color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background-color: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-weight: 600; font-size: 14px;">S</span>
                            </div>
                            <div>
                                <h3 style="margin: 0; font-size: 14px; font-weight: 600;">Sunrise Solvyr</h3>
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <div id="solvyr-health-indicator" style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                                    <p style="margin: 0; font-size: 12px; opacity: 0.9;">Online</p>
                                </div>
                            </div>
                        </div>
                        <button id="solvyr-close-widget" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; transition: color 0.15s;">
                            <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Auth Screen -->
                    <div id="solvyr-auth-screen" style="display: flex; flex: 1; align-items: center; justify-content: center; padding: 20px; text-align: center; background: #ffffff;">
                        <div>
                            <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px;">Authenticating...</h3>
                            <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #f97316; border-radius: 50%; animation: solvyr-spin 1s linear infinite; margin: 20px auto;"></div>
                            <p id="solvyr-auth-status" style="color: #6b7280; font-size: 14px;">Checking your session...</p>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div id="solvyr-messages" style="display: none; flex: 1; padding: 24px; overflow-y: auto; background: #ffffff;">
                        <div id="solvyr-messages-container"></div>
                    </div>

                    <!-- Input Area -->
                    <div style="border-top: 1px solid #f3f4f6; padding: 16px; background: white; display: none;" id="solvyr-input-area">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="text" id="solvyr-input" placeholder="Message..." style="flex: 1; padding: 11px 16px; border: 1px solid #d1d5db; border-radius: 22px; outline: none; font-size: 14px; background: #ffffff; color: #111827; font-weight: 400; transition: all 0.15s;">
                            <button id="solvyr-send" style="width: 40px; height: 40px; background: #f97316; color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.15s;">
                                <svg xmlns="http://www.w3.org/2000/svg" style="width: 18px; height: 18px; transform: rotate(-90deg);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <!-- Privacy Footer -->
                        <div style="margin-top: 12px; text-align: center;">
                            <a href="https://www.sunrisesoftware.com/privacy-policy" target="_blank" style="font-size: 11px; color: #9ca3af; text-decoration: none;">Privacy Policy</a>
                            <span style="font-size: 11px; color: #9ca3af;"> | </span>
                            <span style="font-size: 11px; color: #9ca3af;">© Sunrise Software Limited</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                @keyframes solvyr-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes solvyr-fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes solvyr-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }

                #solvyr-chat-bubble:hover {
                    transform: scale(1.05);
                    box-shadow: 0 12px 40px rgba(244, 115, 3, 0.4);
                }

                #solvyr-close-widget:hover {
                    color: white !important;
                }

                #solvyr-input:focus {
                    border-color: transparent;
                    box-shadow: 0 0 0 2px #f97316;
                }

                #solvyr-input::placeholder {
                    color: #9ca3af;
                }

                #solvyr-send:hover {
                    background-color: #ea580c;
                }

                #solvyr-send:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px #f97316;
                }

                .solvyr-message {
                    animation: solvyr-fadeIn 0.3s ease-out;
                }

                .solvyr-user-message {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 12px;
                    animation: solvyr-fadeIn 0.3s ease-out;
                }

                .solvyr-user-bubble {
                    background-color: #1f2937;
                    color: #ffffff;
                    padding: 10px 14px;
                    border-radius: 18px;
                    max-width: 280px;
                    font-size: 14px;
                    line-height: 1.4;
                    font-weight: 400;
                }

                .solvyr-bot-message {
                    color: #111827;
                    line-height: 1.5;
                    margin-bottom: 12px;
                    font-size: 14px;
                    animation: solvyr-fadeIn 0.3s ease-out;
                }

                .solvyr-bot-message p {
                    margin-bottom: 8px;
                    color: #111827;
                }

                .solvyr-bot-message ul {
                    margin: 8px 0;
                    padding-left: 20px;
                }

                .solvyr-bot-message li {
                    margin-bottom: 6px;
                    color: #374151;
                    font-size: 14px;
                }

                .solvyr-bot-message strong {
                    color: #000000;
                    font-weight: 600;
                }

                .solvyr-bot-message h2 {
                    color: #1f2937;
                    margin: 20px 0 16px 0;
                    font-size: 1.3em;
                    font-weight: 600;
                }

                .solvyr-bot-message h3 {
                    color: #1f2937;
                    margin: 16px 0 12px 0;
                    font-size: 1.1em;
                    font-weight: 600;
                }

                .solvyr-typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-bottom: 12px;
                    opacity: 0.6;
                }

                .solvyr-typing-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #9ca3af;
                    border-radius: 50%;
                    animation: solvyr-typing 1.4s ease-in-out infinite;
                }

                .solvyr-typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .solvyr-typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
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
        } else {
            // Focus input if already authenticated
            document.getElementById('solvyr-input').focus();
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
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add user identifier if provided in widget config
        if (widgetState.userIdentifier) {
            headers['X-User-Identifier'] = widgetState.userIdentifier;
            console.log('[Solvyr] Using user identifier from config:', widgetState.userIdentifier);
        }
        
        try {
            const response = await fetch(`${widgetState.config.authApiUrl}/api/get-current-user-details`, {
                method: 'GET',
                credentials: 'include',  // Keep this for backward compatibility
                headers: headers
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
                if (widgetState.userIdentifier) {
                    showAuthError(`User ${widgetState.userIdentifier} not found. Please contact support.`);
                } else {
                    showAuthError('Please log in to your portal first.');
                }
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

        // Add welcome message with enhanced formatting
        const welcomeMessage = widgetState.userDetails?.displayName ? 
            `<p><strong>Hello ${widgetState.userDetails.displayName}!</strong> I'm Sunrise Solvyr.</p><p style="margin-top: 8px;">How can I help you today?</p><p style="font-size: 13px; color: #6b7280; margin-top: 8px;">You can say things like "Create a new ticket" or "Check the status of a ticket".</p>` :
            `<p><strong>Hello! I'm Sunrise Solvyr.</strong> How can I help you today?</p><p style="font-size: 13px; color: #6b7280; margin-top: 8px;">You can say things like "Create a new ticket" or "Check the status of a ticket".</p>`;
        
        const container = document.getElementById('solvyr-messages-container');
        const messageEl = document.createElement('div');
        messageEl.className = 'solvyr-bot-message';
        messageEl.innerHTML = welcomeMessage;
        container.appendChild(messageEl);
        
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

        // Show typing indicator after a short delay
        setTimeout(() => {
            showTyping();
            
            // Make API call after showing typing
            makeApiCall(message);
        }, 500);
    }

    // Make API call
    async function makeApiCall(message) {
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

            hideTyping();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            addBotMessage(data.message || 'Sorry, I encountered an issue.');

            // Check if this was a ticket list response and send follow-up
            if (data.message && (data.message.includes("Here are the most recent tickets:") || 
                data.message.includes("Here are your tickets related to"))) {
                setTimeout(() => {
                    addBotMessage("Is there anything else I can help you with?");
                }, 1000);
            }

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

    // Add bot message with enhanced markdown parsing
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
        const container = document.getElementById('solvyr-messages-container');
        const typingEl = document.createElement('div');
        typingEl.id = 'solvyr-typing';
        typingEl.className = 'solvyr-typing-indicator';
        typingEl.innerHTML = `
            <div class="solvyr-typing-dot"></div>
            <div class="solvyr-typing-dot"></div>
            <div class="solvyr-typing-dot"></div>
            <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">Solvyr is typing...</span>
        `;
        container.appendChild(typingEl);
        scrollToBottom();
    }

    // Hide typing indicator
    function hideTyping() {
        const typingEl = document.getElementById('solvyr-typing');
        if (typingEl) {
            typingEl.remove();
        }
    }

    // Scroll to bottom
    function scrollToBottom() {
        const messages = document.getElementById('solvyr-messages');
        messages.scrollTop = messages.scrollHeight;
    }

    // Enhanced markdown parsing
    function parseMarkdown(text) {
        return text
            // Headers with better spacing
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            
            // Bullet points
            .replace(/^\* (.+)$/gim, '<li>$1</li>')
            .replace(/^\• (.+)$/gim, '<li>$1</li>')
            
            // Wrap consecutive <li> elements in <ul>
            .replace(/(<li>.*<\/li>\n?)+/g, function(match) {
                return '<ul>' + match + '</ul>';
            })
            
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            
            // Wrap content in paragraph if it doesn't start with a block element
            .replace(/^(?!<[h2|h3|ul|ol|li|p])/gim, '<p>')
            .replace(/(?![h2|h3|ul|ol|li|p]>)$/gim, '</p>');
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
    
    // Merge config and store user identifier
    widgetState.config = { ...defaultConfig, ...config };
    
    // Store user identifier for authentication
    if (config && config.userIdentifier) {
        widgetState.userIdentifier = config.userIdentifier;
        console.log('[Solvyr] User identifier provided:', config.userIdentifier);
    }
    
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