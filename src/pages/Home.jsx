import { Link } from 'react-router-dom'
import { Sparkles, Code, Zap, ArrowRight, MessageSquare, Eye, Download } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative overflow-hidden transition-colors duration-500">
      {/* Background Elements */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%234f46e5\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 dark:opacity-20"}></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        {/* Header */}
        <header className="text-center mb-12 sm:mb-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-ai rounded-2xl blur-lg opacity-50 animate-glow"></div>
              <div className="relative p-3 sm:p-4 bg-gradient-ai rounded-2xl shadow-glow">
                <Sparkles className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient bg-gradient-ai bg-clip-text text-transparent text-center">
              AI UI Builder
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium mb-6 sm:mb-8 px-4">
            Transform your ideas into beautiful React components using AI.
            Simply describe what you want to build, and watch as our AI creates production-ready code instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl py-4 px-6 sm:px-8 border border-white/30 dark:border-gray-700/30 shadow-glass mx-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Powered by AI</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="font-medium">Instant Generation</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <span className="font-medium">Production Ready</span>
            </div>
          </div>
        </header>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20 relative z-10 px-4">
          <div className="card-premium rounded-2xl p-6 sm:p-8 shadow-premium glow-on-hover group bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-glow">
                <MessageSquare className="text-white" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">Natural Language Input</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Describe your UI in plain English. "Create a login form", "Build a navigation bar", or "Design a hero section" - it's that simple.
            </p>
          </div>

          <div className="card-premium rounded-2xl p-6 sm:p-8 shadow-premium glow-on-hover group bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-glow">
                <Eye className="text-white" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Live Preview</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              See your components come to life instantly with real-time preview. Every element is positioned and styled automatically.
            </p>
          </div>

          <div className="card-premium rounded-2xl p-6 sm:p-8 shadow-premium glow-on-hover group bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-glow">
                <Code className="text-white" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">Clean Code Export</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Export production-ready React components with TailwindCSS. Copy, download, and integrate directly into your projects.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12 sm:mb-20 relative z-10 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-ai rounded-2xl blur-lg opacity-50 animate-glow"></div>
              <Link
                to="/signup"
                className="relative btn-primary inline-flex items-center gap-3 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-bold shadow-premium hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles size={24} className="animate-pulse" />
                <span className="hidden sm:inline">Start Building with AI</span>
                <span className="sm:hidden">Start Building</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="text-gray-600 dark:text-gray-400 font-medium">or</div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-6 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 font-medium"
            >
              Sign In
              <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">
            No setup required • Create your account and start building
          </p>
        </div>

        {/* Demo Preview */}
        <div className="max-w-6xl mx-auto relative z-10 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-gray-100">
            How It Works
          </h2>

          <div className="card-premium rounded-3xl shadow-premium overflow-hidden border border-white/30 dark:border-gray-700/30 bg-white/70 dark:bg-gray-800/70">
            <div className="bg-gradient-ai p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative">
                <h3 className="text-white text-2xl font-bold mb-2">AI UI Builder Interface</h3>
                <p className="text-white/80 text-lg font-medium">Describe → Generate → Export</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-0 min-h-[400px] md:h-[400px]">
              {/* Mock AI Prompt Panel */}
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50/50 p-4 md:p-8 border-r md:border-r border-b md:border-b-0 border-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white" size={16} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">AI Generator</h4>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What would you like to build?
                  </label>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 h-28 text-sm text-gray-700 shadow-sm font-medium leading-relaxed">
                    Create a modern login form with email and password fields, and a sign in button
                  </div>
                </div>
                
                <button className="w-full bg-gradient-ai text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
                  <Zap size={18} />
                  Generate with AI
                </button>
                
                <div className="mt-8">
                  <h5 className="text-sm font-bold text-gray-700 mb-3">Try these examples:</h5>
                  <div className="space-y-2">
                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-700 border border-white/50 hover:bg-white/90 transition-all cursor-pointer">
                      Build a responsive navigation bar
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-700 border border-white/50 hover:bg-white/90 transition-all cursor-pointer">
                      Design a hero section for landing page
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-700 border border-white/50 hover:bg-white/90 transition-all cursor-pointer">
                      Create a contact form with validation
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mock Preview Panel */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 p-4 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Eye className="text-white" size={16} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Live Preview</h4>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50/50 rounded-xl p-4 md:p-6 h-48 md:h-72 flex items-center justify-center">
                  <div className="card-premium rounded-xl shadow-premium p-4 md:p-8 w-full max-w-sm transform hover:scale-105 transition-all duration-300">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 text-gradient">Welcome Back</h3>
                    <div className="space-y-4">
                      <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200 shadow-sm"></div>
                      <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200 shadow-sm"></div>
                      <div className="h-12 bg-gradient-ai rounded-lg text-white flex items-center justify-center text-sm font-bold shadow-glow">
                        Sign In
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-indigo-50/30 border-t border-gray-200/50 p-4 md:p-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-medium">AI Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Download size={16} className="text-blue-500" />
                <span className="font-medium">Export Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Code size={16} className="text-violet-500" />
                <span className="font-medium">React + TailwindCSS</span>
              </div>
            </div>
          </div>
        </div>



        {/* Benefits */}
        <div className="mt-24 text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-16">
            Why Choose AI UI Builder?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <Zap className="text-white" size={28} />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">Generate components in seconds, not hours</p>
            </div>
            
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <Code className="text-white" size={28} />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Production Ready</h3>
              <p className="text-gray-600 leading-relaxed">Clean, optimized code ready for deployment</p>
            </div>
            
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <Sparkles className="text-white" size={28} />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">AI Powered</h3>
              <p className="text-gray-600 leading-relaxed">Smart generation based on best practices</p>
            </div>
            
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <ArrowRight className="text-white" size={28} />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Easy Export</h3>
              <p className="text-gray-600 leading-relaxed">One-click export to your project</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
