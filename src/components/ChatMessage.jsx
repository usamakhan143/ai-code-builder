import { User, Sparkles, AlertCircle, Download, Eye, WifiOff } from 'lucide-react';
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
    <div className={`flex items-start gap-2 sm:gap-3 w-full px-1 sm:px-0 ${isUser ? 'flex-row-reverse' : ''}`}>
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
      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-1 sm:gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {message.sender}
          </span>
          {message.isOffline && !isUser && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
              <WifiOff size={10} />
              <span>Offline</span>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={`rounded-lg p-2 sm:p-3 shadow-sm border w-full break-words overflow-hidden ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-200'
            : isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
        }`}>
          {isUser ? (
            <p className="text-xs sm:text-sm leading-relaxed text-left break-words overflow-wrap">{message.content}</p>
          ) : (
            <div className="text-xs sm:text-sm leading-relaxed">
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
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {message.isReactProject ? 'React Project' : 'Website'}
                </h4>
                {message.isReactProject && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    React
                  </span>
                )}
                {message.isChunked && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    Chunked
                  </span>
                )}
                {message.isContextual && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Context-Aware
                  </span>
                )}
                {message.requestType && message.requestType !== 'new_project' && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {message.requestType}
                  </span>
                )}
                {message.isOffline && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                    Demo Template
                  </span>
                )}
              </div>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                  <Eye size={10} className="sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                  <Download size={10} className="sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {message.generatedCode.description}
              </p>
              {message.isReactProject && message.generatedCode.pages && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.generatedCode.pages.length} pages
                </span>
              )}
            </div>

            {message.isReactProject && message.generatedCode.features && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {message.generatedCode.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                      {feature}
                    </span>
                  ))}
                  {message.generatedCode.features.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{message.generatedCode.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Mini Preview */}
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 border-b border-gray-200 dark:border-gray-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {message.isReactProject ? 'React App' : 'index.html'}
                </span>
              </div>
              <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                {message.isReactProject ? (
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">React Project</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {message.generatedCode.pages?.join(', ') || 'Multi-page app'}
                    </div>
                  </div>
                ) : (
                  <iframe
                    srcDoc={message.generatedCode.html}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Generated Website Mini Preview"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
