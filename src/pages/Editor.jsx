import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilder } from '../contexts/BuilderContext'
import {
  Sparkles,
  Download,
  Save,
  Upload,
  Home,
  Wand2,
  Code,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Preview from '../components/Preview'
import ThemeToggle from '../components/ThemeToggle'
import { generateWebsiteCode } from '../services/openai'
import { downloadProjectAsZip } from '../services/zipDownload'

function Editor() {
  const { state, addComponent, clearComponents, setProjectName } = useBuilder()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [projectName, setLocalProjectName] = useState(state.project.name)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [error, setError] = useState(null)

  const handleProjectNameChange = (e) => {
    const name = e.target.value
    setLocalProjectName(name)
    setProjectName(name)
  }

  const generateFromPrompt = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    clearComponents()
    setGeneratedCode(null)

    try {
      const result = await generateWebsiteCode(prompt)

      if (result.success) {
        setGeneratedCode(result.data)
        // Create a single component representing the generated website
        const websiteComponent = {
          type: 'Website',
          props: {
            html: result.data.html,
            description: result.data.description
          },
          style: {},
          position: { x: 0, y: 0 }
        }

        addComponent(websiteComponent)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error generating code:', err)
      setError('Failed to generate website. Please check your OpenAI API key and try again.')
    }

    setIsGenerating(false)
  }

  const handleSave = () => {
    const projectData = {
      project: state.project,
      components: state.components,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('ai-ui-builder-project', JSON.stringify(projectData))
    alert('Project saved!')
  }

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('ai-ui-builder-project')
      if (saved) {
        const projectData = JSON.parse(saved)
        clearComponents()
        projectData.components.forEach((comp, index) => {
          setTimeout(() => addComponent(comp), index * 50)
        })
        alert('Project loaded!')
      } else {
        alert('No saved project found!')
      }
    } catch (error) {
      alert('Failed to load project!')
    }
  }

  const handleDownloadZip = async () => {
    if (!generatedCode) {
      alert('No generated code to download. Please generate a website first.')
      return
    }

    const result = await downloadProjectAsZip(generatedCode, projectName || 'ai-generated-website')
    if (!result.success) {
      alert('Failed to create ZIP file: ' + result.error)
    }
  }

  const promptSuggestions = [
    "Create a portfolio website for a photographer",
    "Build a landing page for a startup offering a mobile app",
    "Design a restaurant website with menu and contact info",
    "Make a personal blog website with modern design",
    "Create a product showcase page for an e-commerce store",
    "Build a corporate website for a consulting firm",
    "Design a creative agency website with portfolio gallery"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative overflow-hidden transition-colors duration-500">
      {/* Background Elements */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%236366f1\" fill-opacity=\"0.04\"%3E%3Ccircle cx=\"20\" cy=\"20\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60 dark:opacity-20"}></div>
      {/* Header */}
      <header className="glass-strong border-b border-white/30 dark:border-gray-700/30 px-4 sm:px-8 py-4 sm:py-5 relative z-10">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 xl:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full xl:w-auto">
            <Link to="/" className="flex items-center gap-3 text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors group">
              <div className="w-10 h-10 bg-gradient-ai rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <Home className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg">AI UI Builder</span>
            </Link>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project:</label>
              <input
                type="text"
                value={projectName}
                onChange={handleProjectNameChange}
                className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-400 focus:bg-white/80 dark:focus:bg-gray-700/80 transition-all duration-300 shadow-sm text-gray-800 dark:text-gray-200"
                placeholder="Project name"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-sm font-medium shadow-glow hover:shadow-glow-lg transform hover:scale-105"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={handleLoad}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm font-medium shadow-glow hover:shadow-glow-lg transform hover:scale-105"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Load</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={!generatedCode}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-ai text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 text-sm font-medium transform hover:scale-105 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>

            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)] relative z-10">
        {/* AI Prompt Panel */}
        <div className="w-full lg:w-80 xl:w-96 glass-strong border-r lg:border-r border-b lg:border-b-0 border-white/30 dark:border-gray-700/30 flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 border-b border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-glow">
                <Wand2 className="text-white" size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">AI Generator</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              Describe what you want to build and AI will generate it for you.
            </p>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                What would you like to build?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a modern login form with email and password fields..."
                className="w-full h-28 sm:h-36 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-xl resize-none focus:outline-none focus:border-violet-400 focus:bg-white/80 dark:focus:bg-gray-700/80 transition-all duration-300 shadow-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <button
              onClick={generateFromPrompt}
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-ai text-white py-3 sm:py-4 rounded-xl hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-glow transform hover:scale-105"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-base sm:text-lg">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-base sm:text-lg">Generate Website</span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {generatedCode && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">✓ Website generated successfully!</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">{generatedCode.description}</p>
              </div>
            )}

            <div className="mt-6 sm:mt-10">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Try these examples:</h3>
              <div className="space-y-2 sm:space-y-3">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full text-left p-3 sm:p-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-600/60 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-all duration-300 border border-white/30 dark:border-gray-600/30 hover:border-white/50 dark:hover:border-gray-500/50 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col">
          <div className="glass border-b border-white/20 dark:border-gray-700/20 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Eye className="text-white" size={16} />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {generatedCode ? 'Website Preview' : `Preview - ${state.components.length} component${state.components.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            {state.components.length > 0 && (
              <button
                onClick={clearComponents}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 bg-gradient-to-br from-white/30 to-blue-50/30 dark:from-gray-800/30 dark:to-indigo-900/30 backdrop-blur-sm">
            <Preview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor
