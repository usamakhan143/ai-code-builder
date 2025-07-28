import { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase-clean';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [projectVersions, setProjectVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState(null);

  // Check if Firestore is available
  const isFirestoreAvailable = () => {
    return !firestoreError;
  };

  // Create a new project
  const createProject = async (name, description = '') => {
    if (!currentUser) return null;

    const projectId = uuidv4();
    const project = {
      id: projectId,
      name,
      description,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chatHistory: [],
      versions: []
    };

    try {
      if (isFirestoreAvailable()) {
        await setDoc(doc(db, 'projects', projectId), project);
      } else {
        // Fallback to localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        localProjects.push(project);
        localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
      }

      setCurrentProject(project);
      setChatHistory([]);
      setProjectVersions([]);
      await loadUserProjects();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        localProjects.push(project);
        localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));

        setCurrentProject(project);
        setChatHistory([]);
        setProjectVersions([]);
        await loadUserProjects();
        return project;
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
        throw error;
      }
    }
  };

  // Load user's projects
  const loadUserProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      if (isFirestoreAvailable()) {
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', currentUser.uid),
          orderBy('updatedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userProjects = [];
        querySnapshot.forEach((doc) => {
          userProjects.push({ id: doc.id, ...doc.data() });
        });
        setProjects(userProjects);
      } else {
        // Fallback to localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const userProjects = localProjects.filter(project => project.userId === currentUser.uid);
        setProjects(userProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const userProjects = localProjects.filter(project => project.userId === currentUser.uid);
        setProjects(userProjects);
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load a specific project
  const loadProject = async (projectId) => {
    if (!currentUser) return;

    try {
      setLoading(true);

      if (isFirestoreAvailable()) {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const project = { id: docSnap.id, ...docSnap.data() };
          setCurrentProject(project);
          setChatHistory(project.chatHistory || []);
          setProjectVersions(project.versions || []);
          return project;
        }
      } else {
        // Fallback to localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const project = localProjects.find(p => p.id === projectId && p.userId === currentUser.uid);

        if (project) {
          setCurrentProject(project);
          setChatHistory(project.chatHistory || []);
          setProjectVersions(project.versions || []);
          return project;
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const project = localProjects.find(p => p.id === projectId && p.userId === currentUser.uid);

        if (project) {
          setCurrentProject(project);
          setChatHistory(project.chatHistory || []);
          setProjectVersions(project.versions || []);
          return project;
        }
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add message to chat history
  const addChatMessage = async (message) => {
    if (!currentProject) return;

    const newMessage = {
      id: uuidv4(),
      ...message,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);

    try {
      if (isFirestoreAvailable()) {
        await updateDoc(doc(db, 'projects', currentProject.id), {
          chatHistory: updatedHistory,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const projectIndex = localProjects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          localProjects[projectIndex].chatHistory = updatedHistory;
          localProjects[projectIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
        }
      }
    } catch (error) {
      console.error('Error updating chat history:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const projectIndex = localProjects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          localProjects[projectIndex].chatHistory = updatedHistory;
          localProjects[projectIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
        }
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
      }
    }

    return newMessage;
  };

  // Add project version
  const addProjectVersion = async (version) => {
    if (!currentProject) return;

    const newVersion = {
      id: uuidv4(),
      ...version,
      timestamp: new Date().toISOString()
    };

    const updatedVersions = [...projectVersions, newVersion];
    setProjectVersions(updatedVersions);

    try {
      if (isFirestoreAvailable()) {
        await updateDoc(doc(db, 'projects', currentProject.id), {
          versions: updatedVersions,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const projectIndex = localProjects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          localProjects[projectIndex].versions = updatedVersions;
          localProjects[projectIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
        }
      }
    } catch (error) {
      console.error('Error updating project versions:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const projectIndex = localProjects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          localProjects[projectIndex].versions = updatedVersions;
          localProjects[projectIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
        }
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
      }
    }

    return newVersion;
  };

  // Update project metadata
  const updateProject = async (updates) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setCurrentProject(updatedProject);

    try {
      if (isFirestoreAvailable()) {
        await updateDoc(doc(db, 'projects', currentProject.id), updatedProject);
      } else {
        // Update localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const projectIndex = localProjects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          localProjects[projectIndex] = updatedProject;
          localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
        }
      }
      await loadUserProjects(); // Refresh projects list
    } catch (error) {
      console.error('Error updating project:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const projectIndex = localProjects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          localProjects[projectIndex] = updatedProject;
          localStorage.setItem('ai-builder-projects', JSON.stringify(localProjects));
        }
        await loadUserProjects(); // Refresh projects list
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
      }
    }
  };

  // Load projects when user changes
  useEffect(() => {
    if (currentUser) {
      loadUserProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setChatHistory([]);
      setProjectVersions([]);
    }
  }, [currentUser]);

  const value = {
    currentProject,
    projects,
    chatHistory,
    projectVersions,
    loading,
    firestoreError,
    isFirestoreAvailable: isFirestoreAvailable(),
    createProject,
    loadProject,
    addChatMessage,
    addProjectVersion,
    updateProject,
    loadUserProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
