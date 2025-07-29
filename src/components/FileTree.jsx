import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText,
  File,
  Code,
  Image,
  Settings
} from 'lucide-react';

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <Code size={14} className="text-yellow-500" />;
    case 'css':
    case 'scss':
    case 'sass':
      return <File size={14} className="text-blue-500" />;
    case 'html':
      return <File size={14} className="text-orange-500" />;
    case 'json':
      return <Settings size={14} className="text-green-500" />;
    case 'md':
      return <FileText size={14} className="text-gray-600 dark:text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <Image size={14} className="text-purple-500" />;
    default:
      return <File size={14} className="text-gray-500" />;
  }
};

const FileItem = ({ fileName, filePath, isSelected, onClick, depth = 0 }) => {
  return (
    <div
      onClick={() => onClick(filePath)}
      className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300'
      }`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      {getFileIcon(fileName)}
      <span className="truncate text-xs">{fileName}</span>
    </div>
  );
};

const FolderItem = ({ folderName, children, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors text-gray-700 dark:text-gray-300"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {isExpanded ? (
          <ChevronDown size={12} className="text-gray-400" />
        ) : (
          <ChevronRight size={12} className="text-gray-400" />
        )}
        {isExpanded ? (
          <FolderOpen size={14} className="text-blue-500" />
        ) : (
          <Folder size={14} className="text-blue-500" />
        )}
        <span className="font-medium text-xs">{folderName}</span>
      </div>
      {isExpanded && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

function FileTree({ projectStructure, selectedFile, onFileSelect }) {
  if (!projectStructure || Object.keys(projectStructure).length === 0) {
    return (
      <div className="p-4 text-center">
        <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No files generated yet
        </p>
      </div>
    );
  }

  // Build file tree structure
  const buildFileTree = (files) => {
    const tree = {};
    
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          // It's a file
          current[part] = {
            type: 'file',
            path: filePath
          };
        } else {
          // It's a folder
          if (!current[part]) {
            current[part] = {
              type: 'folder',
              children: {}
            };
          }
          current = current[part].children;
        }
      }
    });
    
    return tree;
  };

  const renderTreeItem = (name, item, depth = 0) => {
    if (item.type === 'file') {
      return (
        <FileItem
          key={item.path}
          fileName={name}
          filePath={item.path}
          isSelected={selectedFile === item.path}
          onClick={onFileSelect}
          depth={depth}
        />
      );
    } else {
      return (
        <FolderItem key={name} folderName={name} depth={depth}>
          {Object.entries(item.children)
            .sort(([a, itemA], [b, itemB]) => {
              // Sort folders first, then files
              if (itemA.type === 'folder' && itemB.type === 'file') return -1;
              if (itemA.type === 'file' && itemB.type === 'folder') return 1;
              return a.localeCompare(b);
            })
            .map(([childName, childItem]) => 
              renderTreeItem(childName, childItem, depth + 1)
            )}
        </FolderItem>
      );
    }
  };

  const fileTree = buildFileTree(projectStructure);

  return (
    <div className="text-sm">
      {Object.entries(fileTree)
        .sort(([a, itemA], [b, itemB]) => {
          // Sort folders first, then files
          if (itemA.type === 'folder' && itemB.type === 'file') return -1;
          if (itemA.type === 'file' && itemB.type === 'folder') return 1;
          return a.localeCompare(b);
        })
        .map(([name, item]) => renderTreeItem(name, item))}
    </div>
  );
}

export default FileTree;
