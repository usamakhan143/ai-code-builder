// Chunking Service for Breaking Down Complex Projects
import { generateWebsiteCode } from './openai';

// Analyze prompt and determine if chunking is needed
export const analyzeProjectComplexity = (prompt) => {
  const complexityIndicators = [
    'multi-page', 'multiple pages', '4+ pages', '5+ pages', '6+ pages',
    'e-commerce', 'shopping cart', 'user authentication', 'dashboard',
    'admin panel', 'blog system', 'CMS', 'portfolio', 'gallery',
    'pricing table', 'testimonials', 'services', 'features',
    'contact form', 'newsletter', 'search functionality',
    'social media', 'integration', 'payment', 'checkout'
  ];

  const wordCount = prompt.split(' ').length;
  const hasComplexFeatures = complexityIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator)
  );
  
  // Determine if chunking is needed
  const needsChunking = wordCount > 50 || hasComplexFeatures || 
    prompt.toLowerCase().includes('page') && prompt.split('page').length > 2;

  return {
    needsChunking,
    estimatedComplexity: needsChunking ? 'high' : 'medium',
    wordCount,
    hasComplexFeatures
  };
};

// Extract pages and features from prompt
export const extractProjectStructure = (prompt) => {
  const pages = [];
  const features = [];
  
  // Common page patterns
  const pagePatterns = [
    /home\s*page/gi, /landing\s*page/gi, /main\s*page/gi,
    /about\s*(?:us|page)?/gi, /contact\s*(?:us|page)?/gi,
    /services?\s*page?/gi, /products?\s*page?/gi,
    /portfolio\s*page?/gi, /gallery\s*page?/gi,
    /blog\s*page?/gi, /news\s*page?/gi,
    /pricing\s*page?/gi, /plans?\s*page?/gi,
    /testimonials?\s*page?/gi, /reviews?\s*page?/gi,
    /team\s*page?/gi, /staff\s*page?/gi,
    /login\s*page?/gi, /signup\s*page?/gi, /register\s*page?/gi,
    /dashboard\s*page?/gi, /profile\s*page?/gi,
    /careers?\s*page?/gi, /jobs?\s*page?/gi,
    /faq\s*page?/gi, /help\s*page?/gi,
    /privacy\s*(?:policy)?/gi, /terms\s*(?:of\s*service)?/gi
  ];

  // Extract pages
  pagePatterns.forEach(pattern => {
    const matches = prompt.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const pageName = match.replace(/\s*page?/gi, '').trim();
        if (pageName && !pages.some(p => p.toLowerCase() === pageName.toLowerCase())) {
          pages.push(pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase());
        }
      });
    }
  });

  // Default pages if none found
  if (pages.length === 0) {
    pages.push('Home', 'About', 'Contact');
  }

  // Extract features
  const featurePatterns = [
    /shopping\s*cart/gi, /e-?commerce/gi, /online\s*store/gi,
    /user\s*authentication/gi, /login\s*system/gi, /user\s*accounts/gi,
    /search\s*functionality/gi, /search\s*feature/gi,
    /contact\s*form/gi, /newsletter\s*signup/gi,
    /social\s*media\s*integration/gi, /social\s*links/gi,
    /responsive\s*design/gi, /mobile\s*friendly/gi,
    /admin\s*panel/gi, /dashboard/gi, /cms/gi,
    /payment\s*integration/gi, /payment\s*gateway/gi,
    /blog\s*system/gi, /comment\s*system/gi,
    /image\s*gallery/gi, /photo\s*gallery/gi,
    /testimonials?/gi, /reviews?\s*section/gi,
    /pricing\s*table/gi, /subscription\s*plans/gi
  ];

  featurePatterns.forEach(pattern => {
    const matches = prompt.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const feature = match.trim();
        if (!features.some(f => f.toLowerCase() === feature.toLowerCase())) {
          features.push(feature);
        }
      });
    }
  });

  return { pages, features };
};

// Create chunks for project generation
export const createProjectChunks = (prompt) => {
  const analysis = analyzeProjectComplexity(prompt);
  const structure = extractProjectStructure(prompt);
  
  if (!analysis.needsChunking) {
    return [{
      id: 1,
      type: 'complete',
      prompt: prompt,
      description: 'Complete project generation'
    }];
  }

  const chunks = [];
  
  // Chunk 1: Project Architecture & Main Layout
  chunks.push({
    id: 1,
    type: 'architecture',
    prompt: `Create the main React project architecture for: ${prompt}. Focus on:
- Project structure and file organization
- Main App.js with routing setup
- Header and Footer components
- Navigation structure
- Global styles and theme
- Package.json with dependencies
Pages needed: ${structure.pages.join(', ')}`,
    description: 'Project architecture and navigation',
    pages: ['App', 'Header', 'Footer'],
    estimatedTokens: 3000
  });

  // Chunk 2-N: Individual Pages
  structure.pages.forEach((page, index) => {
    chunks.push({
      id: index + 2,
      type: 'page',
      prompt: `Create a detailed ${page} page component for: ${prompt}. 
- Make it fully functional and responsive
- Include relevant content and sections for ${page}
- Use modern React patterns and TailwindCSS
- Add realistic content and placeholder images
- Integrate with the overall project theme`,
      description: `${page} page component`,
      pages: [page],
      estimatedTokens: 2500
    });
  });

  // Final Chunk: Integration & Features
  if (structure.features.length > 0) {
    chunks.push({
      id: chunks.length + 1,
      type: 'features',
      prompt: `Add these features to the React project: ${structure.features.join(', ')}
- Integrate features seamlessly with existing components
- Add necessary state management and hooks
- Include any additional utility functions
- Ensure all features work together properly`,
      description: 'Features and integrations',
      features: structure.features,
      estimatedTokens: 2000
    });
  }

  return chunks;
};

// Process chunks sequentially
export const processProjectChunks = async (chunks, onProgress) => {
  const results = [];
  let combinedProject = {
    projectStructure: {},
    description: '',
    pages: [],
    features: []
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Update progress
    onProgress({
      currentChunk: i + 1,
      totalChunks: chunks.length,
      chunkDescription: chunk.description,
      status: 'processing'
    });

    try {
      // Generate chunk
      const result = await generateWebsiteCode(chunk.prompt);
      
      if (result.success) {
        results.push({
          chunkId: chunk.id,
          type: chunk.type,
          data: result.data
        });

        // Merge results
        if (result.data.projectStructure) {
          combinedProject.projectStructure = {
            ...combinedProject.projectStructure,
            ...result.data.projectStructure
          };
        }

        if (result.data.pages) {
          combinedProject.pages = [...new Set([...combinedProject.pages, ...result.data.pages])];
        }

        if (result.data.features) {
          combinedProject.features = [...new Set([...combinedProject.features, ...result.data.features])];
        }

        if (result.data.description) {
          combinedProject.description += (combinedProject.description ? ' | ' : '') + result.data.description;
        }

        // Update progress
        onProgress({
          currentChunk: i + 1,
          totalChunks: chunks.length,
          chunkDescription: chunk.description,
          status: 'completed'
        });

      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      onProgress({
        currentChunk: i + 1,
        totalChunks: chunks.length,
        chunkDescription: chunk.description,
        status: 'error',
        error: error.message
      });
      
      // Continue with remaining chunks even if one fails
      console.error(`Chunk ${chunk.id} failed:`, error);
    }

    // Add delay between chunks to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: true,
    data: combinedProject,
    chunks: results,
    isChunked: true
  };
};

// Estimate total tokens and cost
export const estimateProjectCost = (chunks) => {
  const totalTokens = chunks.reduce((sum, chunk) => sum + (chunk.estimatedTokens || 3000), 0);
  const estimatedCost = (totalTokens / 1000) * 0.06; // Rough estimate
  
  return {
    totalTokens,
    estimatedCost: estimatedCost.toFixed(3),
    totalChunks: chunks.length,
    estimatedTime: chunks.length * 15 // seconds
  };
};
