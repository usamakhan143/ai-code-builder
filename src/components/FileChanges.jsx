import { useState } from 'react';
import { 
  FileText, 
  FilePlus, 
  FileEdit, 
  Code, 
  Eye, 
  Download,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

function FileChanges({ generatedCode }) {
  const [expandedFiles, setExpandedFiles] = useState(new Set(['index.html']));
  const [copiedFile, setCopiedFile] = useState(null);

  const toggleFile = (fileName) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName);
    } else {
      newExpanded.add(fileName);
    }
    setExpandedFiles(newExpanded);
  };

  const copyToClipboard = async (content, fileName) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getLanguage = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'jsx';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'tsx';
      case 'json':
        return 'json';
      default:
        return 'text';
    }
  };

  if (!generatedCode) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No files generated
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a website to see the file structure and code here.
          </p>
        </div>
      </div>
    );
  }

  const files = [];

  // Add HTML file
  if (generatedCode.html) {
    files.push({
      name: 'index.html',
      type: 'created',
      content: generatedCode.html,
      size: new Blob([generatedCode.html]).size
    });
  }

  // Add CSS file if separate
  if (generatedCode.css) {
    files.push({
      name: 'styles.css',
      type: 'created',
      content: generatedCode.css,
      size: new Blob([generatedCode.css]).size
    });
  }

  // Add JS file if separate
  if (generatedCode.js) {
    files.push({
      name: 'script.js',
      type: 'created',
      content: generatedCode.js,
      size: new Blob([generatedCode.js]).size
    });
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName, type) => {
    if (type === 'created') {
      return <FilePlus className="text-green-500" size={16} />;
    } else if (type === 'modified') {
      return <FileEdit className="text-blue-500" size={16} />;
    }
    return <FileText className="text-gray-500" size={16} />;
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Generated Files
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {files.length} file{files.length !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {files.map((file) => (
            <div key={file.name} className="border-b border-gray-200 dark:border-gray-700">
              {/* File Header */}
              <div 
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => toggleFile(file.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      {expandedFiles.has(file.name) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {getFileIcon(file.name, file.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {file.name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          file.type === 'created' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {file.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.content, file.name);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedFile === file.name ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* File Content */}
              {expandedFiles.has(file.name) && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-800">
                    <SyntaxHighlighter
                      language={getLanguage(file.name)}
                      style={tomorrow}
                      className="!m-0 !bg-transparent text-sm"
                      customStyle={{
                        background: 'transparent',
                        padding: '1rem',
                        margin: 0
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {file.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download size={16} />
            Download All Files
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileChanges;
