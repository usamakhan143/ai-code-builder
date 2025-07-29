import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { generateWebsiteCode } from '../services/openai';
import {
  analyzeProjectComplexity,
  createProjectChunks,
  processProjectChunks,
  estimateProjectCost
} from '../services/chunking';
import {
  buildConversationContext,
  createContextAwarePrompt,
  analyzeRequestType,
  mergeProjectChanges,
  extractChangeSummary
} from '../services/chatContext';
import { downloadProjectAsZip } from '../services/zipDownload';
import { 
  MessageSquare, 
  Send, 
  Download, 
  Settings, 
  History, 
  Plus, 
  User, 
  LogOut,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  Code,
  Eye,
  Folder
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ChatMessage from '../components/ChatMessage';
import ProjectSidebar from '../components/ProjectSidebar';
import FileChanges from '../components/FileChanges';
import ChatHistory from '../components/ChatHistory';
import FileTree from '../components/FileTree';


function Workspace() {
  const { currentUser, logout } = useAuth();
  const {
    currentProject,
    projects,
    chatHistory,
    addChatMessage,
    addProjectVersion,
    createProject,
    loadProject,
    deleteProject,
    firestoreError,
    isFirestoreAvailable
  } = useProject();

  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [isChunkedGeneration, setIsChunkedGeneration] = useState(false);
  const [chunkingProgress, setChunkingProgress] = useState(null);
  const [showChunkingPreview, setShowChunkingPreview] = useState(false);


  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;

    try {
      setIsGenerating(true);

      // Add user message to chat
      await addChatMessage({
        type: 'user',
        content: message || '',
        sender: currentUser.displayName || currentUser.email || 'Anonymous User'
      });

      const userMessage = message;
      setMessage('');

      // Build conversation context
      const context = buildConversationContext(chatHistory, currentProject);

      // Create context-aware prompt
      const contextualPrompt = createContextAwarePrompt(userMessage, context);

      // Analyze request type (new project, modification, addition)
      const requestType = analyzeRequestType(userMessage, context);

      // Add context awareness message ONLY for actual follow-up requests
      if (!context.isFirstMessage && context.totalMessages > 0 && requestType !== 'new_project') {
        await addChatMessage({
          type: 'assistant',
          content: `🧠 **Context Understood**: I see this is ${requestType === 'modification' ? 'a modification' : requestType === 'addition' ? 'an addition' : 'an enhancement'} to your existing **${context.projectContext.name}** project.

Current project has:
- ${context.projectContext.pages.length} pages: ${context.projectContext.pages.join(', ')}
- ${context.projectContext.features.length} features implemented
- ${context.totalMessages} previous interactions

Working on your request...`,
          sender: 'AI Assistant',
          isContextual: true
        });
      }

      // Analyze if chunking is needed (but consider context)
      const complexity = analyzeProjectComplexity(userMessage);

      if (complexity.needsChunking && context.isFirstMessage) {
        // Use chunked generation for complex new projects
        await handleChunkedGeneration(userMessage, contextualPrompt);
      } else {
        // Use context-aware generation
        await handleContextAwareGeneration(userMessage, contextualPrompt, context, requestType);
      }
    } catch (error) {
      console.error('Error generating website:', error);
      await addChatMessage({
        type: 'assistant',
        content: 'I apologize, but I encountered an unexpected error. Please try again.',
        sender: 'AI Assistant',
        isError: true
      });
    } finally {
      setIsGenerating(false);
      setIsChunkedGeneration(false);
      setChunkingProgress(null);
      // Ensure message input is reset and available
      setMessage('');
    }
  };

  const handleContextAwareGeneration = async (userMessage, contextualPrompt, context, requestType) => {
    const result = await generateWebsiteCode(userMessage, contextualPrompt);

    if (result.success) {
      setNetworkError(null);

      // Merge changes with existing project if this is a modification
      const finalProject = context.isFirstMessage ?
        result.data :
        mergeProjectChanges(context.currentProjectState, result.data, requestType);

      const isReactProject = finalProject.projectStructure;
      const changeSummary = extractChangeSummary(result.data, requestType);

      // Create appropriate response message
      let responseContent;
      if (context.isFirstMessage) {
        responseContent = isReactProject
          ? `✨ **New React Project Created!**\n\nI've generated a complete React project: "${userMessage}"\n\n📊 **Project Overview:**\n- ${finalProject.pages?.length || 0} pages\n- ${finalProject.features?.length || 0} features\n- Modern components and routing`
          : `✨ **Website Generated!**\n\nI've created a website based on your request: "${userMessage}"`;
      } else {
        responseContent = `✅ **Project Updated Successfully!**\n\n🔄 **Changes Made:** ${changeSummary}\n\n📊 **Updated Project:**\n- ${finalProject.pages?.length || 0} total pages\n- ${finalProject.features?.length || 0} total features\n- Request type: ${requestType}\n\nYour project has been enhanced with the requested changes!`;
      }

      await addChatMessage({
        type: 'assistant',
        content: responseContent,
        generatedCode: finalProject,
        sender: 'AI Assistant',
        isReactProject: Boolean(isReactProject),
        isContextual: Boolean(!context.isFirstMessage),
        requestType: requestType || 'new_project'
      });

      await addProjectVersion({
        prompt: userMessage || '',
        code: finalProject || {},
        isReactProject: Boolean(isReactProject),
        requestType: requestType || 'new_project',
        isContextual: Boolean(!context.isFirstMessage),
        changes: isReactProject
          ? Object.keys(result.data.projectStructure || {}).map(filePath => ({
              type: requestType || 'created',
              file: filePath || 'unknown',
              description: `${requestType || 'created'}: ${filePath || 'unknown'}`
            }))
          : [{
              type: requestType || 'created',
              file: 'index.html',
              description: `${requestType || 'created'}: main HTML file`
            }]
      });

      setGeneratedCode(finalProject);
    } else {
      setNetworkError(result.error);
      await addChatMessage({
        type: 'assistant',
        content: `I apologize, but I encountered an error while ${context.isFirstMessage ? 'generating' : 'updating'} the website: ${result.error}`,
        sender: 'AI Assistant',
        isError: true
      });
    }
  };

  const handleRegularGeneration = async (userMessage) => {
    // This is now handled by handleContextAwareGeneration
    const context = { isFirstMessage: true };
    const contextualPrompt = createContextAwarePrompt(userMessage, context);
    await handleContextAwareGeneration(userMessage, contextualPrompt, context, 'new_project');
  };

  const handleChunkedGeneration = async (userMessage, contextualPrompt = null) => {
    setIsChunkedGeneration(true);

    // Create chunks
    const chunks = createProjectChunks(userMessage);
    const costEstimate = estimateProjectCost(chunks);

    // Show chunking preview
    await addChatMessage({
      type: 'assistant',
      content: `I'll generate this complex project in ${chunks.length} parts for better quality:

🔄 **Chunked Generation Plan:**
${chunks.map((chunk, i) => `${i + 1}. ${chunk.description}`).join('\n')}

📊 **Estimates:**
- Total chunks: ${costEstimate.totalChunks}
- Estimated tokens: ${costEstimate.totalTokens.toLocaleString()}
- Estimated time: ${Math.round(costEstimate.estimatedTime / 60)} minutes

Starting generation...`,
      sender: 'AI Assistant',
      isChunked: true
    });

    // Process chunks
    const result = await processProjectChunks(chunks, (progress) => {
      setChunkingProgress(progress);
    });

    if (result.success) {
      setNetworkError(null);

      await addChatMessage({
        type: 'assistant',
        content: `✅ **Chunked generation completed!**

Generated a comprehensive React project with:
- ${result.data.pages?.length || 0} pages
- ${Object.keys(result.data.projectStructure || {}).length} files
- ${result.data.features?.length || 0} features

The project is now ready for preview and download!`,
        generatedCode: result.data || {},
        sender: 'AI Assistant',
        isReactProject: true,
        isChunked: true
      });

      await addProjectVersion({
        prompt: userMessage || '',
        code: result.data || {},
        isReactProject: true,
        isChunked: true,
        changes: Object.keys(result.data.projectStructure || {}).map(filePath => ({
          type: 'created',
          file: filePath || 'unknown',
          description: `Generated ${filePath || 'unknown'} (chunked)`
        }))
      });

      setGeneratedCode(result.data);
    } else {
      await addChatMessage({
        type: 'assistant',
        content: `❌ Chunked generation encountered issues. Some parts may be incomplete. Please try again or use a simpler prompt.`,
        sender: 'AI Assistant',
        isError: true
      });
    }
  };

  const handleDownloadProject = async () => {
    if (!generatedCode || !currentProject) {
      alert('No project to download. Please generate a website first.');
      return;
    }

    const result = await downloadProjectAsZip(generatedCode, currentProject.name);
    if (!result.success) {
      alert('Failed to create ZIP file: ' + result.error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await createProject(newProjectName);
      setNewProjectName('');
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateReactPreview = (projectStructure) => {
    // Create a beautiful HTML preview that represents the React project
    const appComponent = projectStructure['src/App.js'] || '';
    const globalStyles = projectStructure['src/styles/globals.css'] || '';

    // Extract page names from the project structure
    const pageFiles = Object.keys(projectStructure).filter(path => path.includes('/pages/'));
    const pages = pageFiles.map(path => path.split('/').pop().replace('.jsx', ''));

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Project Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      ${globalStyles}
      .page { display: none; }
      .page.active { display: block; }
      .nav-link.active { color: #3b82f6; border-bottom: 2px solid #3b82f6; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="root">
        <!-- Header with Navigation -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="text-2xl font-bold text-gray-900">React App</div>
                    <nav class="space-x-6">
                        ${pages.map((page, index) => `
                            <a href="#" data-route="${page}" class="nav-link px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors ${index === 0 ? 'active' : ''}">
                                ${page}
                            </a>
                        `).join('')}
                    </nav>
                </div>
            </div>
        </header>

        <!-- Page Content -->
        <main>
            ${pages.map((page, index) => `
                <div class="page ${index === 0 ? 'active' : ''}" data-page="${page}">
                    ${generatePageContent(page, projectStructure)}
                </div>
            `).join('')}
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white mt-16">
            <div class="max-w-7xl mx-auto px-4 py-8">
                <div class="text-center">
                    <p>&copy; 2024 React Application. Built with modern components.</p>
                </div>
            </div>
        </footer>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const navLinks = document.querySelectorAll('[data-route]');
        const pages = document.querySelectorAll('[data-page]');

        navLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.target.getAttribute('data-route');

            // Update active nav link
            navLinks.forEach(nl => nl.classList.remove('active'));
            e.target.classList.add('active');

            // Show target page
            pages.forEach(page => {
              page.classList.remove('active');
              if (page.getAttribute('data-page') === targetPage) {
                page.classList.add('active');
              }
            });
          });
        });
      });
    </script>
</body>
</html>`;
  };

  const generatePageContent = (pageName, projectStructure) => {
    const pageFile = `src/pages/${pageName}.jsx`;
    const pageContent = projectStructure[pageFile] || '';

    // Generate different content based on page name
    if (pageName.toLowerCase() === 'home') {
      return `
        <div class="min-h-screen">
          <!-- Hero Section -->
          <section class="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
            <div class="max-w-7xl mx-auto px-4 text-center">
              <h1 class="text-5xl font-bold mb-6">Welcome to Our Platform</h1>
              <p class="text-xl mb-8 opacity-90">Build amazing experiences with our modern solutions</p>
              <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </div>
          </section>

          <!-- Features Section -->
          <section class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">Our Features</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center p-6">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-blue-600 text-2xl">⚡</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3">Fast Performance</h3>
                  <p class="text-gray-600">Lightning-fast loading and responsive design for all devices.</p>
                </div>
                <div class="text-center p-6">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-green-600 text-2xl">🔒</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3">Secure</h3>
                  <p class="text-gray-600">Enterprise-grade security to protect your data and privacy.</p>
                </div>
                <div class="text-center p-6">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-purple-600 text-2xl">🎨</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3">Beautiful Design</h3>
                  <p class="text-gray-600">Modern, clean interface designed for optimal user experience.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      `;
    } else if (pageName.toLowerCase() === 'about') {
      return `
        <div class="min-h-screen py-16">
          <div class="max-w-4xl mx-auto px-4">
            <h1 class="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
            <div class="prose prose-lg">
              <p class="text-xl text-gray-600 mb-6">We are a team of passionate developers and designers committed to creating exceptional digital experiences.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                  <h3 class="text-xl font-semibold mb-3">Our Mission</h3>
                  <p class="text-gray-600">To empower businesses and individuals with cutting-edge technology solutions that drive growth and innovation.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm">
                  <h3 class="text-xl font-semibold mb-3">Our Vision</h3>
                  <p class="text-gray-600">To be the leading provider of digital solutions that transform the way people work and live.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (pageName.toLowerCase() === 'contact') {
      return `
        <div class="min-h-screen py-16">
          <div class="max-w-4xl mx-auto px-4">
            <h1 class="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-xl font-semibold mb-4">Get in Touch</h3>
                <div class="space-y-4">
                  <div class="flex items-center">
                    <span class="text-gray-500 mr-3">📧</span>
                    <span>hello@example.com</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-500 mr-3">📞</span>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-500 mr-3">📍</span>
                    <span>123 Business St, City, State 12345</span>
                  </div>
                </div>
              </div>
              <div>
                <form class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Generic page content
      return `
        <div class="min-h-screen py-16">
          <div class="max-w-7xl mx-auto px-4">
            <h1 class="text-4xl font-bold text-gray-900 mb-8">${pageName}</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-xl font-semibold mb-3">Feature 1</h3>
                <p class="text-gray-600">This is a sample feature section for the ${pageName} page.</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-xl font-semibold mb-3">Feature 2</h3>
                <p class="text-gray-600">Another feature section with compelling content.</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-xl font-semibold mb-3">Feature 3</h3>
                <p class="text-gray-600">A third feature to complete the layout design.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300 overflow-hidden">
      {/* Project Sidebar */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        projects={projects}
        currentProject={currentProject}
        onProjectSelect={loadProject}
        onNewProject={() => setShowNewProjectModal(true)}
        onDeleteProject={deleteProject}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0 h-full overflow-hidden">
        {/* Network Status Notifications */}
        {(!isFirestoreAvailable || networkError) && (
          <div className={`border-b px-4 py-2 ${
            networkError
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className={`flex items-center gap-2 ${
              networkError
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              <AlertCircle size={16} />
              <span className="text-sm">
                {networkError
                  ? `Error: ${networkError}`
                  : 'Your projects are saved locally due to Firestore connectivity issues.'
                }
              </span>
              {networkError && (
                <button
                  onClick={() => {
                    setNetworkError(null);
                    setIsOfflineMode(false);
                  }}
                  className="ml-2 text-xs bg-red-200 dark:bg-red-800 px-2 py-1 rounded hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={16} />
              </div>
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {currentProject ? currentProject.name : 'AI UI Builder'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            {generatedCode && (
              <button
                onClick={handleDownloadProject}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-ai text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden md:inline">Download ZIP</span>
              </button>
            )}

            <ThemeToggle />

            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <User size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-32 truncate">
                {currentUser?.displayName || currentUser?.email}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div className="flex-1 flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 overflow-x-auto">
              <div className="flex space-x-3 sm:space-x-6 min-w-max">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                    activeTab === 'chat'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                    activeTab === 'history'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <History size={14} className="sm:w-4 sm:h-4" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                    activeTab === 'files'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Folder size={14} className="sm:w-4 sm:h-4" />
                  <span>Files</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                    activeTab === 'preview'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Eye size={14} className="sm:w-4 sm:h-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'history' && (
                <div className="h-full">
                  <ChatHistory
                    chatHistory={chatHistory}
                    currentProject={currentProject}
                    onMessageClick={(message) => {
                      // Switch to chat tab and scroll to message
                      setActiveTab('chat');
                    }}
                  />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
                    {chatHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                          <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="text-white" size={24} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Start a conversation
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Describe the website you want to create and I'll help you build it step by step.
                          </p>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            Try: "Create a portfolio website for a photographer"
                          </div>
                        </div>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                      ))
                    )}
                    
                    {isGenerating && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="text-white" size={16} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 flex-1">
                          {isChunkedGeneration && chunkingProgress ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Chunked Generation in Progress
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                  <span>Chunk {chunkingProgress.currentChunk} of {chunkingProgress.totalChunks}</span>
                                  <span>{Math.round((chunkingProgress.currentChunk / chunkingProgress.totalChunks) * 100)}%</span>
                                </div>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      chunkingProgress.status === 'error' ? 'bg-red-500' :
                                      chunkingProgress.status === 'completed' ? 'bg-green-500' :
                                      'bg-indigo-500'
                                    }`}
                                    style={{ width: `${(chunkingProgress.currentChunk / chunkingProgress.totalChunks) * 100}%` }}
                                  ></div>
                                </div>

                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {chunkingProgress.status === 'processing' && `🔄 Processing: ${chunkingProgress.chunkDescription}`}
                                  {chunkingProgress.status === 'completed' && `✅ Completed: ${chunkingProgress.chunkDescription}`}
                                  {chunkingProgress.status === 'error' && `❌ Error: ${chunkingProgress.error}`}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin text-indigo-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {isChunkedGeneration ? 'Analyzing project complexity...' : 'Generating your website...'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input - Fixed */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 bg-white dark:bg-gray-800">
                    <div className="flex gap-2 sm:gap-3">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={currentProject ? "Describe changes to your website..." : "Describe the website you want to create..."}
                        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100 max-h-32"
                        rows={window.innerWidth < 640 ? 2 : 3}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isGenerating}
                        className="px-3 sm:px-4 py-2 bg-gradient-ai text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[100px] self-end"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span className="hidden sm:inline text-xs sm:text-sm">Generating...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline text-xs sm:text-sm">Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="h-full bg-gray-100 dark:bg-gray-900 flex flex-col">
                  {generatedCode && (
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview Mode:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPreviewMode('desktop')}
                              className={`px-3 py-1 text-xs rounded ${
                                previewMode === 'desktop'
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              Desktop
                            </button>
                            <button
                              onClick={() => setPreviewMode('tablet')}
                              className={`px-3 py-1 text-xs rounded ${
                                previewMode === 'tablet'
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              Tablet
                            </button>
                            <button
                              onClick={() => setPreviewMode('mobile')}
                              className={`px-3 py-1 text-xs rounded ${
                                previewMode === 'mobile'
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              Mobile
                            </button>
                          </div>
                        </div>
                        {generatedCode?.projectStructure && (
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                            React Project
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-4">
                    {generatedCode ? (
                      <div className="h-full flex items-center justify-center">
                        <div
                          className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                            previewMode === 'desktop' ? 'w-full h-full' :
                            previewMode === 'tablet' ? 'w-3/4 h-5/6' :
                            'w-80 h-5/6'
                          }`}
                        >
                          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex items-center gap-2">
                            <div className="flex gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                              {currentProject?.name || 'Generated Website'}
                              <span className="ml-2 text-xs">({previewMode})</span>
                            </span>
                          </div>
                          <iframe
                            srcDoc={generatedCode.projectStructure ?
                              generateReactPreview(generatedCode.projectStructure) :
                              generatedCode.html
                            }
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                            title="Website Preview"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No preview available
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Generate a website to see the preview here.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="h-full flex">
                  {/* File Explorer */}
                  <div className="w-1/3 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Folder size={16} />
                        Project Files
                      </h3>
                      {generatedCode?.projectStructure ? (
                        <FileTree
                          projectStructure={generatedCode.projectStructure}
                          selectedFile={selectedFile}
                          onFileSelect={setSelectedFile}
                        />
                      ) : generatedCode ? (
                        <FileTree
                          projectStructure={{'index.html': generatedCode.html}}
                          selectedFile={selectedFile}
                          onFileSelect={setSelectedFile}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Generate a project to see files
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Content */}
                  <div className="flex-1 overflow-hidden">
                    {selectedFile ? (
                      <div className="h-full flex flex-col">
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
                          <Code size={16} className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFile}</span>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <pre className="p-4 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 h-full font-mono leading-relaxed">
                            <code>
                              {generatedCode?.projectStructure
                                ? generatedCode.projectStructure[selectedFile] || 'File content not available'
                                : selectedFile === 'index.html' && generatedCode?.html
                                  ? generatedCode.html
                                  : 'Select a file to view its content'
                              }
                            </code>
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Select a file
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Choose a file from the explorer to view its content
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Project
            </h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 bg-gradient-ai text-white py-2 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Create Project
              </button>
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspace;
