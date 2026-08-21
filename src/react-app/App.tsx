import { HashRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/context/AuthContext";
import HomePage from "@/react-app/pages/Home";
import ProfilePage from "@/react-app/pages/Profile";
import LoginPage from "@/react-app/pages/Login";
import ResetPasswordPage from "@/react-app/pages/ResetPassword";
import NotificationsPage from "@/react-app/pages/Notifications";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import { BottomNav } from "@/react-app/components/BottomNav";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <BottomNav />
      </Router>
    </AuthProvider>
  );
}
