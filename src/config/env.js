// ===========================================
// Environment Configuration
// ===========================================
// Centralized configuration for all environment variables

const config = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },

  // Firebase Configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // Application Configuration
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    name: import.meta.env.VITE_APP_NAME || 'AI UI Builder',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // API Configuration
  api: {
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  },

  // Development flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validation function to check if required environment variables are set
export const validateConfig = () => {
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0 && config.isProduction) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (missingVars.length > 0 && config.isDevelopment) {
    console.warn('Missing environment variables (using defaults):', missingVars);
  }
};

// Log configuration on development
if (config.isDevelopment && config.app.debugMode) {
  console.log('🔧 Configuration loaded:', {
    environment: config.app.env,
    version: config.app.version,
    firebase: {
      projectId: config.firebase.projectId,
      authDomain: config.firebase.authDomain,
    },
    openai: {
      hasApiKey: !!config.openai.apiKey,
    },
  });
}

export default config;
