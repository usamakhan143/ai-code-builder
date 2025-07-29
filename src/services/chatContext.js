// Context-Aware Chat Service for Project Conversations

// Build conversation context from chat history
export const buildConversationContext = (chatHistory, currentProject) => {
  // Consider it first message if no chat history or only user messages (no AI responses with generated code)
  const hasGeneratedContent = chatHistory && chatHistory.some(msg => msg.generatedCode);

  if (!chatHistory || chatHistory.length === 0 || !hasGeneratedContent) {
    return {
      isFirstMessage: true,
      projectContext: null,
      conversationSummary: null,
      previousRequests: [],
      currentProjectState: null,
      totalMessages: 0,
      generationCount: 0
    };
  }

  // Extract project information from chat history
  const projectMessages = chatHistory.filter(msg => msg.generatedCode);
  const userRequests = chatHistory.filter(msg => msg.type === 'user');
  const assistantResponses = chatHistory.filter(msg => msg.type === 'assistant' && msg.generatedCode);

  // Build current project state
  const currentProjectState = projectMessages.length > 0 ? 
    projectMessages[projectMessages.length - 1].generatedCode : null;

  // Extract conversation patterns
  const previousRequests = userRequests.map(msg => msg.content);
  const completedFeatures = [];
  const projectPages = [];
  const projectFeatures = [];

  // Analyze completed work
  assistantResponses.forEach(response => {
    if (response.generatedCode) {
      if (response.generatedCode.pages) {
        projectPages.push(...response.generatedCode.pages);
      }
      if (response.generatedCode.features) {
        projectFeatures.push(...response.generatedCode.features);
      }
    }
  });

  // Create conversation summary
  const conversationSummary = generateConversationSummary(
    userRequests, 
    assistantResponses, 
    [...new Set(projectPages)], 
    [...new Set(projectFeatures)]
  );

  return {
    isFirstMessage: false,
    projectContext: {
      name: currentProject?.name || 'Untitled Project',
      pages: [...new Set(projectPages)],
      features: [...new Set(projectFeatures)],
      isReactProject: currentProjectState?.projectStructure ? true : false,
      lastModified: chatHistory[chatHistory.length - 1]?.timestamp
    },
    conversationSummary: conversationSummary || {
      originalRequest: 'No initial request',
      recentRequests: [],
      completedPages: [],
      implementedFeatures: [],
      iterationCount: 0
    },
    previousRequests: previousRequests || [],
    currentProjectState: currentProjectState || null,
    totalMessages: chatHistory?.length || 0,
    generationCount: projectMessages?.length || 0
  };
};

// Generate a concise summary of the conversation
const generateConversationSummary = (userRequests, assistantResponses, pages, features) => {
  // Always return a valid object, never null
  const firstRequest = userRequests.length > 0 ? (userRequests[0]?.content || '') : 'No initial request';
  const recentRequests = userRequests.length > 0 ? userRequests.slice(-3).map(req => req.content || '') : [];

  return {
    originalRequest: firstRequest,
    recentRequests,
    completedPages: pages || [],
    implementedFeatures: features || [],
    iterationCount: userRequests.length
  };
};

// Create context-aware system prompt
export const createContextAwarePrompt = (userMessage, context) => {
  if (context.isFirstMessage) {
    // First message - use standard prompt
    return {
      systemPrompt: createInitialSystemPrompt(),
      enhancedUserPrompt: userMessage,
      isContextAware: false
    };
  }

  // Subsequent messages - use context-aware prompt
  return {
    systemPrompt: createContextualSystemPrompt(context),
    enhancedUserPrompt: createEnhancedUserPrompt(userMessage, context),
    isContextAware: true
  };
};

// Initial system prompt for first messages
const createInitialSystemPrompt = () => {
  return `You are an expert full-stack web developer who creates PRODUCTION-READY, PROFESSIONAL websites. You build complete, functional, beautiful websites that businesses can actually use.

TECHNOLOGY DETECTION RULES:
1. If user mentions "HTML", "HTML website", "HTML site" → Generate HTML/CSS/JS
2. If user mentions "React", "React app", "React project" → Generate React project
3. If user mentions other frameworks (Vue, Angular, etc.) → Use that framework
4. If NO technology specified → DEFAULT TO HTML/CSS/JS (NOT React)
5. NEVER assume React unless explicitly requested

OUTPUT FORMAT:

FOR HTML/CSS/JS WEBSITES (DEFAULT):
{
  "html": "Complete production-ready HTML with embedded CSS and JavaScript",
  "css": "",
  "js": "",
  "description": "Professional website description"
}

FOR REACT PROJECTS (only if specifically requested):
{
  "projectStructure": {
    "src/App.js": "Complete functional component",
    "src/components/": "Full component files",
    "package.json": "All dependencies"
  },
  "description": "Project description",
  "pages": ["All page names"],
  "features": ["All feature list"]
}

PRODUCTION-READY REQUIREMENTS:
1. CREATE COMPLETE, DETAILED CONTENT - never use placeholders
2. GENERATE REAL business content, not "Lorem ipsum" or "Sample text"
3. INCLUDE ALL requested sections with full content
4. ADD PROFESSIONAL styling with modern design trends
5. IMPLEMENT WORKING functionality (forms, navigation, interactions)
6. USE REALISTIC business information and copy
7. CREATE MULTIPLE sections per page (hero, features, testimonials, etc.)
8. ADD PROPER SEO meta tags and accessibility features

DESIGN EXCELLENCE:
- Create STUNNING, modern designs with unique color schemes
- Use professional typography and spacing
- Add beautiful gradients, shadows, and animations
- Implement responsive design for all devices
- Include hero sections, feature grids, call-to-actions
- Use high-quality placeholder images from Unsplash
- Create engaging, conversion-focused layouts

CONTENT QUALITY:
- Write compelling, professional copy for all sections
- Generate realistic business information
- Create detailed service/product descriptions
- Add authentic testimonials and reviews
- Include proper contact information
- Write engaging headlines and calls-to-action

NEVER generate basic structures or placeholder content. Create websites that look like they were built by a professional agency for real businesses.`;
};

// Context-aware system prompt for subsequent messages
const createContextualSystemPrompt = (context) => {
  // Safely extract conversation data with defaults
  const projectName = context.projectContext?.name || 'Untitled Project';
  const isReactProject = context.projectContext?.isReactProject || false;
  const pages = context.projectContext?.pages || [];
  const features = context.projectContext?.features || [];
  const generationCount = context.generationCount || 0;

  // Safely handle conversation summary
  const originalRequest = context.conversationSummary?.originalRequest || 'No previous request';
  const recentRequests = context.conversationSummary?.recentRequests || [];

  return `You are an expert React developer working on an EXISTING project. You understand the current project state and can make intelligent modifications.

CURRENT PROJECT CONTEXT:
- Project Name: ${projectName}
- Type: ${isReactProject ? 'React Application' : 'HTML Website'}
- Existing Pages: ${pages.join(', ')}
- Current Features: ${features.join(', ')}
- Total Iterations: ${generationCount}

CONVERSATION HISTORY:
- Original Request: "${originalRequest}"
- Recent Changes: ${recentRequests.slice(-2).join(' | ')}

MANDATORY BEHAVIOR:
1. UNDERSTAND the existing project structure and maintain consistency
2. MODIFY or ADD to existing components rather than recreating everything
3. PRESERVE existing functionality while adding new features
4. MAINTAIN the same design language and coding patterns
5. UPDATE existing files when making changes, don't just create new ones
6. REFERENCE previous work and build upon it intelligently

OUTPUT FORMAT - Return ONLY the changes/additions needed:
{
  "projectStructure": {
    "src/pages/NewPage.jsx": "Only new or modified files",
    "src/components/UpdatedComponent.jsx": "Only if component needs updates"
  },
  "description": "Description of changes made",
  "pages": ["Updated list of all pages"],
  "features": ["Updated list of all features"],
  "changeType": "addition|modification|enhancement",
  "modifiedFiles": ["List of files that were changed"]
}

CRITICAL: You are MODIFYING an existing project, not creating a new one. Be smart about what needs to change.`;
};

// Enhance user prompt with context
const createEnhancedUserPrompt = (userMessage, context) => {
  // Safely handle current project state
  const projectState = context.currentProjectState || { description: 'No existing project state' };
  const totalMessages = context.totalMessages || 1;

  return `CURRENT PROJECT STATE:
${JSON.stringify(projectState, null, 2)}

USER REQUEST: ${userMessage}

CONTEXT: This is iteration #${totalMessages} for this project. The user is asking for modifications/additions to the existing project above. Please make intelligent changes that build upon the existing work.`;
};

// Determine if request is asking for modifications vs new creation
export const analyzeRequestType = (userMessage, context) => {
  // ALWAYS treat first message as new project
  if (context.isFirstMessage || context.totalMessages <= 1) {
    return 'new_project';
  }

  const modificationKeywords = [
    'change', 'modify', 'update', 'edit', 'fix', 'improve', 'enhance',
    'add to', 'remove', 'delete', 'replace', 'adjust', 'tweak',
    'make it', 'can you', 'please update', 'i want to change'
  ];

  const additionKeywords = [
    'add', 'include', 'create new', 'insert', 'append', 'plus',
    'also add', 'need another', 'additional', 'extra'
  ];

  const newProjectKeywords = [
    'create', 'build', 'generate', 'make a new', 'start fresh',
    'completely new', 'from scratch'
  ];

  const message = userMessage.toLowerCase();

  if (modificationKeywords.some(keyword => message.includes(keyword))) {
    return 'modification';
  }

  if (additionKeywords.some(keyword => message.includes(keyword))) {
    return 'addition';
  }

  if (newProjectKeywords.some(keyword => message.includes(keyword))) {
    return 'new_project';
  }

  // Default to modification for follow-up messages if unclear
  return 'modification';
};

// Merge new changes with existing project
export const mergeProjectChanges = (existingProject, newChanges, changeType) => {
  if (!existingProject || changeType === 'new_project') {
    return newChanges;
  }

  const merged = {
    projectStructure: {
      ...existingProject.projectStructure,
      ...newChanges.projectStructure
    },
    description: newChanges.description || existingProject.description,
    pages: [...new Set([
      ...(existingProject.pages || []),
      ...(newChanges.pages || [])
    ])],
    features: [...new Set([
      ...(existingProject.features || []),
      ...(newChanges.features || [])
    ])],
    changeType: changeType,
    modifiedFiles: newChanges.modifiedFiles || [],
    lastUpdate: new Date().toISOString()
  };

  return merged;
};

// Extract what was changed in the latest update
export const extractChangeSummary = (changes, changeType) => {
  if (!changes) return 'No changes detected';

  const modifiedFiles = changes.modifiedFiles || Object.keys(changes.projectStructure || {});
  const newPages = changes.pages || [];
  const newFeatures = changes.features || [];

  switch (changeType) {
    case 'addition':
      return `Added ${modifiedFiles.length} files, ${newPages.length} pages, ${newFeatures.length} features`;
    case 'modification':
      return `Modified ${modifiedFiles.length} files, updated existing functionality`;
    case 'enhancement':
      return `Enhanced project with improved ${modifiedFiles.length} components`;
    case 'new_project':
      return `Created new project with ${newPages.length} pages and ${newFeatures.length} features`;
    default:
      return `Updated project with ${modifiedFiles.length} changes`;
  }
};
