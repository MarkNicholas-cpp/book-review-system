import { Routes, Route } from 'react-router-dom'
import './App.css'
import './styles/layout.css'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ReviewsListPage from './pages/ReviewsListPage'
import ReviewDetailsPage from './pages/ReviewDetailsPage'
import CreateReviewPage from './pages/CreateReviewPage'
import BlogsListPage from './pages/BlogsListPage'
import BlogDetailsPage from './pages/BlogDetailsPage'
import CreateBlogPage from './pages/CreateBlogPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      {/* Auth pages without layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Public pages with layout */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/reviews" element={<MainLayout><ReviewsListPage /></MainLayout>} />
      <Route path="/reviews/:id" element={<MainLayout><ReviewDetailsPage /></MainLayout>} />
      <Route path="/blogs" element={<MainLayout><BlogsListPage /></MainLayout>} />
      <Route path="/blogs/:id" element={<MainLayout><BlogDetailsPage /></MainLayout>} />
      
      {/* Protected routes */}
      <Route 
        path="/write-review" 
        element={
          <MainLayout>
            <ProtectedRoute>
              <CreateReviewPage />
            </ProtectedRoute>
          </MainLayout>
        } 
      />
      <Route 
        path="/write-blog" 
        element={
          <MainLayout>
            <ProtectedRoute>
              <CreateBlogPage />
            </ProtectedRoute>
          </MainLayout>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <MainLayout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </MainLayout>
        } 
      />
    </Routes>
  )
}

export default App
