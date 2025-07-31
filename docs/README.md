# Student Reflection Portal - GitHub Pages Deployment

This directory contains the Student Reflection Page configured for GitHub Pages deployment.

## 🌐 Live Demo

Once deployed to GitHub Pages, this will be accessible at:
`https://[your-username].github.io/[repository-name]/`

## 📁 Files

- `index.html` - Main reflection portal page
- `styles.css` - Responsive CSS styling with dark/light themes
- `script.js` - Interactive JavaScript with auto-save functionality
- `translations.js` - Internationalization support (English/French)

## 🚀 GitHub Pages Setup Instructions

1. **Push your repository to GitHub**
2. **Go to your repository Settings**
3. **Navigate to "Pages" section**
4. **Select source: "Deploy from a branch"**
5. **Choose branch: "main" or "master"**
6. **Select folder: "/docs"**
7. **Click "Save"**

## ✨ Features

- 📱 **Responsive Design**: Works on all devices
- 🌙 **Dark/Light Themes**: Automatic theme switching
- 🌍 **Internationalization**: English and French support
- 💾 **Auto-save**: Drafts saved automatically to localStorage
- 📊 **Progress Tracking**: Reflection statistics and word count
- ⌨️ **Keyboard Shortcuts**: Ctrl+S to save, Escape to close modals
- ♿ **Accessibility**: Full keyboard navigation and screen reader support

## 🎯 Usage

Students can:
- Answer weekly reflection questions
- Track their learning progress
- Save drafts automatically
- Export their reflections
- Switch between English and French
- View reflection statistics

## 🔧 Customization

The page can be customized by editing:
- `translations.js` - Add more languages or modify text
- `styles.css` - Adjust colors, fonts, and layout
- `script.js` - Add new features or modify functionality

## 📝 Integration with Backend

This static page can work independently or integrate with the Course Management Platform backend API for:
- User authentication
- Saving reflections to database
- Retrieving previous reflections
- Analytics and reporting

## 🛠 Development

To run locally:
1. Open `index.html` in a web browser
2. Or serve with a simple HTTP server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

## 📞 Support

For technical support or questions about the Course Management Platform, please refer to the main project documentation.
