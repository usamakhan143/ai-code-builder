import { User, Sparkles, AlertCircle, Download, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatMessage({ message }) {
  const isUser = message.type === 'user';
  const isError = message.isError;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
          : isError
            ? 'bg-red-500'
            : 'bg-gradient-ai'
      }`}>
        {isUser ? (
          <User className="text-white" size={16} />
        ) : isError ? (
          <AlertCircle className="text-white" size={16} />
        ) : (
          <Sparkles className="text-white" size={16} />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-3xl ${isUser ? 'text-right' : ''}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message.sender}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={`rounded-lg p-3 shadow-sm border ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-200'
            : isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !mt-2 !mb-2"
                        {...props}
                      >
                        {String(children).replace(/\\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Generated Code Preview */}
        {message.generatedCode && !isUser && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Website
              </h4>
              <div className="flex gap-2">
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                  <Eye size={12} />
                  Preview
                </button>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {message.generatedCode.description}
            </p>
            
            {/* Mini Preview */}
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 border-b border-gray-200 dark:border-gray-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">index.html</span>
              </div>
              <iframe
                srcDoc={message.generatedCode.html}
                className="w-full h-32 border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Generated Website Mini Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
