// AI Service for Google Gemini integration
// This service will help automatically analyze reports and suggest property values

// IMPORTANT: The API key should be stored as a Firebase function secret, not in client code
// For development, we're using the provided key, but in production it should be a server-side secret

// Force this file to be treated as an ES6 module
import type {} from 'react';

const GEMINI_API_KEY = "AIzaSyCgFIwgqOwReMXCMcuNdCATGWWvTW6bmEk";
// Updated to use the correct model name
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

interface AIAnalysisResult {
  category?: string;
  priority?: "low" | "medium" | "high" | "critical";
  title?: string;
  description?: string;
  confidence: number;
}

/** 
 * Analyze a report using Google Gemini AI to suggest property values
 * @param title The title of the report
 * @param description The description of the report
 * @param address The address/coordinates of the report
 * @returns AI-suggested property values
 */
export async function analyzeReportWithAI(
  title: string,
  description: string,
  address: string
): Promise<AIAnalysisResult> {
  try {
    // Prepare the prompt for Gemini
    const prompt = `
    Analyze the following civic issue report and suggest appropriate property values.
    
    Title: ${title}
    Description: ${description}
    Location: ${address}
    
    Based on the content, please provide:
    1. The most appropriate category for this issue (choose from: Street Infrastructure, Lighting, Waste Management, Water & Utilities, Parks & Recreation, Traffic & Transportation, Public Property, Sidewalks & Walkways, Noise & Disturbances)
    2. The appropriate priority level (low, medium, high, critical)
    3. An improved title (if needed)
    4. An improved description (if needed)
    
    Respond ONLY in JSON format with this exact structure:
    {
      "category": "category name",
      "priority": "priority level",
      "title": "improved title",
      "description": "improved description"
    }
    
    If you cannot determine a value for any field, leave it as an empty string.
    `;

    console.log('Sending request to Gemini API with prompt:', prompt.substring(0, 200) + '...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    
    // Check if we have a valid response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }
    
    // Extract the JSON response from Gemini
    const textResponse = data.candidates[0].content?.parts?.[0]?.text || '{}';
    console.log('Raw AI response text:', textResponse);
    
    // Handle case where AI returns a direct JSON object instead of text
    if (typeof textResponse === 'object') {
      console.log('AI returned direct JSON object');
      return {
        category: textResponse.category || '',
        priority: textResponse.priority || 'medium',
        title: textResponse.title || title,
        description: textResponse.description || description,
        confidence: 0.9
      };
    }
    
    // Clean up the response to extract JSON
    let jsonString = textResponse.trim();
    
    // Handle different response formats
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3);
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3, jsonString.length - 3);
    }
    
    // Try to find JSON in the response if it's not properly formatted
    const jsonMatch = jsonString.match(/\{[^]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    console.log('Cleaned JSON string:', jsonString);
    
    try {
      const result = JSON.parse(jsonString);
      console.log('Parsed AI result:', result);
      return {
        category: result.category || '',
        priority: result.priority || 'medium',
        title: result.title || title,
        description: result.description || description,
        confidence: 0.8 // Default confidence
      };
    } catch (parseError) {
      console.warn('Failed to parse AI response, using defaults:', parseError);
      console.warn('Response that failed to parse:', jsonString);
      
      // Try to extract individual values from the text response
      const categoryMatch = jsonString.match(/"category"\s*:\s*"([^"]+)"/i);
      const priorityMatch = jsonString.match(/"priority"\s*:\s*"([^"]+)"/i);
      const titleMatch = jsonString.match(/"title"\s*:\s*"([^"]+)"/i);
      const descriptionMatch = jsonString.match(/"description"\s*:\s*"([^"]+)"/i);
      
      return {
        category: categoryMatch ? categoryMatch[1] : '',
        priority: priorityMatch ? priorityMatch[1] : 'medium',
        title: titleMatch ? titleMatch[1] : title,
        description: descriptionMatch ? descriptionMatch[1] : description,
        confidence: 0.5
      };
    }
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Return default values if AI fails
    return {
      category: '',
      priority: 'medium',
      title,
      description,
      confidence: 0
    };
  }
}

/**
 * Get category suggestions from AI based on title and description
 * @param title The title of the report
 * @param description The description of the report
 * @returns Suggested category
 */
export async function suggestCategory(
  title: string,
  description: string
): Promise<string> {
  try {
    const prompt = `
    Based on the title and description below, suggest the most appropriate category for this civic issue.
    
    Title: ${title}
    Description: ${description}
    
    Choose ONLY from these categories:
    - Street Infrastructure
    - Lighting
    - Waste Management
    - Water & Utilities
    - Parks & Recreation
    - Traffic & Transportation
    - Public Property
    - Sidewalks & Walkways
    - Noise & Disturbances
    
    Respond with ONLY the category name, nothing else.
    `;

    console.log('Sending category suggestion request to Gemini API');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Category suggestion response:', JSON.stringify(data, null, 2));
    
    // Check if we have a valid response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }
    
    const category = data.candidates[0].content?.parts?.[0]?.text?.trim() || '';
    
    console.log('Suggested category:', category);
    
    // Validate that the category is in our allowed list
    const validCategories = [
      'Street Infrastructure',
      'Lighting',
      'Waste Management',
      'Water & Utilities',
      'Parks & Recreation',
      'Traffic & Transportation',
      'Public Property',
      'Sidewalks & Walkways',
      'Noise & Disturbances'
    ];
    
    return validCategories.includes(category) ? category : '';
  } catch (error) {
    console.error('Category suggestion failed:', error);
    return '';
  }
}

/**
 * Get priority suggestion from AI based on title and description
 * @param title The title of the report
 * @param description The description of the report
 * @returns Suggested priority level
 */
export async function suggestPriority(
  title: string,
  description: string
): Promise<"low" | "medium" | "high" | "critical"> {
  try {
    const prompt = `
    Based on the title and description below, suggest the appropriate priority level for this civic issue.
    
    Title: ${title}
    Description: ${description}
    
    Choose ONLY from these priority levels:
    - low (minor inconvenience)
    - medium (moderate issue)
    - high (significant problem)
    - critical (safety hazard)
    
    Respond with ONLY the priority level, nothing else.
    `;

    console.log('Sending priority suggestion request to Gemini API');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Priority suggestion response:', JSON.stringify(data, null, 2));
    
    // Check if we have a valid response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }
    
    const priority = data.candidates[0].content?.parts?.[0]?.text?.trim() || 'medium';
    
    console.log('Suggested priority:', priority);
    
    // Validate that the priority is in our allowed list
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    
    return validPriorities.includes(priority) ? (priority as any) : 'medium';
  } catch (error) {
    console.error('Priority suggestion failed:', error);
    return 'medium';
  }
}
