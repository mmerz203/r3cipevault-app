// test-cors.js
const axios = require('axios');

(async () => {
  try {
    const response = await axios.post(
      'https://us-central1-r3cpievault-app.cloudfunctions.net/scanRecipeImage',
      { dummy: 'data' }, // Replace with actual payload if needed
      {
        headers: {
          Origin: 'http://localhost:5173',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response received:');
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ Server responded with error:');
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Body:', error.response.data);
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
})();
