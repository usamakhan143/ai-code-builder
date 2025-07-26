# AI UI Builder 🚀

A modern, chat-based AI website builder that generates complete websites from natural language descriptions. Built with React, Firebase, and OpenAI.

![AI UI Builder](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-orange?style=for-the-badge&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🤖 AI-Powered Generation
- **Natural Language Input**: Describe your website in plain English
- **GPT-4 Turbo Integration**: Powered by OpenAI's latest model
- **Complete Code Generation**: HTML, CSS, and JavaScript files
- **Responsive Design**: Mobile-first, modern websites

### 💬 Chat-Based Interface
- **Conversational UI**: Chat with AI to build and modify websites
- **Message History**: Persistent conversation across sessions
- **Real-time Updates**: Continuous project improvements
- **Markdown Support**: Rich text formatting in responses

### 🏗️ Professional Workspace
- **Project Management**: Multiple projects with Firebase storage
- **Live Preview**: Instant iframe preview of generated websites
- **File Tracking**: Visual diff of changes and modifications
- **ZIP Export**: Download complete project with all files

### 🔐 Secure Authentication
- **Firebase Auth**: Email/password authentication
- **Protected Routes**: Secure workspace access
- **User Profiles**: Personalized experience

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Mode**: Theme switching with persistence
- **Glassmorphism**: Modern visual effects
- **Professional Polish**: Builder.io-style interface

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-ui-builder.git
cd ai-ui-builder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your API keys
# See ENVIRONMENT_SETUP.md for detailed instructions
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 Environment Configuration

This project requires several environment variables to function properly. 

**📋 [Complete Environment Setup Guide](./ENVIRONMENT_SETUP.md)**

### Quick Setup Checklist
- [ ] OpenAI API key (required)
- [ ] Firebase project configuration (required)
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in your actual values
- [ ] Restart development server

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

### Backend Services
- **Firebase Authentication** - User management
- **Cloud Firestore** - Project metadata storage
- **OpenAI API** - AI-powered website generation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatMessage.jsx
│   ├── FileChanges.jsx
│   ├── ProjectSidebar.jsx
│   └── ThemeToggle.jsx
├── config/             # Configuration files
│   ├── env.js          # Environment variables
│   └── firebase.js     # Firebase setup
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   ├── ProjectContext.jsx
│   └── ThemeContext.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Workspace.jsx
├── services/           # API services
│   ├── openai.js
│   └── zipDownload.js
└── App.jsx             # Main app component
```

## 🎯 Usage Examples

### Creating a Website
```
User: "Create a portfolio website for a photographer with a gallery and contact form"

AI: I'll create a beautiful photography portfolio for you with:
- Hero section with stunning visuals
- Interactive photo gallery
- Professional contact form
- Responsive design for all devices
```

### Modifying a Website
```
User: "Add a blog section to the website"

AI: I've added a blog section with:
- Article listing page
- Individual blog post layout
- Search and category filtering
- SEO-optimized structure
```

## 🔒 Security & Privacy

- **API Keys**: All sensitive data stored in environment variables
- **Client-side AI**: Direct OpenAI integration (consider backend proxy for production)
- **Firebase Security**: Authentication and Firestore rules
- **No Code Storage**: Only project metadata stored in database

## 🚀 Deployment

### Environment Variables for Production

Set these in your hosting platform:

```env
VITE_OPENAI_API_KEY=your_openai_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for GPT-4 API
- [Firebase](https://firebase.google.com) for backend services
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for icons

---

**Built with ❤️ by the AI UI Builder team**
