import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilder } from '../contexts/BuilderContext'
import { Home, Download, Save, Trash2, Sparkles, Upload } from 'lucide-react'

function Header() {
  const { state, setProjectName, clearComponents } = useBuilder()
  const [projectName, setLocalProjectName] = useState(state.project.name)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const handleProjectNameChange = (e) => {
    const name = e.target.value
    setLocalProjectName(name)
    setProjectName(name)
  }

  const handleSave = () => {
    const projectData = {
      project: state.project,
      components: state.components,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('ai-ui-builder-project', JSON.stringify(projectData))
    alert('Project saved to localStorage!')
  }

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('ai-ui-builder-project')
      if (saved) {
        const projectData = JSON.parse(saved)
        clearComponents()
        // Load components one by one to trigger proper state updates
        projectData.components.forEach((comp, index) => {
          setTimeout(() => {
            const event = new CustomEvent('load-component', { detail: comp })
            window.dispatchEvent(event)
          }, index * 50)
        })
        alert('Project loaded from localStorage!')
      } else {
        alert('No saved project found!')
      }
    } catch (error) {
      alert('Failed to load project!')
      console.error('Load error:', error)
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all components?')) {
      clearComponents()
    }
  }

  const handleAIGenerate = () => {
    // Mock AI functionality - in a real app, this would call an AI service
    if (!aiPrompt.trim()) return

    // Simple mock: parse common requests
    const prompt = aiPrompt.toLowerCase()
    
    if (prompt.includes('login') || prompt.includes('signin')) {
      // Generate a simple login form
      const mockComponents = [
        {
          type: 'Card',
          props: { content: 'Login Form' },
          style: { backgroundColor: 'white', padding: '6', borderRadius: 'lg' },
          position: { x: 50, y: 50 }
        },
        {
          type: 'Input',
          props: { type: 'email', placeholder: 'Enter your email' },
          style: { margin: '2' },
          position: { x: 60, y: 100 }
        },
        {
          type: 'Input',
          props: { type: 'password', placeholder: 'Enter your password' },
          style: { margin: '2' },
          position: { x: 60, y: 150 }
        },
        {
          type: 'Button',
          props: { text: 'Login' },
          style: { backgroundColor: 'blue-600', textColor: 'white', padding: '3' },
          position: { x: 60, y: 200 }
        }
      ]
      
      clearComponents()
      mockComponents.forEach(comp => {
        setTimeout(() => {
          const event = new CustomEvent('ai-add-component', { detail: comp })
          window.dispatchEvent(event)
        }, 100)
      })
    } else if (prompt.includes('navbar') || prompt.includes('header')) {
      const mockNavbar = {
        type: 'Grid',
        props: { content: 'Navigation Bar' },
        style: { backgroundColor: 'gray-800', padding: '4' },
        position: { x: 0, y: 0 }
      }
      
      clearComponents()
      setTimeout(() => {
        const event = new CustomEvent('ai-add-component', { detail: mockNavbar })
        window.dispatchEvent(event)
      }, 100)
    }

    setAiPrompt('')
    setShowAIPrompt(false)
    alert(`AI generated components for: "${aiPrompt}"`)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Home size={20} />
            <span className="font-semibold">AI UI Builder</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Project:</label>
            <input
              type="text"
              value={projectName}
              onChange={handleProjectNameChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              placeholder="Project name"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Prompt Button */}
          <div className="relative">
            <button
              onClick={() => setShowAIPrompt(!showAIPrompt)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
            >
              <Sparkles size={16} />
              AI Generate
            </button>
            
            {showAIPrompt && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <h3 className="font-semibold mb-2">AI Component Generator</h3>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to build... (e.g., 'Create a login form' or 'Build a navigation bar')"
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none h-20 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAIGenerate}
                    className="flex-1 bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700"
                  >
                    Generate
                  </button>
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={handleLoad}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
          >
            <Upload size={16} />
            Load
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <Link
            to="/export"
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
