let currentPersona = null;
let chatMessages = [];
let activeSessionId = null;

window.addEventListener('pageLoaded', (e) => {
    if (e.detail.path === '/chat') {
        setTimeout(initChat, 50);
    } else {
        isChatInitializing = false;
    }
});

let isChatInitializing = false;

function initChat() {
    isChatInitializing = false;

    currentPersona = null;
    chatMessages = [];

    const selectedPersonaId = localStorage.getItem('selectedPersonaId');
    if (selectedPersonaId) {
        localStorage.removeItem('selectedPersonaId');
        _doStartNewChat(selectedPersonaId);
        return;
    }

    const isReload = performance.navigation.type === 1 || (performance.getEntriesByType("navigation")[0]?.type === "reload");
    const savedSessionId = localStorage.getItem('activeChatSessionId');

    if (isReload && savedSessionId) {
        activeSessionId = savedSessionId;
        loadActiveSession();
    } else {
        showHistory();
    }
}

window.showHistory = () => {
    activeSessionId = null;
    localStorage.removeItem('activeChatSessionId');

    const activeView = document.getElementById('active-chat-view');
    const historyView = document.getElementById('history-view');

    if (activeView) activeView.style.display = 'none';
    if (historyView) {
        historyView.style.display = 'block';
        renderHistory();
    } else {
        setTimeout(window.showHistory, 100);
    }
};

function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');

    if (sessions.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; color: var(--secondary-text); margin-top: 100px; padding: 20px; border: 1px dashed var(--border-color); border-radius: 12px;">
                <p>${t('history_empty')}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${t('history_start_tip')}</p>
            </div>
        `;
        return;
    }

    sessions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    list.innerHTML = sessions.map(session => {
        const char = characters.find(c => c.id === session.personaId);
        if (!char) return '';

        const date = session.timestamp ? new Date(session.timestamp).toLocaleDateString(window.currentLang === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }) : t('history_date_unknown');

        const lastMsg = session.messages && session.messages.length > 0
            ? session.messages[session.messages.length - 1].text
            : t('history_new_chat');

        return `
            <div class="history-card" onclick="openSession('${session.id}')">
                <img src="${char.image}" class="history-card-img" alt="${char.name}">
                <div class="history-card-info">
                    <div class="history-card-name">${char.name}</div>
                    <div class="history-card-preview">${lastMsg}</div>
                </div>
                <div class="history-card-meta">
                    <div style="margin-bottom: 8px; font-size: 0.75rem;">${date}</div>
                    <button class="history-card-delete" onclick="event.stopPropagation(); deleteSession('${session.id}')">${t('delete')}</button>
                </div>
            </div>
        `;
    }).join('');
}

window.openSession = (id) => {
    localStorage.setItem('activeChatSessionId', id);
    activeSessionId = id;
    loadActiveSession();
};

window.deleteSession = (id) => {
    let sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    sessions = sessions.filter(s => s.id !== id);
    localStorage.setItem('chatSessions', JSON.stringify(sessions));

    if (activeSessionId === id) {
        showHistory();
    } else {
        renderHistory();
    }
};

function loadActiveSession() {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const session = sessions.find(s => s.id === activeSessionId);

    if (!session) {
        showHistory();
        return;
    }

    currentPersona = characters.find(c => c.id === session.personaId);
    if (!currentPersona) {
        showHistory();
        return;
    }

    const app = document.getElementById('app');
    const activeChatView = document.getElementById('active-chat-view');
    const historyView = document.getElementById('history-view');

    if (!activeChatView || !historyView) {
        setTimeout(loadActiveSession, 100);
        return;
    }

    isChatInitializing = false;


    historyView.style.display = 'none';
    activeChatView.style.display = 'flex';

    const nameEl = document.getElementById('chat-char-name');
    const headerNameEl = document.getElementById('chat-header-name');
    const eraEl = document.getElementById('chat-char-era');
    const expEl = document.getElementById('chat-char-exp');
    const bioEl = document.getElementById('chat-char-bio');
    const imgEl = document.getElementById('chat-char-img');

    if (nameEl) nameEl.textContent = currentPersona.name;
    if (headerNameEl) headerNameEl.textContent = currentPersona.name;
    if (eraEl) eraEl.textContent = t(currentPersona.era);
    if (expEl) expEl.textContent = currentPersona.expertise.main.map(exp => t(exp)).join(', ');
    if (bioEl) bioEl.textContent = t('bio_' + currentPersona.id);
    if (imgEl) imgEl.src = currentPersona.image;

    const chatMessagesContainer = document.getElementById('chat-messages');
    if (chatMessagesContainer) {
        chatMessagesContainer.style.backgroundImage = `linear-gradient(rgba(38, 34, 24, 0.98), rgba(38, 34, 24, 0.98)), url(${currentPersona.image})`;
        chatMessagesContainer.style.backgroundSize = 'cover';
        chatMessagesContainer.style.backgroundPosition = 'center';
        chatMessagesContainer.style.backgroundRepeat = 'no-repeat';
        chatMessagesContainer.style.backgroundAttachment = 'scroll';
    }

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        const newChatForm = chatForm.cloneNode(true);
        chatForm.parentNode.replaceChild(newChatForm, chatForm);
        newChatForm.addEventListener('submit', handleSendMessage);
    }

    chatMessages = session.messages || [];
    renderMessages();
    setTimeout(attachVoiceButton, 50);
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML = '';
    chatMessages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.role}`;
        msgDiv.textContent = msg.text;
        container.appendChild(msgDiv);
    });
    container.scrollTop = container.scrollHeight;
}

window.startNewChat = (personaId) => {
    const pid = personaId || (currentPersona ? currentPersona.id : null);
    if (!pid) {
        navigateTo('/');
        return;
    }
    _doStartNewChat(pid);
};

function _doStartNewChat(pid) {
    const newSession = {
        id: 'session_' + Date.now(),
        personaId: pid,
        messages: [],
        timestamp: Date.now()
    };

    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    sessions.push(newSession);
    localStorage.setItem('chatSessions', JSON.stringify(sessions));

    activeSessionId = newSession.id;
    localStorage.setItem('activeChatSessionId', newSession.id);
    isChatInitializing = false;
    loadActiveSession();
}


async function handleSendMessage(e) {
    if (e) e.preventDefault();

    const input = document.getElementById('chat-input');
    const text = input.value.trim();

    if (!text || !activeSessionId) return;

    addMessage('user', text);
    input.value = '';

    showTyping(true);

    try {
        const history = chatMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        const responseText = await callGeminiAPI(currentPersona, history);

        showTyping(false);
        addMessage('char', responseText);

    } catch (error) {
        console.error("Chat Error:", error);
        showTyping(false);
        addMessage('char', t('api_error'));
    }
}

function addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);

    chatMessages.push({ role, text });

    if (activeSessionId) {
        let sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const sessionIndex = sessions.findIndex(s => s.id === activeSessionId);
        if (sessionIndex !== -1) {
            sessions[sessionIndex].messages = chatMessages;
            sessions[sessionIndex].timestamp = Date.now();
            localStorage.setItem('chatSessions', JSON.stringify(sessions));
        }
    }

    container.scrollTop = container.scrollHeight;
}

function showTyping(show) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    let indicator = document.getElementById('typing-indicator');

    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'typing';
            indicator.textContent = `${currentPersona.name} ${t('typing_indicator')}`;
            container.appendChild(indicator);
        }
        container.scrollTop = container.scrollHeight;
    } else {
        if (indicator) indicator.remove();
    }
}

let recognition = null;
let isListening = false;

function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();

    const currentLang = localStorage.getItem('lang') || 'tr';
    rec.lang = currentLang === 'tr' ? 'tr-TR' : 'en-US';

    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event) => {
        const input = document.getElementById('chat-input');
        if (!input) return;
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        input.value = transcript;
    };

    rec.onend = () => {
        setListeningState(false);
    };

    rec.onerror = (e) => {
        console.warn('Mikrofon Hatası:', e.error);
        setListeningState(false);
    };

    return rec;
}

function setListeningState(listening) {
    isListening = listening;
    const btn = document.getElementById('voice-btn');
    if (!btn) return;
    if (listening) {
        btn.classList.add('voice-listening');
        btn.innerText = '🔴';
    } else {
        btn.classList.remove('voice-listening');
        btn.innerText = '🎤';
    }
}

function toggleVoice() {
    if (isListening) {
        if (recognition) recognition.stop();
        return;
    }

    if (!recognition) recognition = initVoiceRecognition();

    if (!recognition) {
        alert(t('voice_error'));
        return;
    }

    try {
        recognition.start();
        setListeningState(true);
    } catch (err) {
        setListeningState(false);
    }
}

function attachVoiceButton() {
    const btn = document.getElementById('voice-btn');
    if (btn && !btn._attached) {
        btn.onclick = toggleVoice;
        btn._attached = true;
    }
}
