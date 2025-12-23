// Simple Node.js test to verify Gemini API key is working
const API_KEY = "AIzaSyAkxJ5gYD1cIHwqm3YSTq_Dq3Ch0_KhZHw";
// Updated to use the correct model name
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`;

async function testGeminiAPI() {
  try {
    console.log("Testing Gemini API with key:", API_KEY.substring(0, 10) + "...");
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say hello world"
          }]
        }]
      })
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Success! Response:", JSON.stringify(data, null, 2));
    
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Generated text:", textResponse);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testGeminiAPI();