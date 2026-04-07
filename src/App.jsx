import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminPostEditor from './pages/AdminPostEditor'
import ProtectedRoute from './components/common/ProtectedRoute'
import './styles/global.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/new" element={
            <ProtectedRoute>
              <AdminPostEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit/:id" element={
            <ProtectedRoute>
              <AdminPostEditor />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
