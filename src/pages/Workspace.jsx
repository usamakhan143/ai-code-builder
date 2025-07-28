import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { generateWebsiteCode } from '../services/openai';
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


  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      
      // Add user message to chat
      await addChatMessage({
        type: 'user',
        content: message,
        sender: currentUser.displayName || currentUser.email
      });

      const userMessage = message;
      setMessage('');

      // Generate AI response
      const result = await generateWebsiteCode(userMessage);

      if (result.success) {
        // Clear any previous errors
        setIsOfflineMode(false);
        setNetworkError(null);

        // Add AI response to chat
        await addChatMessage({
          type: 'assistant',
          content: `I've generated a website based on your request: "${userMessage}". Here's what I created:`,
          generatedCode: result.data,
          sender: 'AI Assistant'
        });

        // Add to project versions
        await addProjectVersion({
          prompt: userMessage,
          code: result.data,
          changes: [{
            type: 'created',
            file: 'index.html',
            description: 'Generated main HTML file'
          }]
        });

        setGeneratedCode(result.data);
      } else {
        setNetworkError(result.error);
        await addChatMessage({
          type: 'assistant',
          content: `I apologize, but I encountered an error while generating the website: ${result.error}`,
          sender: 'AI Assistant',
          isError: true
        });
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
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={16} />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
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
        <div className="flex-1 flex">
          {/* Chat Panel */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto">
              <div className="flex space-x-6 min-w-max">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'chat'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <MessageSquare size={16} className="inline mr-2" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'preview'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Eye size={16} className="inline mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'files'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <FileText size={16} className="inline mr-2" />
                  <span className="hidden sm:inline">Files</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Generating your website...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={currentProject ? "Describe changes to your website..." : "Describe the website you want to create..."}
                        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100"
                        rows={2}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isGenerating}
                        className="px-4 py-2 bg-gradient-ai text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 min-w-[100px]"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span className="hidden sm:inline">Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="h-full bg-gray-100 dark:bg-gray-900">
                  {generatedCode ? (
                    <div className="h-full p-4">
                      <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex items-center gap-2">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                            {currentProject?.name || 'Generated Website'}
                          </span>
                        </div>
                        <iframe
                          srcDoc={generatedCode.html}
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
              )}

              {activeTab === 'files' && (
                <div className="h-full">
                  <FileChanges generatedCode={generatedCode} />
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
