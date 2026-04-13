import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Register from "@/pages/Register";
import Offres from "@/pages/Offres";
import OffreDetail from "@/pages/OffreDetail";
import CandidatDashboard from "@/pages/CandidatDashboard";
import RecruteurDashboard from "@/pages/RecruteurDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          {/* Skip to content - Accessibility: keyboard users can bypass nav */}
          <a href="#main-content" className="skip-to-content">
            Aller au contenu principal
          </a>

          <Navbar />

          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
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

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
