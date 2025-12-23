// Title validation service for checking if titles and descriptions match
import type {} from 'react';

const GEMINI_API_KEY = "AIzaSyCgFIwgqOwReMXCMcuNdCATGWWvTW6bmEk";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

// Check if title and description match each other using AI
export async function checkTitleDescriptionMatch(title: string, description: string) {
  try {
    // Basic validation - if content is reasonable, be more lenient
    if (title.trim().length < 5 || description.trim().length < 10) {
      return {
        matches: false,
        suggestions: ['Title should be at least 5 characters', 'Description should be at least 10 characters']
      };
    }

    // For reasonable content, be more lenient
    if (title.trim().length >= 10 && description.trim().length >= 20) {
      // Simple heuristic: if both have reasonable length, likely OK
      const titleWords = title.trim().split(/\s+/).length;
      const descWords = description.trim().split(/\s+/).length;
      
      // If description is substantially longer than title, probably OK
      if (descWords > titleWords) {
        return {
          matches: true,
          suggestions: []
        };
      }
    }

    const prompt = `Analyze whether the title and description match coherently. 
Title: ${title}
Description: ${description}

Evaluate if they are generally related (be lenient):
1. Do they cover the same general topic?
2. Is the description relevant to the title?

Respond ONLY in JSON format:
{"matches": true/false, "suggestions": ["suggestion 1", "suggestion 2"]}

Be lenient - if they seem related, return {"matches": true, "suggestions": []}`;

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
      // If API fails, be lenient and allow submission
      console.warn('Gemini API error, being lenient:', response.status);
      return {
        matches: true,
        suggestions: []
      };
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      // If no candidates, be lenient and allow submission
      console.warn('No candidates from Gemini API, being lenient');
      return {
        matches: true,
        suggestions: []
      };
    }
    
    const textResponse = data.candidates[0].content?.parts?.[0]?.text || '{}';
    const result = JSON.parse(textResponse);
    
    // Be more lenient with matching - only reject if explicitly false
    return {
      matches: result.matches !== false,
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : []
    };
  } catch (error) {
    console.warn('Title-description match check failed (being lenient):', error);
    // If there's any error, be lenient and allow submission
    return {
      matches: true,
      suggestions: []
    };
  }
}