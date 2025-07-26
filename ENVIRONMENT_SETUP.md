# Environment Setup Guide

This guide will help you set up the required environment variables for the AI UI Builder application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values in the `.env` file**

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### 🤖 OpenAI Configuration

#### `VITE_OPENAI_API_KEY`
- **Required:** Yes
- **Description:** Your OpenAI API key for website generation
- **How to get:** 
  1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
  2. Create a new API key
  3. Copy the key (starts with `sk-`)
- **Example:** `sk-1234567890abcdef1234567890abcdef12345678`

### 🔥 Firebase Configuration

#### `VITE_FIREBASE_API_KEY`
- **Required:** Yes
- **Description:** Firebase Web API key
- **How to get:** Firebase Console > Project Settings > General > Web apps > Config

#### `VITE_FIREBASE_AUTH_DOMAIN`
- **Required:** Yes
- **Description:** Firebase Auth domain
- **Format:** `your-project-id.firebaseapp.com`

#### `VITE_FIREBASE_PROJECT_ID`
- **Required:** Yes
- **Description:** Your Firebase project ID
- **How to get:** Firebase Console > Project Settings > General

#### `VITE_FIREBASE_STORAGE_BUCKET`
- **Required:** No
- **Description:** Firebase Storage bucket
- **Format:** `your-project-id.appspot.com`

#### `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Required:** No
- **Description:** Firebase Cloud Messaging sender ID
- **Format:** Numeric string (e.g., `123456789012`)

#### `VITE_FIREBASE_APP_ID`
- **Required:** No
- **Description:** Firebase app ID
- **Format:** `1:123456789012:web:abcdef1234567890abcdef`

## Firebase Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"

### 3. Set up Firestore

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (you can secure it later)
4. Select a location

### 4. Get Configuration Values

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click on the web app or create one
4. Copy the config values to your `.env` file

## Optional Configuration

### Application Settings
- `VITE_APP_ENV`: Application environment (development/staging/production)
- `VITE_APP_VERSION`: Application version
- `VITE_APP_NAME`: Application display name
- `VITE_DEBUG_MODE`: Enable debug logging (true/false)

### API Settings
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (default: 30000)
- `VITE_MAX_FILE_SIZE`: Maximum file upload size in bytes (default: 10485760)

## Security Best Practices

### 🔒 Environment Variables Security

1. **Never commit `.env` files to version control**
   - The `.env` file is already in `.gitignore`
   - Only commit `.env.example` with placeholder values

2. **Use different configurations for different environments**
   - Development: `.env.local` or `.env.development`
   - Production: Set variables in your hosting platform

3. **Limit API key permissions**
   - For OpenAI: Set usage limits and monitor usage
   - For Firebase: Configure security rules properly

### 🚀 Production Deployment

For production deployment, set environment variables in your hosting platform:

#### Vercel
```bash
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_FIREBASE_API_KEY
# ... other variables
```

#### Netlify
1. Go to Site settings > Environment variables
2. Add each variable manually

#### Other platforms
Refer to your hosting platform's documentation for setting environment variables.

## Troubleshooting

### Common Issues

#### "Missing required environment variables"
- Make sure you've copied `.env.example` to `.env`
- Check that all required variables are set
- Restart the development server after making changes

#### "OpenAI API Error"
- Verify your API key is correct
- Check that you have sufficient credits in your OpenAI account
- Ensure the API key has the necessary permissions

#### "Firebase configuration error"
- Double-check all Firebase configuration values
- Make sure Authentication and Firestore are properly enabled
- Verify your Firebase project is active

#### "Environment variables not loading"
- Make sure variable names start with `VITE_`
- Restart the development server after changes
- Check for typos in variable names

### Debug Mode

Enable debug mode to see configuration details:

```env
VITE_DEBUG_MODE=true
```

This will log configuration information to the browser console (development only).

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Restart the development server
4. Check Firebase and OpenAI service status pages

## Example .env File

```env
# OpenAI
VITE_OPENAI_API_KEY=sk-your-actual-openai-key-here

# Firebase
VITE_FIREBASE_API_KEY=AIzaSy-your-actual-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Optional
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```
