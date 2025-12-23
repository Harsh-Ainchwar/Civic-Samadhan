import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Civic Reporting Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastRequestTime = useRef<number>(0);
  const currentKeyIndex = useRef<number>(0);
  
  // API Keys for rotation
  const apiKeys = [
    "AIzaSyCgFIwgqOwReMXCMcuNdCATGWWvTW6bmEk",
    "AIzaSyAOu8P0FjUAJQHMyDZKebyi7o0VT0Q_r2A"
  ];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // App knowledge base for the chatbot
  const getAppKnowledge = () => `
    You are an AI assistant for a Civic Reporting System. Here's what users can do:
    
    1. Report Issues:
       - Users can report civic issues like potholes, broken street lights, trash, graffiti, etc.
       - They select a category, add a title and description, upload photos, and specify location
       - AI automatically analyzes reports to suggest categories and improve content
    
    2. View Reports:
       - Users can see all reports in the dashboard
       - They can view their own submitted reports in "My Reports"
    
    3. Navigation:
       - Dashboard: Overview of all civic reports in the city
       - Report Issue: Form to submit a new civic issue
       - My Reports: View reports you've submitted
    
    4. AI Features:
       - Automatic analysis of reports for better categorization
       - Smart suggestions for titles and descriptions
       - Location-based issue categorization
    
    5. Technical Details:
       - Built with React, TypeScript, and Vite
       - Uses Google Gemini AI for natural language processing
       - Firebase for data storage
       - Responsive design works on mobile and desktop
    
    Always be helpful, concise, and guide users through the app features. 
    If asked about technical implementation, explain in simple terms.
    Never mention being an AI or having limitations - act as a knowledgeable app guide.
  `;

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Rate limiting - minimum 2 seconds between requests (more aggressive)
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < 2000) {
      // Add a delay to respect rate limits more strictly
      await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastRequest));
    }
    
    lastRequestTime.current = Date.now();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Prepare the prompt with app knowledge and conversation history
      const conversationHistory = messages.slice(1).slice(-4).map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      ).join('\n');
      
      const prompt = `
        ${getAppKnowledge()}
        
        Conversation history:
        ${conversationHistory}
        
        User: ${inputText}
        
        Assistant: Respond concisely and helpfully:`;

      // Call Gemini API with retry logic and key rotation for rate limiting
      let retries = 0;
      const maxRetries = 3;
      let response;
      let apiKey = apiKeys[currentKeyIndex.current];
      
      while (retries <= maxRetries) {
        const requestBody = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        };
        
        console.log('Sending chatbot request with:', { apiKey: apiKey.substring(0, 10) + '...', requestBody: JSON.stringify(requestBody).substring(0, 200) + '...' });
        
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
          }
        );
        
        // Log response for debugging
        console.log('Chatbot API response status:', response.status);
        
        // If not a rate limit error, break out of retry loop
        if (response.status !== 429 || retries === maxRetries) {
          break;
        }
        
        // Rotate to next API key
        currentKeyIndex.current = (currentKeyIndex.current + 1) % apiKeys.length;
        apiKey = apiKeys[currentKeyIndex.current];
        
        // Wait before retrying (exponential backoff with longer delays)
        const waitTime = Math.pow(2, retries) * 2000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retries++;
      }

      if (!response.ok) {
        // Try to get error details without consuming the stream if possible
        let errorDetails = `HTTP ${response.status}`;
        try {
          const errorText = await response.clone().text();
          errorDetails = `${response.status} - ${errorText}`;
        } catch (e) {
          // If we can't read the error, just use the status
          errorDetails = `HTTP ${response.status}`;
        }
        throw new Error(`API error: ${errorDetails}`);
      }

      const data = await response.json();
      console.log('Chatbot API response data:', JSON.stringify(data, null, 2));
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No candidates returned from AI");
      }

      const botText = data.candidates[0].content?.parts?.[0]?.text?.trim() || "Sorry, I didn't understand that. Can you try rephrasing?";
      
      // Validate that we got a meaningful response
      if (!botText || botText.length < 1) {
        throw new Error("Empty response from AI");
      }
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      
      // Add detailed error message
      let errorMessageText = "Sorry, I'm having trouble connecting. Please try again later.";
      
      if (error instanceof Error) {
        // Handle specific error codes
        if (error.message.includes('429')) {
          errorMessageText = "The AI service is temporarily busy due to high demand. I'll try to answer common questions without AI:";
          
          // Add a helpful local response for common questions
          const lowerInput = inputText.toLowerCase();
          let localResponse = "I can help you with:\n\n" +
            "• Reporting issues (potholes, street lights, etc.)\n" +
            "• Viewing your submitted reports\n" +
            "• Navigating the dashboard\n" +
            "• Using AI features in reports\n\n" +
            "Please try again in a few moments, or ask about a different topic.";
          
          // Try to provide more specific help based on keywords
          if (lowerInput.includes('report') || lowerInput.includes('issue')) {
            localResponse = "To report an issue:\n\n" +
              "1. Click 'Report Issue' in the navigation\n" +
              "2. Select a category for your issue\n" +
              "3. Add a title and detailed description\n" +
              "4. Upload photos if possible\n" +
              "5. Specify the location\n" +
              "6. Submit your report\n\n" +
              "Our AI will automatically analyze and enhance your report!";
          } else if (lowerInput.includes('dashboard') || lowerInput.includes('view')) {
            localResponse = "Dashboard features:\n\n" +
              "• See all city reports in real-time\n" +
              "• View reports by category\n" +
              "• Check status of your submissions in 'My Reports'\n" +
              "• Analytics showing issue trends\n\n" +
              "The dashboard updates automatically with new reports.";
          }
          
          // Add the local response as a bot message
          const localMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: localResponse,
            sender: "bot",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, localMessage]);
          setIsLoading(false);
          return;
        } else {
          errorMessageText = `Error: ${error.message}. Please check your connection and try again.`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessageText,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 left-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-[9999]">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-emerald-600 text-white rounded-t-lg">
            <h3 className="font-medium">Civic Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-emerald-700 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.sender === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about the app..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg p-2 h-fit self-end transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg z-[9999] transition-all hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </>
  );
}