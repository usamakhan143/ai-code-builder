import config from '../config/env';

// Network connectivity detection
const isOnline = () => {
  return navigator.onLine && window.fetch !== undefined;
};

// Test basic internet connectivity
const testConnectivity = async () => {
  try {
    // Test basic internet connectivity with a simple, reliable endpoint
    const response = await fetch('https://httpbin.org/get', {
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('Internet connectivity test failed:', error);
    return true; // Return true to allow OpenAI API attempt
  }
};

// Check if OpenAI API key is available and valid
const validateApiKey = (apiKey) => {
  if (!apiKey) return false;
  if (apiKey.includes('your_') || apiKey.includes('placeholder') || apiKey.includes('here')) return false;
  if (!apiKey.startsWith('sk-')) return false;
  return true;
};

// Simple XMLHttpRequest approach to avoid all fetch/stream issues
const callOpenAIAPI = async (messages, options = {}) => {
  const apiKey = config.openai.apiKey;

  if (!validateApiKey(apiKey)) {
    throw new Error('OpenAI API key is not configured properly. Please check your environment variables.');
  }

  const requestBody = {
    model: options.model || "gpt-4-turbo-preview",
    messages: messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 4096,
    stream: false
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const timeoutId = setTimeout(() => {
      xhr.abort();
      reject(new Error('Request timeout'));
    }, 45000);

    xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
      clearTimeout(timeoutId);

      const responseText = xhr.responseText;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(responseText);
          resolve(data);
        } catch (parseError) {
          reject(new Error(`Invalid JSON response: ${parseError.message}`));
        }
      } else {
        let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`;

        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage = responseText || errorMessage;
        }

        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = function() {
      clearTimeout(timeoutId);
      reject(new Error('Network error occurred'));
    };

    xhr.onabort = function() {
      clearTimeout(timeoutId);
      reject(new Error('Request timeout'));
    };

    try {
      xhr.send(JSON.stringify(requestBody));
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

// Generate demo website when offline
const generateOfflineWebsite = (prompt) => {
  const demoTemplates = {
    portfolio: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }
        .hero h1 { font-size: 3em; margin-bottom: 20px; font-weight: 300; }
        .hero p { font-size: 1.2em; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 80px 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .card { background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.3s; }
        .card:hover { transform: translateY(-10px); }
        .card-img { height: 200px; background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); }
        .card-content { padding: 30px; }
        .card h3 { margin-bottom: 15px; color: #333; }
        .card p { color: #666; line-height: 1.6; }
        .btn { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin-top: 20px; transition: transform 0.3s; }
        .btn:hover { transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="hero">
        <h1>Creative Portfolio</h1>
        <p>Showcasing amazing work and creativity</p>
    </div>
    <div class="container">
        <div class="grid">
            <div class="card">
                <div class="card-img"></div>
                <div class="card-content">
                    <h3>Project One</h3>
                    <p>An amazing project that showcases creativity and technical skills.</p>
                    <a href="#" class="btn">View Project</a>
                </div>
            </div>
            <div class="card">
                <div class="card-img"></div>
                <div class="card-content">
                    <h3>Project Two</h3>
                    <p>Another incredible piece of work demonstrating expertise.</p>
                    <a href="#" class="btn">View Project</a>
                </div>
            </div>
            <div class="card">
                <div class="card-img"></div>
                <div class="card-content">
                    <h3>Project Three</h3>
                    <p>A masterpiece that highlights innovative solutions.</p>
                    <a href="#" class="btn">View Project</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      description: "Beautiful portfolio website with modern design"
    },
    business: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business - Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        header { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px 0; }
        nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .logo { font-size: 1.5em; font-weight: bold; color: #333; }
        .nav-links { display: flex; gap: 30px; list-style: none; }
        .nav-links a { color: #333; text-decoration: none; }
        .hero { background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 120px 20px; text-align: center; }
        .hero h1 { font-size: 3.5em; margin-bottom: 20px; font-weight: 300; }
        .hero p { font-size: 1.3em; margin-bottom: 30px; }
        .cta-btn { background: white; color: #0984e3; padding: 15px 40px; border: none; border-radius: 30px; font-size: 1.1em; cursor: pointer; transition: transform 0.3s; }
        .cta-btn:hover { transform: scale(1.05); }
        .features { padding: 100px 20px; background: #f8f9fa; }
        .features-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .feature { text-align: center; }
        .feature-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em; }
        .feature h3 { margin-bottom: 15px; color: #333; }
        .feature p { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <header>
        <nav>
            <div class="logo">BusinessPro</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <div class="hero">
        <h1>Grow Your Business</h1>
        <p>Professional solutions for modern businesses</p>
        <button class="cta-btn">Get Started</button>
    </div>
    <div class="features">
        <div class="features-grid">
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Fast & Reliable</h3>
                <p>Lightning-fast performance that your customers will love.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <h3>Targeted Solutions</h3>
                <p>Customized strategies that fit your specific business needs.</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📈</div>
                <h3>Growth Focused</h3>
                <p>Proven methods to scale and expand your business.</p>
            </div>
        </div>
    </div>
</body>
</html>`,
      description: "Professional business website with modern layout"
    },
    default: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beautiful Website - Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 20px; text-align: center; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .hero-content h1 { font-size: 4em; margin-bottom: 20px; font-weight: 300; animation: fadeInUp 1s ease; }
        .hero-content p { font-size: 1.3em; margin-bottom: 30px; opacity: 0.9; animation: fadeInUp 1s ease 0.2s both; }
        .btn { display: inline-block; padding: 15px 40px; background: rgba(255,255,255,0.2); border: 2px solid white; color: white; text-decoration: none; border-radius: 30px; transition: all 0.3s; animation: fadeInUp 1s ease 0.4s both; }
        .btn:hover { background: white; color: #667eea; transform: translateY(-2px); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .section { padding: 100px 20px; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; }
        h2 { font-size: 2.5em; margin-bottom: 50px; color: #333; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: 50px; }
        .card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .card:hover { transform: translateY(-10px); }
        .card-icon { font-size: 3em; margin-bottom: 20px; }
        .card h3 { margin-bottom: 15px; color: #333; }
        .card p { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            <h1>Welcome</h1>
            <p>This is a beautiful demo website created for you</p>
            <a href="#about" class="btn">Explore More</a>
        </div>
    </div>
    <div class="section" id="about">
        <div class="container">
            <h2>About This Demo</h2>
            <p style="font-size: 1.1em; color: #666; max-width: 600px; margin: 0 auto;">This website was generated as a demo while in offline mode. It showcases modern design principles with beautiful gradients, smooth animations, and responsive layout.</p>
            <div class="grid">
                <div class="card">
                    <div class="card-icon">🎨</div>
                    <h3>Beautiful Design</h3>
                    <p>Modern, clean design with attention to visual hierarchy and user experience.</p>
                </div>
                <div class="card">
                    <div class="card-icon">📱</div>
                    <h3>Responsive</h3>
                    <p>Fully responsive design that works perfectly on all devices and screen sizes.</p>
                </div>
                <div class="card">
                    <div class="card-icon">⚡</div>
                    <h3>Fast Loading</h3>
                    <p>Optimized for speed with clean code and efficient styling.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      description: "Beautiful demo website with modern design and animations"
    }
  };

  // Determine which template to use based on prompt
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('portfolio') || promptLower.includes('photographer') || promptLower.includes('artist')) {
    return demoTemplates.portfolio;
  } else if (promptLower.includes('business') || promptLower.includes('company') || promptLower.includes('corporate')) {
    return demoTemplates.business;
  } else {
    return demoTemplates.default;
  }
};

export const generateWebsiteCode = async (prompt) => {
  try {
    const systemPrompt = `You are an expert web designer and developer specializing in creating beautiful, modern websites. Generate a complete, functional website based on the user's request. Return ONLY a JSON object with this exact structure:

{
  "html": "complete HTML code with inline CSS and JavaScript",
  "css": "standalone CSS file content if needed (optional)",
  "js": "standalone JavaScript file content if needed (optional)",
  "description": "brief description of what was created"
}

DESIGN REQUIREMENTS:
- Create a STUNNING, modern, professional design with excellent visual hierarchy
- Use beautiful color schemes with gradients, shadows, and modern aesthetics
- Implement clean typography with proper font weights and spacing
- Add smooth animations and hover effects for interactive elements
- Use modern CSS features like flexbox, grid, transforms, and transitions
- Include proper spacing, padding, and margins for clean layout
- Add subtle box-shadows, border-radius, and modern styling touches
- Use contemporary color palettes (blues, purples, greens with good contrast)
- Implement card-based layouts where appropriate
- Add beautiful backgrounds (gradients, patterns, or solid colors)

TECHNICAL REQUIREMENTS:
- Write semantic HTML5 with proper structure
- Use inline CSS for all styling (do NOT use external stylesheets)
- Make it fully responsive for mobile, tablet, and desktop
- Include smooth CSS transitions and hover effects
- Add proper meta tags and viewport settings
- Ensure excellent readability and accessibility
- Use modern fonts (system fonts or web-safe alternatives)
- Implement interactive JavaScript features when relevant

STYLING GUIDELINES:
- Headers should be bold and well-spaced with modern typography
- Buttons should have gradients, shadows, and hover animations
- Sections should have proper padding and visual separation
- Use consistent spacing throughout (multiples of 8px or 16px)
- Add subtle animations for page load and interactions
- Implement proper contrast ratios for readability
- Use modern web design patterns and layouts

Create something that looks like it was designed by a professional web designer in 2024. Make it visually impressive and user-friendly.

Do not include any explanation or markdown formatting, just return the raw JSON object.`;

    // Make the API call with simple retry logic
    let response;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await callOpenAIAPI([
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ], {
          model: "gpt-4-turbo-preview",
          temperature: 0.7,
          max_tokens: 4096
        });

        // If we get here, the request succeeded
        break;

      } catch (apiError) {
        lastError = apiError;
        console.error(`OpenAI API call failed (attempt ${attempt}/${maxRetries}):`, apiError);

        // Check for specific error types that shouldn't be retried
        if (apiError.message?.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        } else if (apiError.message?.includes('insufficient_quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.');
        } else if (apiError.message?.includes('invalid_api_key') || apiError.message?.includes('Incorrect API key')) {
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        } else if (apiError.message?.includes('model not found')) {
          throw new Error('The requested AI model is not available. Please try again later.');
        }

        // For retryable errors, wait and continue
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        // If we've exhausted all retries
        throw new Error(`API request failed after ${maxRetries} attempts: ${apiError.message || 'Unknown error'}`);
      }
    }

    // Safely extract content from direct API response
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    const content = response.choices[0].message.content?.trim();

    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(content);

      // Validate the response structure
      if (!parsedResponse.html) {
        throw new Error('Invalid response: missing HTML content');
      }

      return {
        success: true,
        data: parsedResponse
      };
    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError);
      console.warn('Raw content:', content.substring(0, 500) + '...');

      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[1]);
          if (parsedResponse.html) {
            return {
              success: true,
              data: parsedResponse
            };
          }
        } catch (extractError) {
          console.warn('Failed to parse extracted JSON:', extractError);
        }
      }

      // Fallback: create a simple HTML wrapper
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
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px 20px;
          line-height: 1.6;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          margin: 0;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .prompt {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #007bff;
        }
        .response {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          white-space: pre-wrap;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI Website Generated</h1>
            <p>Content created by AI assistant</p>
        </div>
        <div class="content">
            <div class="prompt">
                <strong>Your Request:</strong> ${prompt}
            </div>
            <div class="response">${content}</div>
        </div>
    </div>
</body>
</html>`,
          description: `Generated response for: ${prompt}`
        }
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);

    // Return a user-friendly error
    return {
      success: false,
      error: error.message || 'Failed to generate website code. Please try again.'
    };
  }
};
