import { useEffect } from "react";
import BackToTop from "./components/BackToTop";
import Catalogue from "./components/Catalogue";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import LocationMap from "./components/LocationMap";
import Navbar from "./components/Navbar";
import SocialFeed from "./components/SocialFeed";
import TrustBar from "./components/TrustBar";
import { Route, Routes } from "react-router"
import { usePageTracking } from "./hooks/usePageTracking";
import { ensureAnalytics } from "./lib/analytics";

/**
 * Armed here rather than inside usePageTracking so the SDK is live before any
 * component's first fetch reports health. If the arming were left to a component
 * that mounts later, the earliest health_ok of the visit could be dropped.
 */
function App() {
  useEffect(() => {
    ensureAnalytics();
  }, []);
  usePageTracking();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="will-change-transform">
            <Navbar />
            <Hero />
            <TrustBar />
            <Catalogue />
            <Gallery />
            <SocialFeed />
            <LocationMap />
            <Footer />
            <BackToTop />
          </div>
        }
      />
    </Routes>
  );
}

export default App;