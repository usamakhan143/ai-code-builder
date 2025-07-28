import { useState } from 'react';
import { AlertCircle, ExternalLink, Key } from 'lucide-react';

function OpenAIKeySetup({ onApiKeySet, error }) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      alert('OpenAI API keys start with "sk-". Please check your key.');
      return;
    }

    setIsValidating(true);
    
    // Store the API key temporarily (in a real app, you'd want better security)
    try {
      // Update the environment variable for this session
      window.TEMP_OPENAI_API_KEY = apiKey;
      
      // Notify parent component
      onApiKeySet(apiKey);
      
      alert('API key saved! You can now generate websites.');
    } catch (error) {
      alert('Failed to save API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Key className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          OpenAI API Key Required
        </h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          To generate websites with AI, you need an OpenAI API key. Don't have one?
        </p>
        
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-4"
        >
          <ExternalLink size={14} />
          Get your free OpenAI API key
        </a>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your API key starts with "sk-" and is kept secure in your browser session.
          </p>
        </div>

        <button
          onClick={handleSaveKey}
          disabled={isValidating || !apiKey.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        >
          {isValidating ? 'Saving...' : 'Save API Key'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
          🔒 Privacy & Security
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Your API key is stored locally in your browser and sent directly to OpenAI. 
          We never store or see your API key on our servers.
        </p>
      </div>
    </div>
  );
}

export default OpenAIKeySetup;
