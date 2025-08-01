import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
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

      // TODO: AI generation will be implemented here
      // For now, just add a placeholder response
      setTimeout(async () => {
        await addChatMessage({
          type: 'assistant',
          content: `🚧 **AI Generation Coming Soon!**

Your request: "${userMessage}"

The AI functionality has been removed and will be reimplemented with new features. Stay tuned!`,
          sender: 'AI Assistant',
          isPlaceholder: true
        });
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      await addChatMessage({
        type: 'assistant',
        content: `❌ **Error:** ${error.message}`,
        sender: 'AI Assistant',
        isError: true
      });
      setIsGenerating(false);
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

  // Mock data for demonstration
  const mockProjectFiles = {
    'src/App.js': `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Sample Project
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <p className="text-gray-600">
          This is a sample project structure. 
          AI generation coming soon!
        </p>
      </main>
    </div>
  );
}

export default App;`,
    'package.json': `{
  "name": "sample-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
    'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sample Project</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
  };

  const generateBasicHTMLPreview = () => {
    return `
      <html>
        <head>
          <title>Preview Coming Soon</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              background: #f5f5f5; 
              margin: 0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚧 Preview Coming Soon</h1>
            <p>The AI website generation functionality is being rebuilt.</p>
            <p>Soon you'll be able to generate and preview websites here!</p>
          </div>
        </body>
      </html>
    `;
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
              <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-md">
                Static Mode
              </div>
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
                            The AI functionality is being rebuilt. Soon you'll be able to generate websites by describing what you want to create.
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
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Processing your request...
                            </span>
                          </div>
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
                    </div>
                  </div>

                  <div className="flex-1 p-4">
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
                          srcDoc={generateBasicHTMLPreview()}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin"
                          title="Website Preview"
                        />
                      </div>
                    </div>
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
                      <FileTree
                        projectStructure={mockProjectFiles}
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                      />
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
                              {mockProjectFiles[selectedFile] || 'File content not available'}
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
