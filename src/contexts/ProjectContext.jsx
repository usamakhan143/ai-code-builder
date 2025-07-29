import { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase-clean';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Utility function to remove undefined values from objects for Firebase
const cleanDataForFirebase = (obj) => {
  if (obj === null || obj === undefined) return null;

  if (Array.isArray(obj)) {
    return obj.map(item => cleanDataForFirebase(item)).filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = cleanDataForFirebase(value);
      }
    });
    return cleaned;
  }

  return obj;
};

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
        // Clean project data for Firebase
        const cleanProject = cleanDataForFirebase(project);
        await setDoc(doc(db, 'projects', projectId), cleanProject);
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

    // Debug: Check for undefined values
    const undefinedKeys = Object.keys(message).filter(key => message[key] === undefined);
    if (undefinedKeys.length > 0) {
      console.warn('Found undefined values in message:', undefinedKeys, message);
    }

    // Clean the message object to remove undefined values
    const cleanMessage = cleanDataForFirebase(message);

    const newMessage = {
      id: uuidv4(),
      ...cleanMessage,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);

    try {
      if (isFirestoreAvailable()) {
        // Clean the entire history array for Firebase
        const cleanedHistory = cleanDataForFirebase(updatedHistory);

        await updateDoc(doc(db, 'projects', currentProject.id), {
          chatHistory: cleanedHistory,
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

    // Debug: Check for undefined values
    const undefinedKeys = Object.keys(version).filter(key => version[key] === undefined);
    if (undefinedKeys.length > 0) {
      console.warn('Found undefined values in version:', undefinedKeys, version);
    }

    // Clean the version object to remove undefined values
    const cleanVersion = cleanDataForFirebase(version);

    const newVersion = {
      id: uuidv4(),
      ...cleanVersion,
      timestamp: new Date().toISOString()
    };

    const updatedVersions = [...projectVersions, newVersion];
    setProjectVersions(updatedVersions);

    try {
      if (isFirestoreAvailable()) {
        // Clean the entire versions array for Firebase
        const cleanedVersions = cleanDataForFirebase(updatedVersions);

        await updateDoc(doc(db, 'projects', currentProject.id), {
          versions: cleanedVersions,
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
        // Clean the updated project data for Firebase
        const cleanUpdatedProject = cleanDataForFirebase(updatedProject);
        await updateDoc(doc(db, 'projects', currentProject.id), cleanUpdatedProject);
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

  // Delete project
  const deleteProject = async (projectId) => {
    if (!currentUser || !projectId) return;

    try {
      if (isFirestoreAvailable()) {
        await deleteDoc(doc(db, 'projects', projectId));
      } else {
        // Remove from localStorage
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const filteredProjects = localProjects.filter(p => p.id !== projectId);
        localStorage.setItem('ai-builder-projects', JSON.stringify(filteredProjects));
      }

      // If deleted project was current, clear it
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        setChatHistory([]);
        setProjectVersions([]);
      }

      await loadUserProjects(); // Refresh projects list
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      setFirestoreError(error);

      // Try localStorage fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ai-builder-projects') || '[]');
        const filteredProjects = localProjects.filter(p => p.id !== projectId);
        localStorage.setItem('ai-builder-projects', JSON.stringify(filteredProjects));

        // If deleted project was current, clear it
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
          setChatHistory([]);
          setProjectVersions([]);
        }

        await loadUserProjects(); // Refresh projects list
        return true;
      } catch (localError) {
        console.error('LocalStorage fallback failed:', localError);
        throw error;
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
    deleteProject,
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
