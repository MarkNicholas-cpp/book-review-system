# Book Review and Blogging Platform

A modern web-based platform for sharing book reviews, writing blogs, and connecting with fellow readers. Built with React, TypeScript, and Vite.

## 🚀 Features

- **Book Reviews**: Create, read, and share detailed book reviews with ratings
- **Blog Posts**: Write and publish blog posts about books, reading, and literature
- **User Authentication**: Secure login and registration system
- **Social Features**: Like, comment, favorite, and follow other users
- **Content Discovery**: Search, filter, and browse reviews and blogs
- **User Profiles**: Manage your profile, view your content, and track statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎯 Demo Accounts

For quick testing, use these demo accounts (all use password: `demo123`):

- **Sarah Johnson**: `sarah@demo.com` / `demo123`
- **Emma Wilson**: `emma@demo.com` / `demo123`
- **Michael Chen**: `michael@demo.com` / `demo123`

## 🛠️ Tech Stack

- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Vite 7.2.4** - Build tool and dev server
- **React Router DOM 7.9.6** - Client-side routing
- **LocalStorage** - Data persistence (static site compatible)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd book-review-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🌐 Deployment to Netlify

This project is configured for static deployment on Netlify:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Redirects**: All routes redirect to `index.html` for SPA routing

### Netlify Deployment Steps:

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`
4. Deploy!

The app uses static data stored in localStorage, so no backend server is required.

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API and data services
├── auth/           # Authentication logic
├── layouts/        # Layout components
└── styles/         # Global styles
```

## 🔑 Key Features Explained

### Static Data Store
The application uses an in-memory data store with localStorage persistence. This allows the app to work as a fully static site without requiring a backend server.

### Demo Users
Three pre-configured demo users are available for testing. All demo accounts use the password `demo123`.

### Data Persistence
- User sessions are stored in localStorage
- User-generated content (reviews, blogs, favorites, follows) persists in localStorage
- Default demo data is always available

## 🎨 Customization

The app uses CSS custom properties for theming. Modify colors, fonts, and spacing in `src/index.css`.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📄 License

This project is open source and available for educational purposes.

---

**Note**: This is a static demo application. All data is stored locally in the browser's localStorage. For production use, you would need to implement a proper backend API.
