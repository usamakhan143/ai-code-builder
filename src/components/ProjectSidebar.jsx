import React, { useState, useEffect } from 'react';
import {
  Folder,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Settings,
  Search,
  Trash2
} from 'lucide-react';

function ProjectSidebar({
  isOpen,
  onToggle,
  projects,
  currentProject,
  onProjectSelect,
  onNewProject,
  onDeleteProject
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleDeleteProject = async (projectId) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    const projectName = projectToDelete?.name || 'this project';

    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      try {
        await onDeleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed lg:relative z-40 h-full ${
        isOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full lg:w-0 lg:translate-x-0'
      }`}>
        {isOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Projects
                </h2>
                <button
                  onClick={onNewProject}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="p-4 text-center">
                  {searchQuery ? (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No projects found for "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        No projects yet
                      </p>
                      <button
                        onClick={onNewProject}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Create your first project
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`relative rounded-lg mb-2 transition-all duration-200 group ${
                        currentProject?.id === project.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => onProjectSelect(project.id)}
                        className="w-full text-left p-3 pr-8"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm truncate ${
                            currentProject?.id === project.id
                              ? 'text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {project.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(project.updatedAt)}
                              </span>
                            </div>
                            {project.chatHistory && project.chatHistory.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {project.chatHistory.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {currentProject?.id === project.id && (
                          <div className="absolute top-3 right-8">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          </div>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                        title="Delete project"
                      >
                        <Trash2 size={14} className="text-red-500 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Settings size={16} />
                Settings
              </button>
            </div>


          </>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 transform -translate-y-1/2 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${
          isOpen ? 'left-80 lg:left-80' : 'left-0'
        }`}
      >
        {isOpen ? (
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </>
  );
}

export default ProjectSidebar;
