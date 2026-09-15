// Test script to verify Gemini API integration
// Run with: node test-gemini.js
// Make sure GEMINI_API_KEY is set in .env file

require('dotenv').config();
const genai = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables.');
  console.error('Please add GEMINI_API_KEY=your-api-key to backend/.env file');
  process.exit(1);
}

const client = new genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testGeminiIntegration() {
  console.log('Testing Gemini API integration...');
  console.log('Using model: gemini-1.5-flash');
  
  try {
    // Test 1: Simple text generation
    console.log('\n--- Test 1: Simple text generation ---');
    const result1 = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Say "Hello from Gemini API!"'
    });
    console.log('✓ Simple generation successful:', result1.text);
    
    // Test 2: Summary generation
    console.log('\n--- Test 2: Summary generation ---');
    const sampleText = 'JavaScript is a programming language that enables interactive web pages. It is an essential part of web applications.';
    const result2 = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Summarize this in one sentence: ${sampleText}`
    });
    console.log('✓ Summary generation successful:', result2.text);
    
    // Test 3: JSON generation
    console.log('\n--- Test 3: JSON generation ---');
    const result3 = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Generate a JSON array with 2 objects: [{"question": "What is 2+2?", "answer": "4"}]'
    });
    console.log('✓ JSON generation successful:', result3.text);
    
    console.log('\n✅ All Gemini API tests passed successfully!');
    console.log('The integration is ready for production use.');
    
  } catch (error) {
    console.error('\n❌ Gemini API test failed:');
    console.error('Error:', error.message);
    if (error.message.includes('API key')) {
      console.error('\nPlease check your GEMINI_API_KEY in backend/.env file');
    }
    process.exit(1);
  }
}

testGeminiIntegration();
