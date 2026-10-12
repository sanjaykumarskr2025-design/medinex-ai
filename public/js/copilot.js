/**
 * MediNex AI — AI Health Copilot Chat Logic
 */

import { apiCall, getUser } from './auth.js';
import { getCurrentLanguage } from './translations.js';
import { showToast } from './app.js';

let currentConversationId = null;

async function loadCopilot() {
  const sendBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatInput');
  const newConvBtn = document.getElementById('newConversationBtn');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => sendChatMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (newConvBtn) {
    newConvBtn.addEventListener('click', () => {
      currentConversationId = null;
      document.getElementById('chatMessages').innerHTML = `
        <div class="message assistant-message">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>New conversation started. How can I assist with your health questions today?</p>
            <p class="message-note">⚕️ I provide general information only, not medical diagnosis.</p>
          </div>
        </div>
      `;
    });
  }

  document.querySelectorAll('.suggested-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.textContent;
        sendChatMessage();
      }
    });
  });

  loadConversationsList();
}

async function loadConversationsList() {
  const listEl = document.getElementById('conversationsList');
  if (!listEl) return;

  try {
    const res = await apiCall('/api/copilot/conversations');
    const conversations = res.conversations || [];

    if (conversations.length === 0) {
      listEl.innerHTML = '<p class="text-muted">No past conversations.</p>';
      return;
    }

    listEl.innerHTML = conversations.map(c => `
      <div class="conversation-item ${c.id === currentConversationId ? 'active' : ''}" data-id="${c.id}">
        <span>💬 ${escapeHtml(c.title || 'Conversation')}</span>
      </div>
    `).join('');

    listEl.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        currentConversationId = item.getAttribute('data-id');
        loadConversationMessages(currentConversationId);
        listEl.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  } catch (err) {
    console.error('Failed to load conversations:', err);
  }
}

async function loadConversationMessages(convId) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  try {
    const res = await apiCall(`/api/copilot/conversations/${convId}`);
    const messages = res.messages || [];

    chatMessages.innerHTML = messages.map(m => `
      <div class="message ${m.role === 'user' ? 'user-message' : 'assistant-message'}">
        <div class="message-avatar">${m.role === 'user' ? '👤' : '🤖'}</div>
        <div class="message-content">
          <p>${escapeHtml(m.content).replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    showToast('Failed to load messages', 'error');
  }
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  if (!chatInput || !chatMessages) return;

  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';

  // Append user message
  chatMessages.innerHTML += `
    <div class="message user-message">
      <div class="message-avatar">👤</div>
      <div class="message-content"><p>${escapeHtml(text)}</p></div>
    </div>
  `;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Append loading indicator
  const loadingId = 'loading-' + Date.now();
  chatMessages.innerHTML += `
    <div class="message assistant-message" id="${loadingId}">
      <div class="message-avatar">🤖</div>
      <div class="message-content"><p class="typing-indicator"><span>.</span><span>.</span><span>.</span></p></div>
    </div>
  `;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await apiCall('/api/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: text,
        conversation_id: currentConversationId,
        language: getCurrentLanguage()
      })
    });

    currentConversationId = res.conversation_id;
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    chatMessages.innerHTML += `
      <div class="message assistant-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <p>${escapeHtml(res.reply).replace(/\n/g, '<br>')}</p>
          ${res.demo_mode ? '<p class="message-note">ℹ️ Demo Mode: Configure AI API key in .env for live AI responses.</p>' : ''}
        </div>
      </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    loadConversationsList();

  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    showToast('AI Copilot error: ' + err.message, 'error');
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { loadCopilot };
