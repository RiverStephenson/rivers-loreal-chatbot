/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = '<div class="msg ai"><div class="message-bubble">👋 Hello! How can I help you today?</div></div>';

const workerUrl = 'https://lorealworker.riverstephenson.workers.dev';

// Track conversation history
let conversationHistory = [
  {
    role: 'system',
    content: 'You are a L\'Oréal Smart Product Advisor. You ONLY answer questions related to L\'Oréal brands, products, skincare, makeup, haircare, beauty routines, and product recommendations. If someone asks about anything unrelated to L\'Oréal or beauty/cosmetics (like other brands, general topics, personal life, etc.), politely redirect them by saying "I\'m here to help with L\'Oréal products and beauty advice. How can I assist you with skincare, makeup, or haircare today?" Keep responses helpful, friendly, and focused exclusively on L\'Oréal and beauty topics. Remember the user\'s name and previous questions to maintain conversational context.'
  }
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Display latest question above chatbox
  displayLatestQuestion(message);

  // Add user message to chat and history
  addMessage(message, 'user');
  conversationHistory.push({
    role: 'user',
    content: message
  });
  
  // Clear input
  userInput.value = '';

  // Add thinking message
  const thinkingMessage = addMessage('Thinking...', 'ai');

  try {
    // Send request to Cloudflare Worker with full conversation history
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    // Remove thinking message
    thinkingMessage.remove();
    
    if (data.choices && data.choices[0]) {
      const aiResponse = data.choices[0].message.content;
      addMessage(aiResponse, 'ai');
      
      // Add AI response to conversation history
      conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });
    } else {
      addMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
  } catch (error) {
    console.error('Error:', error);
    // Remove thinking message
    thinkingMessage.remove();
    addMessage('Sorry, I encountered an error. Please try again.', 'ai');
  }
});

/* Display latest question above chatbox */
function displayLatestQuestion(question) {
  let questionDisplay = document.getElementById('latestQuestion');
  
  if (!questionDisplay) {
    questionDisplay = document.createElement('div');
    questionDisplay.id = 'latestQuestion';
    questionDisplay.className = 'latest-question';
    chatForm.parentNode.insertBefore(questionDisplay, chatForm);
  }
  
  questionDisplay.textContent = `Latest: ${question}`;
}

/* Add message to chat window */
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  
  messageDiv.appendChild(bubble);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return messageDiv;
}
