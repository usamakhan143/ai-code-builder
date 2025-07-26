import OpenAI from 'openai';
import config from '../config/env';

// Check if OpenAI API key is available
if (!config.openai.apiKey && config.isProduction) {
  throw new Error('OpenAI API key is required for website generation. Please set VITE_OPENAI_API_KEY in your environment variables.');
}

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, you'd want to use a backend proxy
});

export const generateWebsiteCode = async (prompt) => {
  try {
    const systemPrompt = `You are an expert web developer. Generate a complete, functional website based on the user's request. Return ONLY a JSON object with this exact structure:

{
  "html": "complete HTML code with inline CSS and JavaScript",
  "css": "standalone CSS file content if needed (optional)",
  "js": "standalone JavaScript file content if needed (optional)",
  "description": "brief description of what was created"
}

Requirements:
- Create fully functional, responsive HTML with modern design
- Use inline CSS for styling unless external CSS is absolutely necessary
- Include interactive JavaScript if relevant to the request
- Make it visually appealing with proper styling
- Ensure all code is production-ready
- Use semantic HTML and modern CSS practices
- Make it mobile-responsive

Do not include any explanation or markdown formatting, just return the raw JSON object.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(content);
      return {
        success: true,
        data: parsedResponse
      };
    } catch (parseError) {
      // If JSON parsing fails, try to extract HTML from the response
      console.warn('Failed to parse JSON, attempting to extract HTML:', parseError);
      
      // Fallback: create a simple HTML wrapper if we can't parse JSON
      return {
        success: true,
        data: {
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Website</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .error { background: #f8f8f8; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="error">
            <h1>Generated Content</h1>
            <p><strong>Prompt:</strong> ${prompt}</p>
            <div>${content.replace(/\n/g, '<br>')}</div>
        </div>
    </div>
</body>
</html>`,
          description: `Generated content for: ${prompt}`
        }
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate website code'
    };
  }
};
