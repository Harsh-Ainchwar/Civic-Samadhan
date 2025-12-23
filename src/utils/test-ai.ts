// Simple test file to verify AI integration is working
import { analyzeReportWithAI, suggestCategory, suggestPriority } from './ai-service';

// Test the AI functions
async function testAI() {
  console.log('Testing AI functions...');
  
  try {
    // Test analyzeReportWithAI
    const analysis = await analyzeReportWithAI(
      "Large pothole in the middle of the street",
      "There is a huge pothole on Main Street that is causing damage to vehicles. It's about 2 feet wide and 1 foot deep.",
      "Main Street & Oak Avenue"
    );
    
    console.log('Full Analysis Result:', analysis);
    
    // Test suggestCategory
    const category = await suggestCategory(
      "Broken streetlight",
      "The streetlight at the corner of Elm Street has been out for several days, making the area unsafe for pedestrians at night."
    );
    
    console.log('Suggested Category:', category);
    
    // Test suggestPriority
    const priority = await suggestPriority(
      "Water main leak",
      "Water leak detected near the fire hydrant causing flooding on the sidewalk. This is creating a safety hazard."
    );
    
    console.log('Suggested Priority:', priority);
    
  } catch (error) {
    console.error('AI Test Failed:', error);
  }
}

// Run the test
testAI();