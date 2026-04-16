import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Faqs from "@/pages/Faqs";
import Offres from "@/pages/Offres";
import OffreDetail from "@/pages/OffreDetail";
import CandidatDashboard from "@/pages/CandidatDashboard";
import RecruteurDashboard from "@/pages/RecruteurDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

function AppLayout() {
  const { t } = useLanguage();
  const location = useLocation();
  const useMinimalFooter = location.pathname === "/login"
    || location.pathname === "/register"
    || location.pathname === "/reset-password";

  return (
    <div className="min-h-screen flex flex-col [--navbar-height:4rem]">
      {/* Skip to content - Accessibility: keyboard users can bypass nav */}
      <a href="#main-content" className="skip-to-content">
        {t("app.skipToContent")}
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fqas" element={<Faqs />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/offres" element={<Offres />} />
          <Route path="/offres/:id" element={<OffreDetail />} />
          <Route
            path="/candidat"
            element={
              <ProtectedRoute roles={["candidat"]}>
                <CandidatDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruteur"
            element={
              <ProtectedRoute roles={["recruteur"]}>
                <RecruteurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <FloatingActions />

      {!useMinimalFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
