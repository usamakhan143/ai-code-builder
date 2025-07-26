import { useBuilder } from '../contexts/BuilderContext'
import PreviewComponent from './PreviewComponent'

function Preview() {
  const { state } = useBuilder()

  if (state.components.length === 0) {
    return (
      <div className="h-full flex items-center justify-center relative">
        <div className="text-center max-w-lg relative z-10">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-ai rounded-full blur-2xl opacity-30 animate-glow"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-white/60 to-indigo-100/60 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 shadow-premium">
              <div className="text-6xl animate-float">🤖</div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Ready to Generate
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-8">
            Describe the website you want to create and AI will generate the complete HTML, CSS, and JavaScript for you!
          </p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-glass">
            <p className="text-sm font-bold text-gray-700 mb-3">Try these examples:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-full text-xs font-medium">portfolio website</span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-medium">landing page</span>
              <span className="px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full text-xs font-medium">restaurant site</span>
            </div>
          </div>
        </div>
        {/* Floating background elements */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-indigo-200/40 to-violet-200/40 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
    )
  }

  // Check if we have a Website component for special rendering
  const hasWebsiteComponent = state.components.some(c => c.type === 'Website')

  return (
    <div className="h-full overflow-auto">
      {hasWebsiteComponent ? (
        // Full-screen rendering for Website components
        <div className="h-full bg-gray-100 dark:bg-gray-900">
          {state.components.map((component) => (
            <PreviewComponent
              key={component.id}
              component={component}
            />
          ))}
        </div>
      ) : (
        // Original component-based rendering
        <div className="relative min-h-full bg-gradient-to-br from-white/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-indigo-900/50 p-8">
          {/* Enhanced grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle, #6366f1 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Generated Components */}
          <div className="relative">
            {state.components.map((component) => (
              <PreviewComponent
                key={component.id}
                component={component}
              />
            ))}
          </div>

          {/* Enhanced overlay for component info */}
          <div className="absolute top-6 right-6 glass-strong rounded-xl shadow-premium border border-white/30 dark:border-gray-700/30 p-4 backdrop-blur-lg">
            <div className="text-sm">
              <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">Generated Components</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">{state.components.length} total</div>
              <div className="mt-2 w-6 h-1 bg-gradient-ai rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Preview
