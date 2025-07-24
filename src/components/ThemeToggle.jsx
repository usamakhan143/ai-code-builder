import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all duration-300 group shadow-glow hover:shadow-glow-lg transform hover:scale-105"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-ai opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="relative flex items-center justify-center w-full h-full">
        {isDark ? (
          <Sun 
            size={20} 
            className="text-yellow-400 transform transition-transform duration-300 group-hover:rotate-12" 
          />
        ) : (
          <Moon 
            size={20} 
            className="text-indigo-600 dark:text-indigo-400 transform transition-transform duration-300 group-hover:-rotate-12" 
          />
        )}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
    </button>
  )
}

export default ThemeToggle
