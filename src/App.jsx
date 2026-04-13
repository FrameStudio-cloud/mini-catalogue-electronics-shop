import BackToTop from "./components/BackToTop";
import Catalogue from "./components/Catalogue";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import LocationMap from "./components/LocationMap";
import Navbar from "./components/Navbar";
import SocialFeed from "./components/SocialFeed";
import WhatsAppFloat from "./components/WhatsAppFloat";
import TrustBar from "./components/TrustBar";
import { Route, Routes } from "react-router"
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import ProtectedRoute from "./admin/ProtectedRoute";


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div >
            <Navbar />
            <Hero />
            <TrustBar />
            <Catalogue />
            <SocialFeed />
            <LocationMap />
            <Footer />
            <WhatsAppFloat />
            <BackToTop />
          </div>
        }
      />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
