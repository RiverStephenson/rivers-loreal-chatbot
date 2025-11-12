/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = '<div class="msg ai">👋 Hello! How can I help you today?</div>';

const workerUrl = 'https://lorealworker.riverstephenson.workers.dev';

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to chat
  addMessage(message, 'user');
  
  // Clear input
  userInput.value = '';

  try {
    // Send request to Cloudflare Worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a L\'Oréal Smart Product Advisor. You ONLY answer questions related to L\'Oréal brands, products, skincare, makeup, haircare, beauty routines, and product recommendations. If someone asks about anything unrelated to L\'Oréal or beauty/cosmetics (like other brands, general topics, personal life, etc.), politely redirect them by saying "I\'m here to help with L\'Oréal products and beauty advice. How can I assist you with skincare, makeup, or haircare today?" Keep responses helpful, friendly, and focused exclusively on L\'Oréal and beauty topics.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      addMessage(data.choices[0].message.content, 'ai');
    } else {
      addMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
  } catch (error) {
    console.error('Error:', error);
    addMessage('Sorry, I encountered an error. Please try again.', 'ai');
  }
});

/* Add message to chat window */
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `msg ${sender}`;
  messageDiv.textContent = text;
  
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
