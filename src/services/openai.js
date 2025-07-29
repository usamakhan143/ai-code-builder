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
    // Increased timeout to 150 seconds for complex requests
    const timeoutDuration = options.timeout || 150000;
    const timeoutId = setTimeout(() => {
      xhr.abort();
      reject(new Error('Request timeout - OpenAI API took too long to respond'));
    }, timeoutDuration);

    xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Set additional headers for better reliability
    xhr.setRequestHeader('User-Agent', 'AI-UI-Builder/1.0');

    // Configure timeout directly on XMLHttpRequest as backup
    xhr.timeout = timeoutDuration;

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
      reject(new Error('Request timeout - The API request was aborted'));
    };

    xhr.ontimeout = function() {
      clearTimeout(timeoutId);
      reject(new Error('Request timeout - OpenAI API did not respond in time'));
    };

    try {
      xhr.send(JSON.stringify(requestBody));
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

// Generate professional demo website when offline
const generateOfflineWebsite = (prompt) => {
  const demoTemplates = {
    portfolio: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex Chen - Creative Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }

        /* Navigation */
        nav { position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 2rem; }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 700; color: #6366f1; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { text-decoration: none; color: #333; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: #6366f1; }

        /* Hero Section */
        .hero { min-height: 100vh; display: flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0 2rem; }
        .hero-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-text h1 { font-size: 3.5rem; font-weight: 300; margin-bottom: 1rem; line-height: 1.2; }
        .hero-text .highlight { color: #fbbf24; font-weight: 600; }
        .hero-text p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .hero-image { text-align: center; }
        .hero-image img { width: 300px; height: 300px; border-radius: 50%; object-fit: cover; border: 5px solid rgba(255,255,255,0.2); }
        .cta-buttons { display: flex; gap: 1rem; }
        .btn-primary { background: #fbbf24; color: #333; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: transform 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary { background: transparent; color: white; border: 2px solid white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
        .btn-secondary:hover { background: white; color: #667eea; }

        /* Portfolio Section */
        .portfolio { padding: 6rem 2rem; background: #f8fafc; }
        .section-title { text-align: center; margin-bottom: 4rem; }
        .section-title h2 { font-size: 2.5rem; font-weight: 300; color: #1f2937; margin-bottom: 1rem; }
        .section-title p { font-size: 1.1rem; color: #6b7280; }
        .portfolio-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .project-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .project-card:hover { transform: translateY(-10px); }
        .project-image { height: 250px; background-size: cover; background-position: center; }
        .project-content { padding: 2rem; }
        .project-content h3 { font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem; color: #1f2937; }
        .project-tech { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .tech-tag { background: #e0e7ff; color: #6366f1; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; }
        .project-content p { color: #6b7280; margin-bottom: 1.5rem; }
        .project-link { color: #6366f1; text-decoration: none; font-weight: 600; }

        /* Footer */
        .footer { background: #1f2937; color: white; padding: 4rem 2rem 2rem; }
        .footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .footer-section h3 { margin-bottom: 1rem; color: #fbbf24; }
        .footer-section p, .footer-section a { color: #d1d5db; text-decoration: none; }
        .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
        .social-links a { background: #374151; padding: 0.8rem; border-radius: 50%; transition: background 0.3s; }
        .social-links a:hover { background: #6366f1; }
        .footer-bottom { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #374151; color: #9ca3af; }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-content { grid-template-columns: 1fr; text-align: center; }
            .hero-text h1 { font-size: 2.5rem; }
            .portfolio-grid { grid-template-columns: 1fr; }
            .nav-links { display: none; }
        }
    </style>
</head>
<body>
    <nav>
        <div class="nav-container">
            <div class="logo">Alex Chen</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#portfolio">Portfolio</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero" id="home">
        <div class="hero-content">
            <div class="hero-text">
                <h1>Creative <span class="highlight">Designer</span><br>& Developer</h1>
                <p>I craft beautiful digital experiences that combine stunning visuals with seamless functionality. Let's bring your ideas to life.</p>
                <div class="cta-buttons">
                    <a href="#portfolio" class="btn-primary">View My Work</a>
                    <a href="#contact" class="btn-secondary">Get In Touch</a>
                </div>
            </div>
            <div class="hero-image">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" alt="Alex Chen - Creative Designer">
            </div>
        </div>
    </section>

    <section class="portfolio" id="portfolio">
        <div class="section-title">
            <h2>Featured Projects</h2>
            <p>A showcase of my recent work in web design and development</p>
        </div>
        <div class="portfolio-grid">
            <div class="project-card">
                <div class="project-image" style="background-image: url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop')"></div>
                <div class="project-content">
                    <h3>E-Commerce Platform</h3>
                    <div class="project-tech">
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Node.js</span>
                        <span class="tech-tag">MongoDB</span>
                    </div>
                    <p>A fully responsive e-commerce platform with modern UI/UX design, shopping cart functionality, and secure payment integration.</p>
                    <a href="#" class="project-link">View Project <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>

            <div class="project-card">
                <div class="project-image" style="background-image: url('https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&h=300&fit=crop')"></div>
                <div class="project-content">
                    <h3>Mobile Banking App</h3>
                    <div class="project-tech">
                        <span class="tech-tag">React Native</span>
                        <span class="tech-tag">Firebase</span>
                        <span class="tech-tag">UI/UX</span>
                    </div>
                    <p>Intuitive mobile banking application with biometric authentication, real-time transactions, and comprehensive financial analytics.</p>
                    <a href="#" class="project-link">View Project <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>

            <div class="project-card">
                <div class="project-image" style="background-image: url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop')"></div>
                <div class="project-content">
                    <h3>SaaS Dashboard</h3>
                    <div class="project-tech">
                        <span class="tech-tag">Vue.js</span>
                        <span class="tech-tag">D3.js</span>
                        <span class="tech-tag">Python</span>
                    </div>
                    <p>Advanced analytics dashboard for SaaS companies featuring real-time data visualization, custom reporting, and team collaboration tools.</p>
                    <a href="#" class="project-link">View Project <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>Alex Chen</h3>
                <p>Creative designer and developer passionate about crafting exceptional digital experiences.</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-github"></i></a>
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                    <a href="#"><i class="fab fa-dribbble"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Services</h3>
                <p>Web Design</p>
                <p>Frontend Development</p>
                <p>UI/UX Design</p>
                <p>Mobile App Development</p>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <p><i class="fas fa-envelope"></i> alex@portfolio.com</p>
                <p><i class="fas fa-phone"></i> +1 (555) 123-4567</p>
                <p><i class="fas fa-map-marker-alt"></i> San Francisco, CA</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Alex Chen. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
      description: "Professional creative portfolio with stunning design, real images, and complete sections"
    },
    business: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechFlow Solutions - Business Consulting</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }

        /* Navigation */
        .navbar { position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 0; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .logo { font-size: 1.8rem; font-weight: 700; color: #2563eb; }
        .nav-menu { display: flex; gap: 2rem; list-style: none; }
        .nav-menu a { text-decoration: none; color: #1f2937; font-weight: 500; transition: color 0.3s; }
        .nav-menu a:hover { color: #2563eb; }
        .nav-cta { background: #2563eb; color: white; padding: 0.8rem 1.5rem; border-radius: 25px; text-decoration: none; font-weight: 600; transition: transform 0.3s; }
        .nav-cta:hover { transform: translateY(-2px); }

        /* Hero Section */
        .hero { min-height: 100vh; display: flex; align-items: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); color: white; padding: 0 2rem; }
        .hero-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-content h1 { font-size: 3.5rem; font-weight: 300; margin-bottom: 1.5rem; line-height: 1.1; }
        .hero-content .highlight { color: #fbbf24; font-weight: 600; }
        .hero-content p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .hero-stats { display: flex; gap: 2rem; margin-bottom: 2rem; }
        .stat { text-align: center; }
        .stat-number { font-size: 2rem; font-weight: 700; color: #fbbf24; }
        .stat-label { font-size: 0.9rem; opacity: 0.8; }
        .hero-buttons { display: flex; gap: 1rem; }
        .btn-primary { background: #fbbf24; color: #1f2937; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: transform 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary { background: transparent; color: white; border: 2px solid white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
        .btn-secondary:hover { background: white; color: #1e40af; }
        .hero-image img { width: 100%; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

        /* Services Section */
        .services { padding: 6rem 2rem; background: #f8fafc; }
        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-header h2 { font-size: 2.5rem; font-weight: 300; color: #1f2937; margin-bottom: 1rem; }
        .section-header p { font-size: 1.1rem; color: #6b7280; max-width: 600px; margin: 0 auto; }
        .services-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .service-card { background: white; padding: 3rem 2rem; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; position: relative; overflow: hidden; }
        .service-card:hover { transform: translateY(-10px); }
        .service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa); }
        .service-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #2563eb, #3b82f6); border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; }
        .service-card h3 { font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; color: #1f2937; }
        .service-card p { color: #6b7280; margin-bottom: 1.5rem; }
        .service-link { color: #2563eb; text-decoration: none; font-weight: 600; }

        /* Testimonials */
        .testimonials { padding: 6rem 2rem; background: white; }
        .testimonials-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .testimonial { background: #f8fafc; padding: 2rem; border-radius: 20px; border-left: 4px solid #2563eb; }
        .testimonial-content { font-style: italic; margin-bottom: 1.5rem; color: #4b5563; }
        .testimonial-author { display: flex; align-items: center; gap: 1rem; }
        .author-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
        .author-info h4 { font-weight: 600; color: #1f2937; }
        .author-info p { color: #6b7280; font-size: 0.9rem; }

        /* CTA Section */
        .cta-section { padding: 6rem 2rem; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; text-align: center; }
        .cta-content { max-width: 800px; margin: 0 auto; }
        .cta-content h2 { font-size: 2.5rem; font-weight: 300; margin-bottom: 1rem; }
        .cta-content p { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; }

        /* Footer */
        .footer { background: #1f2937; color: white; padding: 4rem 2rem 2rem; }
        .footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .footer-section h3 { margin-bottom: 1rem; color: #fbbf24; }
        .footer-section p, .footer-section a { color: #d1d5db; text-decoration: none; margin-bottom: 0.5rem; display: block; }
        .footer-section a:hover { color: #fbbf24; }
        .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
        .social-links a { background: #374151; padding: 0.8rem; border-radius: 50%; transition: background 0.3s; }
        .social-links a:hover { background: #2563eb; }
        .footer-bottom { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #374151; color: #9ca3af; }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-container { grid-template-columns: 1fr; }
            .hero-content h1 { font-size: 2.5rem; }
            .hero-stats { justify-content: center; }
            .nav-menu { display: none; }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">TechFlow</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <a href="#contact" class="nav-cta">Get Started</a>
        </div>
    </nav>

    <section class="hero" id="home">
        <div class="hero-container">
            <div class="hero-content">
                <h1>Transform Your <span class="highlight">Business</span> with Digital Solutions</h1>
                <p>We help companies scale and succeed in the digital age with cutting-edge technology solutions and strategic consulting.</p>
                <div class="hero-stats">
                    <div class="stat">
                        <div class="stat-number">500+</div>
                        <div class="stat-label">Clients Served</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">98%</div>
                        <div class="stat-label">Success Rate</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">$2M+</div>
                        <div class="stat-label">Revenue Generated</div>
                    </div>
                </div>
                <div class="hero-buttons">
                    <a href="#services" class="btn-primary">Our Services</a>
                    <a href="#contact" class="btn-secondary">Free Consultation</a>
                </div>
            </div>
            <div class="hero-image">
                <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop" alt="Business team collaboration">
            </div>
        </div>
    </section>

    <section class="services" id="services">
        <div class="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive business solutions designed to accelerate your growth and maximize your potential</p>
        </div>
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon"><i class="fas fa-rocket"></i></div>
                <h3>Digital Transformation</h3>
                <p>Modernize your business processes with cutting-edge technology solutions that drive efficiency and growth.</p>
                <a href="#" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="service-card">
                <div class="service-icon"><i class="fas fa-chart-line"></i></div>
                <h3>Growth Strategy</h3>
                <p>Strategic planning and execution to scale your business operations and enter new markets successfully.</p>
                <a href="#" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="service-card">
                <div class="service-icon"><i class="fas fa-shield-alt"></i></div>
                <h3>Cybersecurity</h3>
                <p>Protect your business assets with comprehensive security solutions and risk management strategies.</p>
                <a href="#" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="service-card">
                <div class="service-icon"><i class="fas fa-cloud"></i></div>
                <h3>Cloud Solutions</h3>
                <p>Migrate to the cloud and optimize your infrastructure for better performance and cost efficiency.</p>
                <a href="#" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="service-card">
                <div class="service-icon"><i class="fas fa-brain"></i></div>
                <h3>AI & Analytics</h3>
                <p>Leverage artificial intelligence and data analytics to make smarter business decisions and automate processes.</p>
                <a href="#" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="service-card">
                <div class="service-icon"><i class="fas fa-handshake"></i></div>
                <h3>Business Consulting</h3>
                <p>Expert guidance on operations, strategy, and organizational development to optimize your business performance.</p>
                <a href="#" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    </section>

    <section class="testimonials">
        <div class="section-header">
            <h2>What Our Clients Say</h2>
            <p>Don't just take our word for it - hear from the businesses we've helped transform</p>
        </div>
        <div class="testimonials-grid">
            <div class="testimonial">
                <div class="testimonial-content">
                    "TechFlow transformed our outdated systems and helped us increase productivity by 300%. Their team's expertise and dedication are unmatched."
                </div>
                <div class="testimonial-author">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="John Smith" class="author-avatar">
                    <div class="author-info">
                        <h4>John Smith</h4>
                        <p>CEO, InnovateCorps</p>
                    </div>
                </div>
            </div>

            <div class="testimonial">
                <div class="testimonial-content">
                    "The strategic insights and implementation support we received led to a 150% increase in our revenue within just 8 months."
                </div>
                <div class="testimonial-author">
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" alt="Sarah Johnson" class="author-avatar">
                    <div class="author-info">
                        <h4>Sarah Johnson</h4>
                        <p>Founder, GrowthTech</p>
                    </div>
                </div>
            </div>

            <div class="testimonial">
                <div class="testimonial-content">
                    "Professional, reliable, and results-driven. TechFlow's cybersecurity solutions gave us the peace of mind we needed to focus on growth."
                </div>
                <div class="testimonial-author">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Michael Chen" class="author-avatar">
                    <div class="author-info">
                        <h4>Michael Chen</h4>
                        <p>CTO, SecureBase</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="cta-content">
            <h2>Ready to Transform Your Business?</h2>
            <p>Join hundreds of successful companies that have accelerated their growth with our proven solutions</p>
            <div class="hero-buttons">
                <a href="#contact" class="btn-primary">Start Your Journey</a>
                <a href="#services" class="btn-secondary">Explore Services</a>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>TechFlow Solutions</h3>
                <p>Empowering businesses through innovative technology solutions and strategic consulting services.</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

            <div class="footer-section">
                <h3>Services</h3>
                <a href="#">Digital Transformation</a>
                <a href="#">Growth Strategy</a>
                <a href="#">Cybersecurity</a>
                <a href="#">Cloud Solutions</a>
                <a href="#">AI & Analytics</a>
            </div>

            <div class="footer-section">
                <h3>Company</h3>
                <a href="#">About Us</a>
                <a href="#">Our Team</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
                <a href="#">Case Studies</a>
            </div>

            <div class="footer-section">
                <h3>Contact</h3>
                <p><i class="fas fa-envelope"></i> hello@techflow.com</p>
                <p><i class="fas fa-phone"></i> +1 (555) 987-6543</p>
                <p><i class="fas fa-map-marker-alt"></i> 123 Business Plaza, NYC</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 TechFlow Solutions. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
    </footer>
</body>
</html>`,
      description: "Professional business consulting website with complete sections, testimonials, and real content"
    },
    default: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InnovateHub - Digital Solutions</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; overflow-x: hidden; }

        /* Navigation */
        .navbar { position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); z-index: 1000; padding: 1rem 0; transition: all 0.3s; }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .logo { font-size: 1.8rem; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-menu { display: flex; gap: 2rem; list-style: none; }
        .nav-menu a { text-decoration: none; color: #1f2937; font-weight: 500; transition: color 0.3s; }
        .nav-menu a:hover { color: #667eea; }
        .nav-cta { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.8rem 1.5rem; border-radius: 25px; text-decoration: none; font-weight: 600; transition: transform 0.3s; }
        .nav-cta:hover { transform: translateY(-2px); }

        /* Hero Section */
        .hero { min-height: 100vh; display: flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop') center/cover; opacity: 0.1; }
        .hero-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 2; }
        .hero-content { max-width: 600px; }
        .hero-content h1 { font-size: 3.5rem; font-weight: 300; margin-bottom: 1.5rem; line-height: 1.1; animation: fadeInUp 1s ease; }
        .hero-content .highlight { color: #fbbf24; font-weight: 600; }
        .hero-content p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; animation: fadeInUp 1s ease 0.2s both; }
        .hero-features { display: flex; gap: 2rem; margin-bottom: 2rem; animation: fadeInUp 1s ease 0.4s both; }
        .feature-item { display: flex; align-items: center; gap: 0.5rem; }
        .feature-item i { color: #fbbf24; }
        .hero-buttons { display: flex; gap: 1rem; animation: fadeInUp 1s ease 0.6s both; }
        .btn-primary { background: #fbbf24; color: #1f2937; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: transform 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary { background: transparent; color: white; border: 2px solid white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
        .btn-secondary:hover { background: white; color: #667eea; }

        /* Features Section */
        .features { padding: 6rem 2rem; background: #f8fafc; }
        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-header h2 { font-size: 2.5rem; font-weight: 300; color: #1f2937; margin-bottom: 1rem; }
        .section-header p { font-size: 1.1rem; color: #6b7280; max-width: 600px; margin: 0 auto; }
        .features-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .feature-card { background: white; padding: 3rem 2rem; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; position: relative; overflow: hidden; }
        .feature-card:hover { transform: translateY(-10px); }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2); }
        .feature-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; }
        .feature-card h3 { font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; color: #1f2937; }
        .feature-card p { color: #6b7280; }

        /* Stats Section */
        .stats { padding: 6rem 2rem; background: linear-gradient(135deg, #1f2937, #374151); color: white; }
        .stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center; }
        .stat-item { }
        .stat-number { font-size: 3rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem; }
        .stat-label { font-size: 1.1rem; opacity: 0.9; }

        /* CTA Section */
        .cta-section { padding: 6rem 2rem; background: white; text-align: center; }
        .cta-content { max-width: 800px; margin: 0 auto; }
        .cta-content h2 { font-size: 2.5rem; font-weight: 300; margin-bottom: 1rem; color: #1f2937; }
        .cta-content p { font-size: 1.1rem; margin-bottom: 2rem; color: #6b7280; }

        /* Footer */
        .footer { background: #1f2937; color: white; padding: 4rem 2rem 2rem; }
        .footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .footer-section h3 { margin-bottom: 1rem; color: #fbbf24; }
        .footer-section p, .footer-section a { color: #d1d5db; text-decoration: none; margin-bottom: 0.5rem; display: block; }
        .footer-section a:hover { color: #fbbf24; }
        .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
        .social-links a { background: #374151; padding: 0.8rem; border-radius: 50%; transition: background 0.3s; }
        .social-links a:hover { background: #667eea; }
        .footer-bottom { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #374151; color: #9ca3af; }

        /* Animations */
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-content h1 { font-size: 2.5rem; }
            .hero-features { flex-direction: column; gap: 1rem; }
            .hero-buttons { flex-direction: column; }
            .nav-menu { display: none; }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">InnovateHub</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <a href="#contact" class="nav-cta">Get Started</a>
        </div>
    </nav>

    <section class="hero" id="home">
        <div class="hero-container">
            <div class="hero-content">
                <h1>Welcome to the <span class="highlight">Future</span> of Digital Innovation</h1>
                <p>Transform your ideas into reality with cutting-edge technology solutions. We create exceptional digital experiences that drive success.</p>
                <div class="hero-features">
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>24/7 Support</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>99.9% Uptime</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>Secure & Reliable</span>
                    </div>
                </div>
                <div class="hero-buttons">
                    <a href="#features" class="btn-primary">Explore Features</a>
                    <a href="#contact" class="btn-secondary">Start Free Trial</a>
                </div>
            </div>
        </div>
    </section>

    <section class="features" id="features">
        <div class="section-header">
            <h2>Powerful Features</h2>
            <p>Everything you need to build, scale, and succeed in the digital landscape</p>
        </div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-rocket"></i></div>
                <h3>Lightning Fast</h3>
                <p>Optimized for speed and performance with cutting-edge technology that delivers results in milliseconds.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                <h3>Secure & Reliable</h3>
                <p>Enterprise-grade security measures and 99.9% uptime guarantee to keep your business running smoothly.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-mobile-alt"></i></div>
                <h3>Mobile Optimized</h3>
                <p>Fully responsive design that works flawlessly across all devices and screen sizes.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
                <h3>Analytics & Insights</h3>
                <p>Comprehensive analytics dashboard with real-time insights to track your progress and success.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-cogs"></i></div>
                <h3>Easy Integration</h3>
                <p>Seamlessly integrate with your existing tools and workflows with our powerful API and plugins.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon"><i class="fas fa-headset"></i></div>
                <h3>24/7 Support</h3>
                <p>Round-the-clock customer support from our expert team to help you succeed every step of the way.</p>
            </div>
        </div>
    </section>

    <section class="stats">
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">10K+</div>
                <div class="stat-label">Happy Customers</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">Uptime Guarantee</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">50M+</div>
                <div class="stat-label">Requests Served</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Expert Support</div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers who have transformed their business with our solutions</p>
            <div class="hero-buttons">
                <a href="#contact" class="btn-primary">Start Free Trial</a>
                <a href="#features" class="btn-secondary">Learn More</a>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>InnovateHub</h3>
                <p>Empowering businesses with innovative digital solutions that drive growth and success in the modern world.</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

            <div class="footer-section">
                <h3>Product</h3>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Security</a>
                <a href="#">Integrations</a>
                <a href="#">API Documentation</a>
            </div>

            <div class="footer-section">
                <h3>Company</h3>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
                <a href="#">Blog</a>
                <a href="#">Partners</a>
            </div>

            <div class="footer-section">
                <h3>Support</h3>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">Status Page</a>
                <a href="#">Community</a>
                <a href="#">Tutorials</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 InnovateHub. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
    </footer>
</body>
</html>`,
      description: "Professional digital solutions website with complete features, stats, and modern design"
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

export const generateWebsiteCode = async (prompt, contextualPrompt = null) => {
  try {
    // Quick connectivity test first
    if (!isOnline()) {
      console.warn('Device appears to be offline, using demo template');
      const demoWebsite = generateOfflineWebsite(prompt);
      return {
        success: true,
        data: {
          ...demoWebsite,
          isOffline: true
        }
      };
    }

    // Quick API health check for complex requests
    const isComplexRequest = prompt.length > 100 || prompt.toLowerCase().includes('multiple') || prompt.toLowerCase().includes('complex');
    if (isComplexRequest) {
      console.log('Complex request detected, checking API health...');
    }
    // Use contextual prompt if provided, otherwise use optimized professional default
    const systemPrompt = contextualPrompt?.systemPrompt || `You are an expert web designer creating PROFESSIONAL, PRODUCTION-READY websites.

OUTPUT: Return only valid JSON:
{
  "html": "Complete HTML with embedded CSS and JavaScript",
  "description": "Professional website description"
}

REQUIREMENTS:
- STUNNING modern design with unique layouts and beautiful colors
- REAL Unsplash images: https://images.unsplash.com/photo-[ID]?w=800&h=600&fit=crop
- COMPLETE professional content (no placeholders)
- RESPONSIVE design with smooth animations
- PROFESSIONAL navigation, hero sections, and footers
- BUSINESS-READY copy with testimonials and contact info
- MODERN CSS with Grid/Flexbox and hover effects

Create agency-quality websites that are immediately usable for real businesses.`;

    // Make the API call with smart retry logic
    let response;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`OpenAI API attempt ${attempt}/${maxRetries}`);

        // Progressive timeout increase for retries
        const timeoutForAttempt = 90000 + (attempt - 1) * 60000; // 90s, 150s, 210s

        // Use faster model and simpler prompt for first attempts
        const userPrompt = contextualPrompt?.enhancedUserPrompt || prompt;
        const isSimpleRequest = userPrompt.length < 100 && !userPrompt.toLowerCase().includes('complex') && !userPrompt.toLowerCase().includes('multiple pages');

        // Smart model and prompt selection
        let modelToUse, promptToUse, maxTokens;
        if (attempt === 1) {
          // First attempt: Use faster model and simpler prompt
          modelToUse = "gpt-3.5-turbo";
          promptToUse = `Create a professional ${userPrompt} website. Return only JSON: {"html": "complete HTML with embedded CSS", "description": "description"}. Use modern design, real Unsplash images, and professional content.`;
          maxTokens = 3000;
        } else {
          // Later attempts: Use detailed system prompt
          modelToUse = attempt === 2 ? "gpt-3.5-turbo" : "gpt-4-turbo-preview";
          promptToUse = systemPrompt;
          maxTokens = 4096;
        }

        const messages = attempt === 1 ? [
          { role: "user", content: promptToUse }
        ] : [
          { role: "system", content: promptToUse },
          { role: "user", content: userPrompt }
        ];

        response = await callOpenAIAPI(messages, {
          model: modelToUse,
          temperature: 0.6,
          max_tokens: maxTokens,
          timeout: timeoutForAttempt
        });

        console.log(`Used model: ${modelToUse} (attempt ${attempt})`);

        // If we get here, the request succeeded
        console.log(`OpenAI API call succeeded on attempt ${attempt}`);
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

        // For timeout errors, provide specific guidance and early fallback
        if (apiError.message?.includes('timeout')) {
          console.warn(`Timeout on attempt ${attempt}, will retry with longer timeout...`);

          // If we've had 2 timeouts, provide demo immediately instead of waiting
          if (attempt >= 2) {
            console.warn('Multiple timeouts detected, providing demo template');
            const demoWebsite = generateOfflineWebsite(prompt);
            return {
              success: true,
              data: {
                ...demoWebsite,
                isOffline: true,
                fallbackReason: 'API consistently timing out - provided demo template'
              }
            };
          }
        }

        // For retryable errors, wait with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
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

      // Check if it's a React project structure
      if (parsedResponse.projectStructure) {
        return {
          success: true,
          data: parsedResponse
        };
      }

      // Check if it's a traditional HTML response
      if (parsedResponse.html) {
        return {
          success: true,
          data: parsedResponse
        };
      }

      throw new Error('Invalid response: missing required content');

    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError);
      console.warn('Raw content:', content.substring(0, 500) + '...');

      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[1]);
          if (parsedResponse.projectStructure || parsedResponse.html) {
            return {
              success: true,
              data: parsedResponse
            };
          }
        } catch (extractError) {
          console.warn('Failed to parse extracted JSON:', extractError);
        }
      }

      // Fallback: create a simple HTML website
      return {
        success: true,
        data: {
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-6">
                <h1 class="text-3xl font-bold text-gray-900">Generated Website</h1>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 py-8">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 class="text-xl font-semibold mb-4">Your Request</h2>
                <p class="text-gray-600 bg-gray-50 p-4 rounded">${prompt}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-3">Feature 1</h3>
                    <p class="text-gray-600">This is a sample feature section for your website.</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-3">Feature 2</h3>
                    <p class="text-gray-600">Another feature section with compelling content.</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-3">Feature 3</h3>
                    <p class="text-gray-600">A third feature to complete the layout.</p>
                </div>
            </div>
        </main>

        <footer class="bg-gray-800 text-white mt-16">
            <div class="max-w-7xl mx-auto px-4 py-8">
                <p class="text-center">&copy; 2024 Generated Website. All rights reserved.</p>
            </div>
        </footer>
    </div>
</body>
</html>`,
          description: `Generated website for: ${prompt}`
        }
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);

    // If it's a timeout or network error, provide fallback
    if (error.message?.includes('timeout') || error.message?.includes('Network error') || error.message?.includes('Failed to fetch')) {
      console.warn('API timeout/network error detected, providing demo template as fallback');
      const demoWebsite = generateOfflineWebsite(prompt);
      return {
        success: true,
        data: {
          ...demoWebsite,
          isOffline: true,
          fallbackReason: 'API timeout - generated demo template'
        }
      };
    }

    // Return a user-friendly error for other issues
    return {
      success: false,
      error: error.message || 'Failed to generate website code. Please try again.'
    };
  }
};
