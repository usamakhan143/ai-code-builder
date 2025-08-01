import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { BuilderProvider } from './contexts/BuilderContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Workspace from './pages/Workspace'
import Editor from './pages/Editor'
import Export from './pages/Export'


// Protected Route component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Public Route component (redirects to workspace if already logged in)
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/workspace" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/signup" element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } />
                <Route path="/workspace" element={
                  <ProtectedRoute>
                    <Workspace />
                  </ProtectedRoute>
                } />
                <Route path="/editor" element={
                  <ProtectedRoute>
                    <BuilderProvider>
                      <Editor />
                    </BuilderProvider>
                  </ProtectedRoute>
                } />
                <Route path="/export" element={
                  <ProtectedRoute>
                    <Export />
                  </ProtectedRoute>
                } />

              </Routes>
            </div>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
