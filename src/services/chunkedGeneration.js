import { callOpenAIAPI } from './openai';
import config from '../config/env';

// Check if OpenAI API key is available and valid
const validateApiKey = (apiKey) => {
  if (!apiKey) return false;
  if (apiKey.includes('your_') || apiKey.includes('placeholder') || apiKey.includes('here')) return false;
  if (!apiKey.startsWith('sk-')) return false;
  return true;
};

// Generate architecture chunk
export const generateArchitectureChunk = async (prompt) => {
  const systemPrompt = `You are a React architect. Create the main project structure and layout components.

MANDATORY OUTPUT FORMAT:
{
  "projectStructure": {
    "src/App.js": "Main App component with React Router setup",
    "src/components/Header.jsx": "Header navigation component", 
    "src/components/Footer.jsx": "Footer component",
    "src/components/Layout.jsx": "Main layout wrapper",
    "src/styles/globals.css": "Global CSS styles with TailwindCSS",
    "package.json": "Dependencies including React Router, TailwindCSS",
    "public/index.html": "HTML template"
  },
  "description": "Project architecture and layout components",
  "pages": ["Home", "About", "Contact"],
  "features": ["React Router", "Responsive Design", "Modern UI"]
}

REQUIREMENTS:
- Create complete project architecture
- Include React Router setup in App.js
- Generate Header with navigation links
- Create responsive Footer component
- Add global TailwindCSS styles
- Include proper package.json with dependencies
- Use modern React patterns and hooks
- Make everything responsive and accessible

Generate a professional project foundation that other components can build upon.`;

  try {
    const apiKey = config.openai.apiKey;
    if (!validateApiKey(apiKey)) {
      throw new Error('OpenAI API key is not configured properly.');
    }

    const requestBody = {
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 4096,
      stream: false
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    const content = data.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    const parsedResponse = JSON.parse(content);
    return {
      success: true,
      data: parsedResponse
    };

  } catch (error) {
    console.error('Architecture chunk generation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate architecture'
    };
  }
};

// Generate page chunk
export const generatePageChunk = async (prompt, pageName) => {
  const systemPrompt = `You are a React developer creating a specific page component.

MANDATORY OUTPUT FORMAT:
{
  "projectStructure": {
    "src/pages/${pageName}.jsx": "Complete ${pageName} page component"
  },
  "description": "${pageName} page component with full content",
  "pages": ["${pageName}"],
  "features": ["Responsive Design", "Modern UI", "TailwindCSS"]
}

REQUIREMENTS:
- Create a complete, functional ${pageName} page component
- Use modern React patterns with hooks
- Include realistic, professional content
- Make it fully responsive with TailwindCSS
- Add proper SEO and accessibility features
- Include relevant sections for a ${pageName} page
- Use placeholder images from https://images.unsplash.com/
- Create engaging, conversion-focused content

Generate a production-ready page component that fits the overall project theme.`;

  try {
    const apiKey = config.openai.apiKey;
    if (!validateApiKey(apiKey)) {
      throw new Error('OpenAI API key is not configured properly.');
    }

    const requestBody = {
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 4096,
      stream: false
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    const content = data.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    const parsedResponse = JSON.parse(content);
    return {
      success: true,
      data: parsedResponse
    };

  } catch (error) {
    console.error(`${pageName} page generation failed:`, error);
    return {
      success: false,
      error: error.message || `Failed to generate ${pageName} page`
    };
  }
};

// Generate features chunk
export const generateFeaturesChunk = async (prompt, features) => {
  const systemPrompt = `You are a React developer adding advanced features to an existing project.

MANDATORY OUTPUT FORMAT:
{
  "projectStructure": {
    "src/components/ContactForm.jsx": "Contact form component if needed",
    "src/components/Newsletter.jsx": "Newsletter signup if needed",
    "src/hooks/useAuth.js": "Authentication hook if needed",
    "src/utils/helpers.js": "Utility functions",
    "src/contexts/AppContext.jsx": "App context for state management"
  },
  "description": "Advanced features and integrations",
  "features": ${JSON.stringify(features)}
}

REQUIREMENTS:
- Implement the requested features: ${features.join(', ')}
- Create reusable components and hooks
- Add proper state management if needed
- Include error handling and validation
- Make features work seamlessly together
- Use modern React patterns
- Add TypeScript-like prop validation
- Include loading states and user feedback

Generate production-ready feature implementations.`;

  try {
    const apiKey = config.openai.apiKey;
    if (!validateApiKey(apiKey)) {
      throw new Error('OpenAI API key is not configured properly.');
    }

    const requestBody = {
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 4096,
      stream: false
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    const content = data.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    const parsedResponse = JSON.parse(content);
    return {
      success: true,
      data: parsedResponse
    };

  } catch (error) {
    console.error('Features chunk generation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate features'
    };
  }
};
