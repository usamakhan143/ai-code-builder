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
      await setDoc(doc(db, 'projects', projectId), project);
      setCurrentProject(project);
      setChatHistory([]);
      setProjectVersions([]);
      await loadUserProjects();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Load user's projects
  const loadUserProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load a specific project
  const loadProject = async (projectId) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const project = { id: docSnap.id, ...docSnap.data() };
        setCurrentProject(project);
        setChatHistory(project.chatHistory || []);
        setProjectVersions(project.versions || []);
        return project;
      }
    } catch (error) {
      console.error('Error loading project:', error);
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
      await updateDoc(doc(db, 'projects', currentProject.id), {
        chatHistory: updatedHistory,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating chat history:', error);
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
      await updateDoc(doc(db, 'projects', currentProject.id), {
        versions: updatedVersions,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project versions:', error);
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
      await updateDoc(doc(db, 'projects', currentProject.id), updatedProject);
      await loadUserProjects(); // Refresh projects list
    } catch (error) {
      console.error('Error updating project:', error);
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
