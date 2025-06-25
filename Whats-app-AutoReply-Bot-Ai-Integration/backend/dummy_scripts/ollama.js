const axios = require('axios');

async function talkToDeepSeek(prompt) {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'deepseek-chat:base',  // or 'deepseek-coder:6.7b'
            prompt: prompt,
            stream: false
        });

        console.log('Bot:', response.data.response);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Example usage:
talkToDeepSeek("What is DeepSeek?");
