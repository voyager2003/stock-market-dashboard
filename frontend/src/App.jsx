import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import StockDetailsPage from './pages/StockDetailsPage'
import UserPanelPage from './pages/UserPanelPage'
import AdminPanelPage from './pages/AdminPanelPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"  element={!user ? <LoginPage />  : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/stock/:symbol" element={<StockDetailsPage />} />
          <Route path="/my-panel"     element={<UserPanelPage />} />
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminPanelPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}