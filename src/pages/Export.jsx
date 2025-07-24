import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilder } from '../contexts/BuilderContext'
import { Copy, Download, ArrowLeft } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

function Export() {
  const { state } = useBuilder()
  const [copied, setCopied] = useState(false)

  const generateReactCode = () => {
    let imports = new Set(['import React from "react"'])
    let componentCode = ''

    const generateComponentJSX = (component) => {
      const { type, props, style, children } = component
      
      // Convert style object to className
      const classNames = []
      if (style.backgroundColor) classNames.push(`bg-${style.backgroundColor}`)
      if (style.textColor) classNames.push(`text-${style.textColor}`)
      if (style.padding) classNames.push(`p-${style.padding}`)
      if (style.margin) classNames.push(`m-${style.margin}`)
      if (style.borderRadius) classNames.push(`rounded-${style.borderRadius}`)
      
      const className = classNames.length > 0 ? ` className="${classNames.join(' ')}"` : ''
      
      switch (type) {
        case 'Button':
          return `<button${className}${props.onClick ? ' onClick={handleClick}' : ''}>${props.text || 'Button'}</button>`
        case 'Input':
          return `<input${className} type="${props.type || 'text'}" placeholder="${props.placeholder || ''}" />`
        case 'Card':
          return `<div${className}>${props.content || 'Card content'}</div>`
        case 'Image':
          return `<img${className} src="${props.src || '/placeholder.jpg'}" alt="${props.alt || 'Image'}" />`
        case 'Text':
          return `<p${className}>${props.text || 'Text content'}</p>`
        case 'Grid':
          return `<div${className}>${children?.map(child => generateComponentJSX(child)).join('') || ''}</div>`
        default:
          return `<div${className}>${props.text || type}</div>`
      }
    }

    const componentsJSX = state.components.map(generateComponentJSX).join('\n    ')

    componentCode = `${Array.from(imports).join('\n')}

function GeneratedComponent() {
  const handleClick = () => {
    console.log('Button clicked!')
  }

  return (
    <div className="p-4">
      ${componentsJSX}
    </div>
  )
}

export default GeneratedComponent`

    return componentCode
  }

  const code = generateReactCode()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GeneratedComponent.jsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative overflow-hidden transition-colors duration-500">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* Background Elements */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%216366f1\" fill-opacity=\"0.04\"%3E%3Ccircle cx=\"20\" cy=\"20\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60 dark:opacity-20"}></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link
              to="/editor"
              className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <ArrowLeft className="text-white" size={18} />
              </div>
              <span className="font-bold">Back to Editor</span>
            </Link>
            <h1 className="text-4xl font-bold text-gradient bg-gradient-ai bg-clip-text text-transparent">Export Code</h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-bold shadow-glow hover:shadow-glow-lg transform hover:scale-105"
            >
              <Copy size={18} />
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={downloadCode}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 font-bold shadow-glow hover:shadow-glow-lg transform hover:scale-105"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>

        {/* Component Info */}
        <div className="card-premium rounded-2xl p-8 mb-8 shadow-premium border border-white/30">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Component Details</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">{state.components.length}</span>
              </div>
              <div>
                <div className="font-bold text-gray-800">Components</div>
                <div className="text-sm text-gray-600">Generated elements</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Code className="text-white" size={18} />
              </div>
              <div>
                <div className="font-bold text-gray-800">React</div>
                <div className="text-sm text-gray-600">Framework</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xs">TW</span>
              </div>
              <div>
                <div className="font-bold text-gray-800">TailwindCSS</div>
                <div className="text-sm text-gray-600">Styling</div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Preview */}
        <div className="card-premium rounded-2xl shadow-premium overflow-hidden border border-white/30">
          <div className="bg-gradient-to-r from-gray-900 to-indigo-900 px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                <Code className="text-gray-900" size={16} />
              </div>
              <h2 className="text-xl font-bold text-white">Generated React Component</h2>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <pre className="p-8 text-sm overflow-x-auto bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-mono leading-relaxed">
              <code className="text-gray-100">{code}</code>
            </pre>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 glass-strong rounded-2xl p-8 border border-white/30 shadow-premium">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-glow">
              <ArrowRight className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">How to Use</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-ai rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
                <div>
                  <div className="font-bold text-gray-800">Copy the generated code</div>
                  <div className="text-sm text-gray-600">Use the copy button above</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-ai rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
                <div>
                  <div className="font-bold text-gray-800">Create a new file</div>
                  <div className="text-sm text-gray-600">e.g., <code className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">GeneratedComponent.jsx</code></div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-ai rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
                <div>
                  <div className="font-bold text-gray-800">Paste the code</div>
                  <div className="text-sm text-gray-600">Into your new React file</div>
                </div>
              </li>
            </ol>
            <ol className="space-y-4" start="4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-ai rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">4</div>
                <div>
                  <div className="font-bold text-gray-800">Install TailwindCSS</div>
                  <div className="text-sm text-gray-600">Make sure it's configured in your project</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-ai rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">5</div>
                <div>
                  <div className="font-bold text-gray-800">Import and use</div>
                  <div className="text-sm text-gray-600">Add the component to your application</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Export
