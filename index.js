const chatLog = document.getElementById('chat-log'),
    userInput = document.getElementById('user-input'),
    sendButton = document.getElementById('send-button'),
    buttonIcon = document.getElementById('button-icon'),
    info = document.querySelector('.info'),
    themeToggle = document.getElementById('theme-toggle'),
    scrollRegion = document.getElementById('scroll-region');

// Theme setup
(function initTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon();
    } catch (_) { }
})();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (_) { }
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    const isLight = (document.documentElement.getAttribute('data-theme') === 'light');
    const i = themeToggle?.querySelector('i');
    if (!i) return;
    i.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

sendButton.addEventListener('click', sendMessage);
// Textarea behavior: Enter to send, Shift+Enter for newline
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
});

function sendMessage() {
    const message = userInput.value.trim();
    // if message = empty do nothing
    if (message === '') {
        return;
    }
    // if message = developer - show our message
    else if (message === 'developer') {
        // clear input value
        userInput.value = '';
        // append message as user - we will code it's function
        appendMessage('user', message);
        // sets a fake timeout that showing loading on send button
        setTimeout(() => {
            // send our message as bot(sender : bot)
            appendMessage('bot', 'This Source Coded By MoizMalik');
            // change button icon to default
            buttonIcon.classList.add('fa-solid', 'fa-paper-plane');
            buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        }, 2000);
        return;
    }

    // else if none of above
    // appends users message to screen
    appendMessage('user', message);
    userInput.value = '';
    userInput.dispatchEvent(new Event('input'));
    sendButton.disabled = true;

    // show send button microinteraction and spinner
    sendButton.classList.add('btn-sending');
    buttonIcon.classList.remove('fa-solid', 'fa-paper-plane');
    buttonIcon.classList.add('fas', 'fa-spinner', 'fa-pulse');

    // add a typing indicator bubble for bot
    const typingEl = document.createElement('div');
    const typingIcon = document.createElement('div');
    const typingBubble = document.createElement('div');
    typingEl.classList.add('chat-box', 'row', 'bot-row');
    typingIcon.classList.add('icon');
    typingIcon.setAttribute('id', 'bot-icon');
    typingBubble.classList.add('bubble', 'bot', 'typing-bubble');
    typingBubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    typingEl.appendChild(typingIcon);
    typingEl.appendChild(typingBubble);
    chatLog.appendChild(typingEl);
    // keep reference so we can remove it later


    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'Your Key',
            'X-RapidAPI-Host': 'chatgpt53.p.rapidapi.com'
            // if you want use official api
            /*
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'Your Key',
            'X-RapidAPI-Host': 'openai80.p.rapidapi.com'
            */
        },
        body: `{"messages":[{"role":"user","content":"${message}"}]}`
        // if you want use official api you need have this body
        // `{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"${message}"}]}`
    };
    // official api : 'https://openai80.p.rapidapi.com/chat/completions';
    fetch('https://chatgpt53.p.rapidapi.com/', options).then((response) => response.json()).then((response) => {
        // remove typing indicator
        if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
        // append actual response
        appendMessage('bot', response.choices[0].message.content);

        // restore send button
        buttonIcon.classList.add('fa-solid', 'fa-paper-plane');
        buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        sendButton.disabled = false;
        sendButton.classList.remove('btn-sending');
    }).catch((err) => {
        if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
        if (err.name === 'TypeError') {
            appendMessage('bot', 'Error : Check Your Api Key!');
        } else {
            appendMessage('bot', 'An error occurred.');
        }
        buttonIcon.classList.add('fa-solid', 'fa-paper-plane');
        buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        sendButton.disabled = false;
        sendButton.classList.remove('btn-sending');
    });
}

function appendMessage(sender, message) {
    info.style.display = "none";
    const messageElement = document.createElement('div');
    const iconElement = document.createElement('div');
    const chatElement = document.createElement('div');
    const icon = document.createElement('i');

    chatElement.classList.add("chat-box", "row", sender === 'user' ? 'user-row' : 'bot-row');
    iconElement.classList.add("icon");
    messageElement.classList.add('bubble', sender);
    messageElement.innerText = message;

    // add icons depending on who send message bot or user
    if (sender === 'user') {
        icon.classList.add('fa-solid', 'fa-user');
        iconElement.setAttribute('id', 'user-icon');
    } else {
        icon.classList.add('fa-solid', 'fa-robot');
        iconElement.setAttribute('id', 'bot-icon');
    }

    iconElement.appendChild(icon);
    chatElement.appendChild(iconElement);
    chatElement.appendChild(messageElement);
    chatLog.appendChild(chatElement);

    // Scroll to the bottom smoothly
    scrollRegion.scrollTo({
        top: scrollRegion.scrollHeight,
        behavior: 'smooth'
    });
}