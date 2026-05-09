// ============================
// GABONEXPLORE – CHATBOT IA (Kaya)
// Powered by Claude API
// ============================

const CHATBOT_SYSTEM = `Tu es Kaya, l'assistant IA de GabonExplore, une agence de tourisme premium spécialisée dans les voyages au Gabon.

Ton rôle est de :
- Conseiller les voyageurs sur les destinations au Gabon (Parc de la Lopé, Parc de Loango, Libreville, Monts de Cristal, Parc d'Ivindo)
- Aider à choisir le bon circuit selon les intérêts (nature, culture, aventure, plages)
- Donner des informations sur les tarifs, disponibilités et services
- Encourager la réservation via le site
- Répondre sur les démarches visa, vaccins recommandés, meilleure période pour visiter

Destinations et tarifs :
- Parc de la Lopé (UNESCO) : Safaris gorilles, éléphants, forêt équatoriale. À partir de 290€/pers (7 jours min.)
- Parc de Loango : Hippopotames sur plage, baleines, éléphants bord de mer. À partir de 350€/pers
- Libreville : Ville & culture, marchés, gastronomie. À partir de 180€/pers
- Monts de Cristal : Randonnées, cascades, biodiversité. À partir de 220€/pers
- Parc d'Ivindo : Chutes de Kongou, gorilles. À partir de 310€/pers

Pour les réservations, dirigeindiquez l'URL : /pages/reservations.html

Réponds toujours en français de manière chaleureuse, professionnelle et enthousiaste. Sois concis (2-3 phrases max par message). Utilise des emojis avec modération. Si quelqu'un veut réserver, invite-les à remplir le formulaire de réservation.`;

let chatHistory = [];
let isTyping = false;

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || isTyping) return;
  input.value = '';
  addUserMessage(text);
  await getAIResponse(text);
}

function sendQuick(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function addUserMessage(text) {
  chatHistory.push({ role: 'user', content: text });
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'wmsg user-msg';
  div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  messages.appendChild(div);
  scrollToBottom();
}

function addBotMessage(text) {
  chatHistory.push({ role: 'assistant', content: text });
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'wmsg';
  div.innerHTML = `<div class="bot-avatar">🌿</div><div class="bubble">${formatMessage(text)}</div>`;
  messages.appendChild(div);
  scrollToBottom();
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'wmsg typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="bot-avatar">🌿</div><div class="bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  messages.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

async function getAIResponse(userMessage) {
  isTyping = true;
  showTyping();
  document.getElementById('chatStatus').textContent = '● Kaya réfléchit...';
  document.getElementById('chatStatus').style.color = '#e8c96a';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: CHATBOT_SYSTEM,
        messages: chatHistory.filter(m => m.role === 'user' || m.role === 'assistant')
      })
    });

    const data = await response.json();
    hideTyping();

    if (data.content && data.content[0]) {
      const reply = data.content[0].text;
      addBotMessage(reply);
    } else {
      addBotMessage('Je suis désolée, une erreur est survenue. Contactez-nous au +241 01 23 45 67 pour assistance. 📞');
    }
  } catch (err) {
    hideTyping();
    // Fallback responses when API is not configured
    const fallbacks = getFallbackResponse(userMessage);
    addBotMessage(fallbacks);
  } finally {
    isTyping = false;
    document.getElementById('chatStatus').textContent = '● En ligne';
    document.getElementById('chatStatus').style.color = '#6edb8a';
  }
}

function getFallbackResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('gorille') || m.includes('lopé') || m.includes('lope')) {
    return "Le Parc de la Lopé est notre destination phare pour observer les gorilles ! 🦍 Nos circuits commencent à 290€/personne pour 7 jours. Voulez-vous réserver ? <a href='/pages/reservations.html?dest=lope' style='color:var(--gold-light)'>Réserver maintenant →</a>";
  }
  if (m.includes('prix') || m.includes('tarif') || m.includes('coût')) {
    return "Nos tarifs varient de 180€ (Libreville, 3j) à 350€ (Loango, 7j) par personne. Tous nos circuits incluent hébergement, transferts et guide local. 🌿";
  }
  if (m.includes('réserv') || m.includes('book')) {
    return "Parfait ! Je vous dirige vers notre <a href='/pages/reservations.html' style='color:var(--gold-light)'>formulaire de réservation sécurisé →</a> Paiement Visa/Mastercard accepté. ✅";
  }
  if (m.includes('whale') || m.includes('baleine') || m.includes('loango')) {
    return "Le Parc de Loango est magique pour observer les baleines à bosse (juin–octobre) et les éléphants sur la plage ! 🐋 Circuit à partir de 350€. <a href='/pages/reservations.html?dest=loango' style='color:var(--gold-light)'>Réserver →</a>";
  }
  return "Bonjour ! Je suis Kaya, votre conseillère voyage GabonExplore 🌿 Dites-moi ce qui vous intéresse : gorilles, plages, culture, aventure ? Je trouverai le circuit parfait pour vous !";
}

function formatMessage(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scrollToBottom() {
  const messages = document.getElementById('chatMessages');
  if (messages) messages.scrollTop = messages.scrollHeight;
}

// Allow Enter key in chat input
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});
