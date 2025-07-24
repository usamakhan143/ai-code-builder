import { createContext, useContext, useReducer } from 'react'

const BuilderContext = createContext()

const initialState = {
  project: {
    name: 'Untitled Project',
    pages: [{ id: 'page-1', name: 'Homepage', components: [] }]
  },
  currentPage: 'page-1',
  selectedComponent: null,
  components: [],
  isDragging: false
}

function builderReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECT_NAME':
      return {
        ...state,
        project: { ...state.project, name: action.payload }
      }
    
    case 'ADD_COMPONENT':
      const newComponent = {
        id: `component-${Date.now()}`,
        type: action.payload.type,
        props: action.payload.props || {},
        style: action.payload.style || {},
        children: action.payload.children || [],
        position: action.payload.position || { x: 0, y: 0 }
      }
      return {
        ...state,
        components: [...state.components, newComponent]
      }
    
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        components: state.components.map(comp =>
          comp.id === action.payload.id
            ? { ...comp, ...action.payload.updates }
            : comp
        )
      }
    
    case 'DELETE_COMPONENT':
      return {
        ...state,
        components: state.components.filter(comp => comp.id !== action.payload),
        selectedComponent: state.selectedComponent === action.payload ? null : state.selectedComponent
      }
    
    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponent: action.payload
      }
    
    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.payload
      }
    
    case 'CLEAR_COMPONENTS':
      return {
        ...state,
        components: [],
        selectedComponent: null
      }
    
    case 'LOAD_PROJECT':
      return {
        ...state,
        ...action.payload
      }
    
    default:
      return state
  }
}

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(builderReducer, initialState)

  const value = {
    state,
    dispatch,
    // Helper functions
    addComponent: (component) => dispatch({ type: 'ADD_COMPONENT', payload: component }),
    updateComponent: (id, updates) => dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } }),
    deleteComponent: (id) => dispatch({ type: 'DELETE_COMPONENT', payload: id }),
    selectComponent: (id) => dispatch({ type: 'SELECT_COMPONENT', payload: id }),
    setProjectName: (name) => dispatch({ type: 'SET_PROJECT_NAME', payload: name }),
    setDragging: (isDragging) => dispatch({ type: 'SET_DRAGGING', payload: isDragging }),
    clearComponents: () => dispatch({ type: 'CLEAR_COMPONENTS' }),
    loadProject: (project) => dispatch({ type: 'LOAD_PROJECT', payload: project })
  }

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }
  return context
}
