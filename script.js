/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = '<div class="msg ai">👋 Hello! How can I help you today?</div>';

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
    // Send request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful L\'Oréal product advisor. Help users with product recommendations, beauty routines, and skincare advice.'
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
