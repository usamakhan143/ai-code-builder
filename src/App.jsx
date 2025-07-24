import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BuilderProvider } from './contexts/BuilderContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Export from './pages/Export'

function App() {
  return (
    <ThemeProvider>
      <BuilderProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/export" element={<Export />} />
            </Routes>
          </div>
        </Router>
      </BuilderProvider>
    </ThemeProvider>
  )
}

export default App
