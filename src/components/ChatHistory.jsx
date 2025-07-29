import { MessageSquare, Clock, User, Bot, FileText, Layers, Zap } from 'lucide-react';

function ChatHistory({ chatHistory, currentProject, onMessageClick }) {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (message) => {
    if (message.type === 'user') return User;
    if (message.isChunked) return Layers;
    if (message.isContextual) return Zap;
    if (message.generatedCode) return FileText;
    return Bot;
  };

  const getMessageTypeColor = (message) => {
    if (message.type === 'user') return 'text-blue-600 dark:text-blue-400';
    if (message.isError) return 'text-red-600 dark:text-red-400';
    if (message.isChunked) return 'text-purple-600 dark:text-purple-400';
    if (message.isContextual) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const groupMessagesByTime = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupLabel;
      if (messageDate.toDateString() === today.toDateString()) {
        groupLabel = 'Today';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        groupLabel = 'Yesterday';
      } else {
        groupLabel = messageDate.toLocaleDateString();
      }
      
      if (!currentGroup || currentGroup.label !== groupLabel) {
        currentGroup = { label: groupLabel, messages: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push({ ...message, index });
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByTime(chatHistory);

  if (!chatHistory || chatHistory.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No conversation history</p>
          <p className="text-xs mt-1">Start chatting to see your history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare size={16} />
          Chat History
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {chatHistory.length} messages in {currentProject?.name || 'this project'}
        </p>
      </div>

      {/* Message Groups */}
      <div className="flex-1 overflow-y-auto">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {/* Date Header */}
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              {group.label}
            </div>

            {/* Messages in Group */}
            <div className="space-y-1 p-2">
              {group.messages.map((message) => {
                const Icon = getMessageIcon(message);
                const colorClass = getMessageTypeColor(message);
                
                return (
                  <button
                    key={message.index}
                    onClick={() => onMessageClick?.(message)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 ${colorClass}`}>
                        <Icon size={14} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {message.sender === 'AI Assistant' ? 'Assistant' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {message.content.substring(0, 100)}
                          {message.content.length > 100 ? '...' : ''}
                        </p>

                        {/* Message Type Indicators */}
                        <div className="flex gap-1 mt-2">
                          {message.isReactProject && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                              React
                            </span>
                          )}
                          {message.isChunked && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                              Chunked
                            </span>
                          )}
                          {message.isContextual && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                              Context
                            </span>
                          )}
                          {message.requestType && message.requestType !== 'new_project' && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                              {message.requestType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Total Messages:</span>
            <span>{chatHistory.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Generations:</span>
            <span>{chatHistory.filter(m => m.generatedCode).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Context-Aware:</span>
            <span>{chatHistory.filter(m => m.isContextual).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatHistory;
