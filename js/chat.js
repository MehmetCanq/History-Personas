
let currentPersona = null;
let chatMessages = [];

window.addEventListener('pageLoaded', (e) => {
    if (e.detail.path === '/chat') {
        initChat();
    }
});

function initChat() {
    const personaId = localStorage.getItem('selectedPersonaId');
    if (!personaId) {
        navigateTo('/');
        return;
    }

    currentPersona = characters.find(c => c.id === personaId);
    if (!currentPersona) {
        navigateTo('/');
        return;
    }

    document.getElementById('chat-char-name').textContent = currentPersona.name;
    document.getElementById('chat-header-name').textContent = currentPersona.name;
    document.getElementById('chat-char-era').textContent = currentPersona.era;
    document.getElementById('chat-char-exp').textContent = currentPersona.expertise.main.join(', ');
    document.getElementById('chat-char-bio').textContent = currentPersona.coreIdentity;
    document.getElementById('chat-char-img').src = currentPersona.image;

    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', handleSendMessage);

    chatMessages = [];
    document.getElementById('chat-messages').innerHTML = '';
}

async function handleSendMessage(e) {
    if (e) e.preventDefault();

    const input = document.getElementById('chat-input');
    const text = input.value.trim();

    if (!text) return;

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
        addMessage('char', "Maalesef şu an bağlantı kuramıyorum. Lütfen biraz sonra tekrar dene.");
    }
}

function addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);

    chatMessages.push({ role, text });

    container.scrollTop = container.scrollHeight;
}

function showTyping(show) {
    const container = document.getElementById('chat-messages');
    let indicator = document.getElementById('typing-indicator');

    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'typing';
            indicator.textContent = `${currentPersona.name} yazıyor...`;
            container.appendChild(indicator);
        }
        container.scrollTop = container.scrollHeight;
    } else {
        if (indicator) indicator.remove();
    }
}
